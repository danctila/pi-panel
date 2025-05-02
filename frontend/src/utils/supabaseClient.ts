import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables for Supabase connection
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Initialize the Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default supabase; 