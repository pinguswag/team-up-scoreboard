import { useState, useEffect, useCallback } from 'react';
import { supabase, type FavoriteTeam } from '@/lib/supabase';
import { League } from '@/data/teams';

export const useFavoriteTeams = (userId: string | undefined) => {
  const [favoriteTeams, setFavoriteTeams] = useState<FavoriteTeam[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavoriteTeams = useCallback(async () => {
    if (!userId) {
      setFavoriteTeams([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('favorite_teams')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching favorite teams:', error);
    } else {
      setFavoriteTeams(data || []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchFavoriteTeams();
  }, [fetchFavoriteTeams]);

  const addFavoriteTeam = async (league: League, teamCode: string, teamName: string) => {
    if (!userId) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('favorite_teams')
      .insert({
        user_id: userId,
        league,
        team_code: teamCode,
        team_name: teamName,
      })
      .select()
      .single();

    if (!error && data) {
      setFavoriteTeams((prev) => [...prev, data]);
    }
    return { error };
  };

  const removeFavoriteTeam = async (teamCode: string, league: League) => {
    if (!userId) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('favorite_teams')
      .delete()
      .eq('user_id', userId)
      .eq('team_code', teamCode)
      .eq('league', league);

    if (!error) {
      setFavoriteTeams((prev) =>
        prev.filter((t) => !(t.team_code === teamCode && t.league === league))
      );
    }
    return { error };
  };

  const isTeamFavorite = (teamCode: string, league: League): boolean => {
    return favoriteTeams.some((t) => t.team_code === teamCode && t.league === league);
  };

  const toggleFavoriteTeam = async (league: League, teamCode: string, teamName: string) => {
    if (isTeamFavorite(teamCode, league)) {
      return removeFavoriteTeam(teamCode, league);
    } else {
      return addFavoriteTeam(league, teamCode, teamName);
    }
  };

  return {
    favoriteTeams,
    loading,
    addFavoriteTeam,
    removeFavoriteTeam,
    isTeamFavorite,
    toggleFavoriteTeam,
    refetch: fetchFavoriteTeams,
  };
};
