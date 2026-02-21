import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get environment variables with fallbacks
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Warn if using placeholder values
if (supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn('⚠️ Supabase URL not configured. Please set EXPO_PUBLIC_SUPABASE_URL in .env file');
}

if (supabaseAnonKey === 'placeholder-key') {
  console.warn('⚠️ Supabase Anon Key not configured. Please set EXPO_PUBLIC_SUPABASE_ANON_KEY in .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
