import { useState, useEffect, useCallback } from 'react';
import { supabase, type FavoriteTeam } from '@/lib/supabase';
import { League, TEAMS, LEAGUE_STATUS } from '@/data/teams';
import { 
  NormalizedFixture, 
  normalizeFixture, 
  sortFixtures 
} from '@/lib/scheduleUtils';

export const useSchedule = (favoriteTeams: FavoriteTeam[], activeLeague: League) => {
  const [fixtures, setFixtures] = useState<NormalizedFixture[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = useCallback(async () => {
    // 리그가 준비중이면 빈 배열
    if (!LEAGUE_STATUS[activeLeague].active) {
      setFixtures([]);
      setLoading(false);
      return;
    }

    // 해당 리그의 선택된 팀들
    const selectedTeams = favoriteTeams.filter(t => t.league === activeLeague);
    
    if (selectedTeams.length === 0) {
      setFixtures([]);
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
        );

      if (queryError) {
        console.error('Schedule fetch error:', queryError);
        setError(queryError.message);
        setFixtures([]);
      } else {
        // Normalize all fixtures
        const normalizedFixtures = (data || []).map((row: any) => 
          normalizeFixture(row, activeLeague)
        );

        // Sort and set
        const sorted = sortFixtures(normalizedFixtures);
        setFixtures(sorted);
      }
    } catch (err) {
      console.error('Schedule fetch error:', err);
      setError('일정을 불러오는데 실패했습니다');
      setFixtures([]);
    } finally {
      setLoading(false);
    }
  }, [favoriteTeams, activeLeague]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  return {
    fixtures,
    loading,
    error,
    refetch: fetchSchedule,
  };
};
