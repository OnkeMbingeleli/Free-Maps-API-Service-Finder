import { createClient } from '@supabase/supabase-js';

// Frontend client — ANON key only. Never put the service-role key here.
// Row Level Security (see backend/db/schema.sql) is what actually protects data.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});
