import { NextResponse } from "next/server";
import { getSupabaseConfigStatus } from "@/config/env";

/**
 * Server-side Supabase health check endpoint
 * Verifies environment configuration availability without exposing credentials or tokens.
 */
export async function GET() {
  const status = getSupabaseConfigStatus();

  return NextResponse.json(
    {
      status: status.isConfigured ? "ok" : "degraded",
      service: "supabase",
      timestamp: new Date().toISOString(),
      config: {
        urlConfigured: status.urlConfigured,
        keyConfigured: status.keyConfigured,
      },
    },
    { status: status.isConfigured ? 200 : 503 }
  );
}
