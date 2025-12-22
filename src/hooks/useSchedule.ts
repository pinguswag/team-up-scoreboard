import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { format, addDays } from 'date-fns';

export type ScheduleItem = {
  league: string;
  startTime: string | null;
  home: { code: string | number | null; name: string | null };
  away: { code: string | number | null; name: string | null };
};

type ScheduleResponse = {
  league: string;
  date: string;
  items: Array<{
    league?: string;
    time?: { timestamp?: number; timezone?: string };
    teams?: {
      home?: { id?: number; name?: string; code?: string };
      away?: { id?: number; name?: string; code?: string };
    };
    fixture?: {
      timestamp?: number;
      date?: string;
    };
  }>;
};

type FavoriteTeam = {
  team_name: string;
  team_code: string;
  league: string;
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

// Convert UTC timestamp to KST formatted time string
const formatKSTTime = (timestamp?: number, dateStr?: string): string | null => {
  if (timestamp) {
    // timestamp is in seconds, convert to milliseconds and add 9 hours for KST
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

// Normalize API response items to our ScheduleItem format
const normalizeItem = (item: ScheduleResponse['items'][0], league: string): ScheduleItem => {
  const timestamp = item.time?.timestamp || item.fixture?.timestamp;
  const dateStr = item.fixture?.date;
  
  return {
    league: item.league || league,
    startTime: formatKSTTime(timestamp, dateStr),
    home: {
      code: item.teams?.home?.code || item.teams?.home?.id || null,
      name: item.teams?.home?.name || null,
    },
    away: {
      code: item.teams?.away?.code || item.teams?.away?.id || null,
      name: item.teams?.away?.name || null,
    },
  };
};

export const useSchedule = (favoriteTeams: FavoriteTeam[]) => {
  const [todayGames, setTodayGames] = useState<ScheduleItem[]>([]);
  const [weekGames, setWeekGames] = useState<{ date: string; games: ScheduleItem[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  
  // Memory cache to prevent duplicate calls within component lifecycle
  const cacheRef = useRef<Map<string, ScheduleItem[]>>(new Map());

  const getCacheKey = (league: string, date: string) => `${league}-${date}`;

  const fetchScheduleForDate = async (league: string, date: string): Promise<{ items: ScheduleItem[]; log: DebugLog }> => {
    const cacheKey = getCacheKey(league, date);
    
    // Check cache first
    if (cacheRef.current.has(cacheKey)) {
      const cachedItems = cacheRef.current.get(cacheKey)!;
      if (isDev) {
        console.log(`[Cache Hit] ${league} ${date}: ${cachedItems.length} items`);
      }
      return {
        items: cachedItems,
        log: { league, date, success: true, itemCount: cachedItems.length }
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke<ScheduleResponse>('rapid-endpoint', {
        body: { league, date },
      });

      if (error) {
        console.error(`[Error] ${league} ${date}:`, error);
        return {
          items: [],
          log: { league, date, success: false, itemCount: 0, error: error.message }
        };
      }

      // Normalize items from API response
      const rawItems = data?.items || [];
      const items = rawItems.map(item => normalizeItem(item, league));
      
      // Store in cache
      cacheRef.current.set(cacheKey, items);
      
      if (isDev) {
        console.log(`[Fetched] ${league} ${date}: ${items.length} items`);
      }

      return {
        items,
        log: { league, date, success: true, itemCount: items.length }
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[Failed] ${league} ${date}:`, err);
      return {
        items: [],
        log: { league, date, success: false, itemCount: 0, error: errorMessage }
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
        
        // Priority 1: Exact code match
        if (homeCode === teamCode || awayCode === teamCode) return true;
        
        // Priority 2: Exact name match
        if (homeName === teamName || awayName === teamName) return true;
        
        // Priority 3: Partial name match (contains)
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
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');

      // Fetch today's games for all leagues
      const todayResults = await Promise.all(
        LEAGUES.map((league) => fetchScheduleForDate(league, todayStr))
      );
      
      const allTodayGames = todayResults.flatMap(r => r.items);
      todayResults.forEach(r => allLogs.push(r.log));
      
      const filteredTodayGames = filterByFavoriteTeams(allTodayGames);
      setTodayGames(filteredTodayGames);

      // Fetch this week's games (7 days)
      const weekData: { date: string; games: ScheduleItem[] }[] = [];
      
      for (let i = 0; i < 7; i++) {
        const date = addDays(today, i);
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

      // Debug summary
      if (isDev) {
        const successCount = allLogs.filter(l => l.success).length;
        const failCount = allLogs.filter(l => !l.success).length;
        const totalItems = allLogs.reduce((sum, l) => sum + l.itemCount, 0);
        const failedRequests = allLogs.filter(l => !l.success).map(l => `${l.league}/${l.date}`);
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

  // Clear cache on unmount
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
    refetch: fetchSchedules,
  };
};
