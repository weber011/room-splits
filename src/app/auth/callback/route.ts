import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Supabase Auth Callback Route Handler
 * Exchanges authorization code for a session cookie (PKCE flow, Email confirmation, Password Reset)
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/account";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Return user to login if code exchange failed
  return NextResponse.redirect(new URL("/login?error=auth_callback_failed", request.url));
}
