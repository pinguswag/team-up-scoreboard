import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { format, addDays } from 'date-fns';

export type ScheduleItem = {
  league: string;
  startTime: string | null;
  home: { code: string | number | null; name: string | null };
  away: { code: string | number | null; name: string | null };
  // Raw data for debugging
  _raw?: unknown;
};

type ScheduleResponse = {
  league: string;
  date: string;
  items: unknown[];
};

type FavoriteTeam = {
  team_name: string;
  team_code: string;
  league: string;
};

export type DebugInfo = {
  lastCallLeague: string;
  lastCallDate: string;
  lastCallSuccess: boolean;
  lastCallError: string | null;
  lastCallItemsCount: number;
  lastCallFirstItem: string | null;
  rawItems: unknown[];
};

type DebugLog = {
  league: string;
  date: string;
  success: boolean;
  itemCount: number;
  error?: string;
};

const LEAGUES = ['NBA', 'EPL', 'NFL', 'MLB'] as const;
const isDev = import.meta.env.DEV;

// DEMO MODE: Fixed date for 2022 data
const DEMO_MODE = true;
const DEMO_BASE_DATE = '2022-12-22';

// Convert UTC timestamp to KST formatted time string
const formatKSTTime = (timestamp?: number, dateStr?: string): string | null => {
  if (timestamp) {
    const kstDate = new Date(timestamp * 1000);
    const hours = kstDate.getUTCHours() + 9;
    const adjustedHours = hours >= 24 ? hours - 24 : hours;
    const minutes = kstDate.getUTCMinutes();
    return `${String(adjustedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  if (dateStr && dateStr.includes('T')) {
    try {
      const date = new Date(dateStr);
      const hours = date.getUTCHours() + 9;
      const adjustedHours = hours >= 24 ? hours - 24 : hours;
      const minutes = date.getUTCMinutes();
      return `${String(adjustedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    } catch {
      return null;
    }
  }
  return null;
};

// Normalize API response items - handles various API structures
const normalizeItem = (item: unknown, league: string): ScheduleItem => {
  const raw = item as Record<string, unknown>;
  
  // Try different API response structures
  const time = raw.time as Record<string, unknown> | undefined;
  const fixture = raw.fixture as Record<string, unknown> | undefined;
  const teams = raw.teams as Record<string, Record<string, unknown>> | undefined;
  
  const timestamp = (time?.timestamp || fixture?.timestamp) as number | undefined;
  const dateStr = (fixture?.date || raw.date) as string | undefined;
  
  return {
    league: (raw.league as string) || league,
    startTime: formatKSTTime(timestamp, dateStr),
    home: {
      code: (teams?.home?.code as string | number) || (teams?.home?.id as string | number) || null,
      name: (teams?.home?.name as string) || null,
    },
    away: {
      code: (teams?.away?.code as string | number) || (teams?.away?.id as string | number) || null,
      name: (teams?.away?.name as string) || null,
    },
    _raw: raw, // Keep raw for debugging
  };
};

export const useSchedule = (favoriteTeams: FavoriteTeam[]) => {
  const [todayGames, setTodayGames] = useState<ScheduleItem[]>([]);
  const [weekGames, setWeekGames] = useState<{ date: string; games: ScheduleItem[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  
  const cacheRef = useRef<Map<string, ScheduleItem[]>>(new Map());

  const getCacheKey = (league: string, date: string) => `${league}-${date}`;

  const fetchScheduleForDate = async (league: string, date: string): Promise<{ items: ScheduleItem[]; log: DebugLog; rawItems: unknown[] }> => {
    const cacheKey = getCacheKey(league, date);
    
    if (cacheRef.current.has(cacheKey)) {
      const cachedItems = cacheRef.current.get(cacheKey)!;
      console.log(`[Cache Hit] ${league} ${date}: ${cachedItems.length} items`);
      return {
        items: cachedItems,
        log: { league, date, success: true, itemCount: cachedItems.length },
        rawItems: cachedItems.map(i => i._raw)
      };
    }

    try {
      console.log(`[Calling] rapid-endpoint with league=${league}, date=${date}`);
      
      const { data, error } = await supabase.functions.invoke<ScheduleResponse>('rapid-endpoint', {
        body: { league, date },
      });

      // DEBUG: Log full response
      console.log(`[Response] ${league} ${date}:`, { data, error });

      if (error) {
        console.error(`[Error] ${league} ${date}:`, error);
        setDebugInfo({
          lastCallLeague: league,
          lastCallDate: date,
          lastCallSuccess: false,
          lastCallError: error.message,
          lastCallItemsCount: 0,
          lastCallFirstItem: null,
          rawItems: []
        });
        return {
          items: [],
          log: { league, date, success: false, itemCount: 0, error: error.message },
          rawItems: []
        };
      }

      const rawItems = data?.items || [];
      const items = rawItems.map(item => normalizeItem(item, league));
      
      // DEBUG: Update debug info
      setDebugInfo({
        lastCallLeague: league,
        lastCallDate: date,
        lastCallSuccess: true,
        lastCallError: null,
        lastCallItemsCount: rawItems.length,
        lastCallFirstItem: rawItems.length > 0 ? JSON.stringify(rawItems[0]).slice(0, 500) : null,
        rawItems: rawItems
      });
      
      cacheRef.current.set(cacheKey, items);
      
      console.log(`[Fetched] ${league} ${date}: ${items.length} items`);
      console.log(`[First Item]`, rawItems[0]);

      return {
        items,
        log: { league, date, success: true, itemCount: items.length },
        rawItems
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[Failed] ${league} ${date}:`, err);
      setDebugInfo({
        lastCallLeague: league,
        lastCallDate: date,
        lastCallSuccess: false,
        lastCallError: errorMessage,
        lastCallItemsCount: 0,
        lastCallFirstItem: null,
        rawItems: []
      });
      return {
        items: [],
        log: { league, date, success: false, itemCount: 0, error: errorMessage },
        rawItems: []
      };
    }
  };

  const filterByFavoriteTeams = useCallback((games: ScheduleItem[]): ScheduleItem[] => {
    if (favoriteTeams.length === 0) return [];

    return games.filter((game) => {
      const homeCode = String(game.home.code || '').trim().toLowerCase();
      const awayCode = String(game.away.code || '').trim().toLowerCase();
      const homeName = (game.home.name || '').trim().toLowerCase();
      const awayName = (game.away.name || '').trim().toLowerCase();

      return favoriteTeams.some((team) => {
        if (game.league !== team.league) return false;
        
        const teamCode = team.team_code.trim().toLowerCase();
        const teamName = team.team_name.trim().toLowerCase();
        
        // Code matching first
        if (homeCode === teamCode || awayCode === teamCode) return true;
        // Exact name match
        if (homeName === teamName || awayName === teamName) return true;
        // Partial match
        return (
          homeName.includes(teamName) || 
          awayName.includes(teamName) ||
          teamName.includes(homeName) ||
          teamName.includes(awayName)
        );
      });
    });
  }, [favoriteTeams]);

  const fetchSchedules = useCallback(async () => {
    if (favoriteTeams.length === 0) {
      setTodayGames([]);
      setWeekGames([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const allLogs: DebugLog[] = [];

    try {
      // DEMO MODE: Use fixed date instead of real today
      const todayStr = DEMO_MODE ? DEMO_BASE_DATE : format(new Date(), 'yyyy-MM-dd');
      
      if (isDev) {
        console.log(`[Schedule] DEMO MODE: ${DEMO_MODE}, Base Date: ${todayStr}`);
      }

      // Fetch today's games for all leagues
      const todayResults = await Promise.all(
        LEAGUES.map((league) => fetchScheduleForDate(league, todayStr))
      );
      
      const allTodayGames = todayResults.flatMap(r => r.items);
      todayResults.forEach(r => allLogs.push(r.log));
      
      if (isDev) {
        console.log(`[Schedule] Total today games before filter: ${allTodayGames.length}`);
      }
      
      const filteredTodayGames = filterByFavoriteTeams(allTodayGames);
      if (isDev) {
        console.log(`[Schedule] Today games after filter: ${filteredTodayGames.length}`);
      }
      
      setTodayGames(filteredTodayGames);

      // Fetch this week's games (7 days from demo date)
      const weekData: { date: string; games: ScheduleItem[] }[] = [];
      const baseDate = DEMO_MODE ? new Date('2022-12-22') : new Date();
      
      for (let i = 0; i < 7; i++) {
        const date = addDays(baseDate, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        const dayResults = await Promise.all(
          LEAGUES.map((league) => fetchScheduleForDate(league, dateStr))
        );
        
        const allDayGames = dayResults.flatMap(r => r.items);
        dayResults.forEach(r => allLogs.push(r.log));
        
        const filteredDayGames = filterByFavoriteTeams(allDayGames);
        
        if (filteredDayGames.length > 0) {
          weekData.push({
            date: dateStr,
            games: filteredDayGames.sort((a, b) => 
              (a.startTime || '').localeCompare(b.startTime || '')
            ),
          });
        }
      }
      
      setWeekGames(weekData);
      setDebugLogs(allLogs);

      // Debug summary (dev only)
      if (isDev) {
        const successCount = allLogs.filter(l => l.success).length;
        const failCount = allLogs.filter(l => !l.success).length;
        const totalItems = allLogs.reduce((sum, l) => sum + l.itemCount, 0);
        const failedRequests = allLogs.filter(l => !l.success).map(l => `${l.league}/${l.date}: ${l.error}`);
        console.log(`[Schedule Summary] Success: ${successCount}, Failed: ${failCount}, Total Items: ${totalItems}`);
        console.log(`[Filtered] Today: ${filteredTodayGames.length}, Week: ${weekData.reduce((sum, d) => sum + d.games.length, 0)}`);
        if (failedRequests.length > 0) {
          console.log(`[Failed Requests]`, failedRequests);
        }
      }

    } catch (err) {
      console.error('Failed to fetch schedules:', err);
      setError('일정 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [favoriteTeams, filterByFavoriteTeams]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  useEffect(() => {
    return () => {
      cacheRef.current.clear();
    };
  }, []);

  return {
    todayGames,
    weekGames,
    loading,
    error,
    debugLogs,
    debugInfo,
    refetch: fetchSchedules,
    demoMode: DEMO_MODE,
    demoDate: DEMO_BASE_DATE,
  };
};
