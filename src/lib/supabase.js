// frontend/src/lib/supabase.js
// Uses the ANON key — safe to expose to the browser.
// Row Level Security on Supabase ensures data isolation per user.
import { createClient } from '@supabase/supabase-js';

const URL = import.meta.env.VITE_SUPABASE_URL      || '';
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!URL || !KEY) {
  console.warn(
    '⚠️  Supabase env vars not set.\n' +
    '   Copy frontend/.env.example → frontend/.env and fill in your credentials.'
  );
}

export const supabase = createClient(URL, KEY);
