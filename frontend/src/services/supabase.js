import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Prevent crash if placeholder is used by providing a valid URL format
if (supabaseUrl === 'YOUR_SUPABASE_URL') {
  supabaseUrl = 'https://dummy-project.supabase.co';
  supabaseAnonKey = 'dummy-key';
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
