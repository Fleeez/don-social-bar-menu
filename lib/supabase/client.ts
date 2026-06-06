import { createBrowserClient } from "@supabase/ssr";

/** Browser Supabase client (login form, photo uploads from the admin). */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
