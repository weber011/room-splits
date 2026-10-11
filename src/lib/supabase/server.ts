import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/config/env";

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

/**
 * Creates a server-side Supabase client for Server Components, Actions, and Route Handlers
 * Integrates Next.js 15 async cookie management via @supabase/ssr
 */
export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "placeholder-anon-key";

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // Ignored if middleware refreshes user sessions.
        }
      },
    },
  });
}
