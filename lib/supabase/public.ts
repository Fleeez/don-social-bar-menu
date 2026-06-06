import { createClient } from "@supabase/supabase-js";

/**
 * Anonymous Supabase client for public, read-only data (the menu).
 * Does NOT touch cookies, so pages using it can stay cacheable / ISR.
 * RLS allows anon to read only visible categories and dishes.
 */
export function createSupabasePublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
