import { useState, useEffect, useCallback } from 'react';
import { supabase, type FavoriteTeam } from '@/lib/supabase';
import { League, TEAMS, LEAGUE_STATUS } from '@/data/teams';

export type ScheduleGame = {
  id: string;
  league: League;
  date: string;
  time?: string;
  day?: string;
  home_team: string;
  away_team: string;
};

export const useSchedule = (favoriteTeams: FavoriteTeam[], activeLeague: League) => {
  const [games, setGames] = useState<ScheduleGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = useCallback(async () => {
    // 리그가 준비중이면 빈 배열
    if (!LEAGUE_STATUS[activeLeague].active) {
      setGames([]);
      setLoading(false);
      return;
    }

    // 해당 리그의 선택된 팀들
    const selectedTeams = favoriteTeams.filter(t => t.league === activeLeague);
    
    if (selectedTeams.length === 0) {
      setGames([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 팀 이름 목록 (fullName 기준)
      const teamFullNames = selectedTeams.map(t => {
        const team = TEAMS[activeLeague].find(tm => tm.code === t.team_code);
        return team?.fullName || t.team_name;
      });

      // 테이블명 (epl/nfl)
      const tableName = activeLeague.toLowerCase();

      // 쿼리: home_team 또는 away_team이 선택된 팀인 경기
      const { data, error: queryError } = await supabase
        .from(tableName)
        .select('*')
        .or(
          teamFullNames.map(name => `home_team.eq.${name}`).join(',') + ',' +
          teamFullNames.map(name => `away_team.eq.${name}`).join(',')
        )
        .order('date', { ascending: true });

      if (queryError) {
        console.error('Schedule fetch error:', queryError);
        setError(queryError.message);
        setGames([]);
      } else {
        // 데이터 변환 및 정렬
        const formattedGames: ScheduleGame[] = (data || []).map((row: any) => ({
          id: row.id || `${row.date}-${row.home_team}-${row.away_team}`,
          league: activeLeague,
          date: row.date,
          time: row.time || undefined,
          day: row.day || undefined,
          home_team: row.home_team,
          away_team: row.away_team,
        }));

        // 정렬: date 오름차순, time 오름차순 (없으면 뒤로)
        formattedGames.sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare !== 0) return dateCompare;
          
          if (!a.time && !b.time) return 0;
          if (!a.time) return 1;
          if (!b.time) return -1;
          return a.time.localeCompare(b.time);
        });

        setGames(formattedGames);
      }
    } catch (err) {
      console.error('Schedule fetch error:', err);
      setError('일정을 불러오는데 실패했습니다');
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, [favoriteTeams, activeLeague]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  return {
    games,
    loading,
    error,
    refetch: fetchSchedule,
  };
};
