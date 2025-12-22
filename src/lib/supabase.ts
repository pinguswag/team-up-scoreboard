import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  created_at: string;
  display_name: string | null;
  avatar_url: string | null;
};

export type FavoriteTeam = {
  id: string;
  user_id: string;
  league: 'NBA' | 'EPL' | 'NFL' | 'MLB';
  team_code: string;
  team_name: string;
  created_at: string;
};
