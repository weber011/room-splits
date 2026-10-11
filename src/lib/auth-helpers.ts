import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type UserRoleEnum = "tenant" | "owner" | "admin";

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRoleEnum;
  isVerified: boolean;
  ownerId?: string;
}

/**
 * Server-side User Retrieval Helper
 * Authenticates user via Supabase Server Auth & resolves their actual database role.
 * NEVER trusts frontend request body user ID or role.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // 1. Fetch profile from database users table
    const { data: profile } = await supabase
      .from("users")
      .select("role, full_name, phone, is_verified")
      .eq("id", user.id)
      .single();

    // 2. Determine true role (Database record takes precedence over metadata)
    let role: UserRoleEnum = (profile?.role as UserRoleEnum) || (user.user_metadata?.role as UserRoleEnum) || "tenant";

    // 3. Check if user has an owner record
    let ownerId: string | undefined = undefined;
    const { data: owner } = await supabase
      .from("owners")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (owner) {
      ownerId = owner.id;
      if (role === "tenant") role = "owner";
    }

    // 4. Check if user is an admin in admin_users table
    const { data: admin } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (admin) {
      role = "admin";
    }

    return {
      id: user.id,
      email: user.email || "",
      fullName: profile?.full_name || user.user_metadata?.full_name || "User",
      phone: profile?.phone || user.user_metadata?.phone || "",
      role,
      isVerified: profile?.is_verified ?? user.user_metadata?.is_verified ?? false,
      ownerId,
    };
  } catch {
    return null;
  }
}

/**
 * Server Guard: Requires any authenticated user session
 */
export async function requireAuthenticatedUser(redirectTo: string = "/login"): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect(redirectTo);
  }
  return user;
}

/**
 * Server Guard: Requires Student (tenant) role or above
 */
export async function requireStudent(): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser();
  return user;
}

/**
 * Server Guard: Requires Owner role or Admin
 */
export async function requireOwner(): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser();
  if (user.role !== "owner" && user.role !== "admin") {
    redirect("/unauthorized");
  }
  return user;
}

/**
 * Server Guard: Requires Admin role strictly
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser();
  if (user.role !== "admin") {
    redirect("/unauthorized");
  }
  return user;
}
