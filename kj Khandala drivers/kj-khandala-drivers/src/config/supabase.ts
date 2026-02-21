import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dglzvzdyfnakfxymgnea.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnbHp2emR5Zm5ha2Z4eW1nbmVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNzczNzAsImV4cCI6MjA3ODY1MzM3MH0.-LJB1n1dZAnIuDMwX2a9D7jCC7F_IN_FxRKbbSmMBls';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
