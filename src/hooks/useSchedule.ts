import { useState, useEffect, useCallback } from 'react';
import { supabase, type FavoriteTeam } from '@/lib/supabase';
import { League, TEAMS, LEAGUE_STATUS } from '@/data/teams';
import { 
  NormalizedFixture, 
  normalizeFixture, 
  sortFixtures 
} from '@/lib/scheduleUtils';
import { 
  fetchFixtures, 
  getTeamIds, 
  convertApiSportsFixture,
  LEAGUE_IDS 
} from '@/lib/apiSports';

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
      const apiKey = import.meta.env.VITE_API_SPORTS_KEY;
      const leagueId = LEAGUE_IDS[activeLeague];

      // API Sports API를 사용할 수 있는 경우 (EPL만 지원)
      if (apiKey && leagueId) {
        try {
          // 팀 이름 목록 (fullName 기준)
          const teamFullNames = selectedTeams.map(t => {
            const team = TEAMS[activeLeague].find(tm => tm.code === t.team_code);
            return team?.fullName || t.team_name;
          });

          // API Sports에서 팀 ID 가져오기
          const teamIdMap = await getTeamIds(teamFullNames, leagueId, activeLeague);
          const teamIds = Array.from(teamIdMap.values());

          if (teamIds.length > 0) {
            // API Sports에서 경기 일정 가져오기
            const apiFixtures = await fetchFixtures(activeLeague, teamIds);
            
            // API Sports 응답을 내부 형식으로 변환
            const convertedFixtures = apiFixtures.map(fixture => 
              convertApiSportsFixture(fixture, activeLeague)
            );

            // Normalize all fixtures (Supabase 형식과 동일하게 처리)
            const normalizedFixtures = convertedFixtures.map((row: any) => 
              normalizeFixture(row, activeLeague)
            );

            // Sort and set
            const sorted = sortFixtures(normalizedFixtures);
            setFixtures(sorted);
            return;
          }
        } catch (apiError) {
          console.warn('API Sports API 실패, Supabase로 fallback:', apiError);
          // API Sports 실패 시 Supabase로 fallback
        }
      }

      // Supabase fallback (기존 로직)
      const teamFullNames = selectedTeams.map(t => {
        const team = TEAMS[activeLeague].find(tm => tm.code === t.team_code);
        return team?.fullName || t.team_name;
      });

      const tableName = activeLeague.toLowerCase();

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
        const normalizedFixtures = (data || []).map((row: any) => 
          normalizeFixture(row, activeLeague)
        );

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
