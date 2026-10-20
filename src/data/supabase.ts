// Supabase client. The app stays fully usable offline / without keys: every
// feature that needs the backend checks `isSupabaseConfigured` first.
// The publishable (anon) key is public by design — Row-Level Security in the
// database decides who can read or write what.

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!url && !!key;

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, key!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // mobile: no URL-based OAuth callbacks
      },
    })
  : null;

// Throws a clear error for code paths that genuinely need the backend.
export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new Error('Supabase is not configured (set EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY).');
  return supabase;
}
