import { createClient } from '@supabase/supabase-js';

// Publishable keys - safe to expose in client-side code
const supabaseUrl = 'https://kqjrrmmbsdfzppodxcsf.supabase.co';
const supabaseAnonKey = 'sb_publishable_6IKoyK548QZDpNNABsgmQA_ACX4rXT0';

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
