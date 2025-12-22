import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { format, addDays } from 'date-fns';

export type ScheduleItem = {
  league: string;
  startTime: string;
  home: { code: string | number; name: string };
  away: { code: string | number; name: string };
};

type ScheduleResponse = {
  league: string;
  date: string;
  items: ScheduleItem[];
};

type FavoriteTeam = {
  team_name: string;
  league: string;
};

const LEAGUES = ['NBA', 'EPL', 'NFL', 'MLB'] as const;

export const useSchedule = (favoriteTeams: FavoriteTeam[]) => {
  const [todayGames, setTodayGames] = useState<ScheduleItem[]>([]);
  const [weekGames, setWeekGames] = useState<{ date: string; games: ScheduleItem[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScheduleForDate = async (league: string, date: string): Promise<ScheduleItem[]> => {
    try {
      const { data, error } = await supabase.functions.invoke<ScheduleResponse>('schedule', {
        method: 'GET',
        body: { league, date },
      });

      if (error) {
        console.error(`Error fetching ${league} schedule for ${date}:`, error);
        return [];
      }

      return data?.items || [];
    } catch (err) {
      console.error(`Failed to fetch ${league} schedule for ${date}:`, err);
      return [];
    }
  };

  const filterByFavoriteTeams = useCallback((games: ScheduleItem[]): ScheduleItem[] => {
    if (favoriteTeams.length === 0) return [];

    return games.filter((game) =>
      favoriteTeams.some(
        (team) =>
          (game.home.name.includes(team.team_name) || 
           game.away.name.includes(team.team_name) ||
           team.team_name.includes(game.home.name) ||
           team.team_name.includes(game.away.name)) &&
          game.league === team.league
      )
    );
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

    try {
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');

      // Fetch today's games for all leagues
      const todayPromises = LEAGUES.map((league) => fetchScheduleForDate(league, todayStr));
      const todayResults = await Promise.all(todayPromises);
      const allTodayGames = todayResults.flat();
      const filteredTodayGames = filterByFavoriteTeams(allTodayGames);
      setTodayGames(filteredTodayGames);

      // Fetch this week's games (7 days)
      const weekData: { date: string; games: ScheduleItem[] }[] = [];
      
      for (let i = 0; i < 7; i++) {
        const date = addDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        const dayPromises = LEAGUES.map((league) => fetchScheduleForDate(league, dateStr));
        const dayResults = await Promise.all(dayPromises);
        const allDayGames = dayResults.flat();
        const filteredDayGames = filterByFavoriteTeams(allDayGames);
        
        if (filteredDayGames.length > 0) {
          weekData.push({
            date: dateStr,
            games: filteredDayGames.sort((a, b) => a.startTime.localeCompare(b.startTime)),
          });
        }
      }
      
      setWeekGames(weekData);
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
      setError('경기 일정을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, [favoriteTeams, filterByFavoriteTeams]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return {
    todayGames,
    weekGames,
    loading,
    error,
    refetch: fetchSchedules,
  };
};
