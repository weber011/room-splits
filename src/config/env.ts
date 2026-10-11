/**
 * Centralized type-safe environment variable config & Supabase / Razorpay readiness checks
 * 
 * Never exposes server secrets (service role keys, DB passwords, Razorpay secrets) to client bundles.
 */

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  // Public Razorpay Key ID (Safe for client checkout initialization when required)
  NEXT_PUBLIC_RAZORPAY_KEY_ID:
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "",
  // Server-only environment variables (Must NOT use NEXT_PUBLIC_ prefix in client bundles)
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  GOOGLE_MAPS_SERVER_KEY: process.env.GOOGLE_MAPS_SERVER_KEY || "",
};

/**
 * Validates public Supabase & Razorpay configuration availability without exposing credentials
 */
export function validateEnv() {
  const missing: string[] = [];

  if (!env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (missing.length > 0 && process.env.NODE_ENV === "production") {
    console.warn(`[RoomSplits Security Warning] Missing required environment variables: ${missing.join(", ")}`);
  }
}

/**
 * Safe server/client health check helper to verify Supabase configuration status
 * Returns boolean flags indicating configuration readiness without leaking key values.
 */
export function getSupabaseConfigStatus() {
  const urlConfigured = Boolean(env.NEXT_PUBLIC_SUPABASE_URL && !env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder"));
  const keyConfigured = Boolean(
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.includes("placeholder")
  );

  return {
    isConfigured: urlConfigured && keyConfigured,
    urlConfigured,
    keyConfigured,
    hasServiceRoleConfigured: Boolean(env.SUPABASE_SERVICE_ROLE_KEY && !env.SUPABASE_SERVICE_ROLE_KEY.includes("placeholder")),
  };
}

/**
 * Safe health check helper to verify Razorpay configuration status (Server-side)
 * Returns boolean flags without exposing key values or secrets.
 */
export function getRazorpayConfigStatus() {
  const hasKeyId = Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_ID !== "your-razorpay-key-id");
  const hasSecret = Boolean(env.RAZORPAY_KEY_SECRET && env.RAZORPAY_KEY_SECRET !== "your-razorpay-key-secret");
  const hasWebhookSecret = Boolean(env.RAZORPAY_WEBHOOK_SECRET && env.RAZORPAY_WEBHOOK_SECRET !== "your-razorpay-webhook-secret");

  return {
    isConfigured: hasKeyId && hasSecret,
    hasKeyId,
    hasSecret,
    hasWebhookSecret,
    mode: "TEST", // TEST MODE architecture
  };
}
