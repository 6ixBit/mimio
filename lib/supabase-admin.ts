import { createClient } from "@supabase/supabase-js";

// Create a Supabase client with service role key for admin operations
// This bypasses Row Level Security (RLS) and should only be used server-side
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
