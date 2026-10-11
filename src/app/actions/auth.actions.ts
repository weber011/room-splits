"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth-helpers";

export interface AuthActionResult {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: "tenant" | "owner" | "admin";
  } | null;
}

/**
 * Public Student Sign Up Server Action
 * Creates user in Supabase Auth & inserts corresponding application profile.
 * PRIVILEGE SECURITY: Default role is strictly STUDENT ('tenant').
 * Ignores any client attempt to submit role=OWNER or role=ADMIN.
 */
export async function signUpAction(formData: FormData): Promise<AuthActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;

  // STRICT PRIVILEGE GUARD: Public signup ALWAYS creates STUDENT ('tenant') role.
  const role = "tenant" as const;

  if (!email || !password || !fullName) {
    return { success: false, message: "Email, password, and full name are required." };
  }

  if (password.length < 6) {
    return { success: false, message: "Password must be at least 6 characters." };
  }

  const supabase = await createClient();

  // 1. Create User in Supabase Auth with metadata
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone || null,
        role: role,
      },
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  if (!data.user) {
    return { success: false, message: "User creation failed. Please try again." };
  }

  // 2. Insert application profile record in users table
  const { error: profileError } = await supabase.from("users").upsert({
    id: data.user.id,
    email: email,
    full_name: fullName,
    phone: phone || null,
    role: role,
    is_verified: false,
  });

  if (profileError) {
    console.warn("[signUpAction] Profile table insertion log:", profileError.message);
  }

  revalidatePath("/");
  return {
    success: true,
    message: "Account created successfully! Welcome to RoomSplits.",
    user: {
      id: data.user.id,
      email: data.user.email || email,
      fullName,
      role,
    },
  };
}

/**
 * Sign In Server Action
 * Authenticates user credentials with Supabase Auth & sets secure session cookies
 */
export async function signInAction(formData: FormData): Promise<AuthActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, message: "Email and password are required." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  // Fetch true server-verified user role
  const authUser = await getAuthenticatedUser();
  const userRole = authUser?.role || "tenant";

  revalidatePath("/");
  return {
    success: true,
    message: "Logged in successfully!",
    user: {
      id: data.user.id,
      email: data.user.email || email,
      fullName: authUser?.fullName || data.user.user_metadata?.full_name || "User",
      role: userRole as "tenant" | "owner" | "admin",
    },
  };
}

/**
 * Sign Out Server Action
 * Invalidates session and clears cookies
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/login");
}

/**
 * Forgot Password Server Action
 * Sends password reset email via Supabase Auth
 */
export async function forgotPasswordAction(formData: FormData): Promise<AuthActionResult> {
  const email = formData.get("email") as string;

  if (!email) {
    return { success: false, message: "Please enter your registered email address." };
  }

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return {
    success: true,
    message: "Password reset link sent to your email. Please check your inbox.",
  };
}

/**
 * Reset Password Server Action
 * Updates user password in Supabase Auth
 */
export async function resetPasswordAction(formData: FormData): Promise<AuthActionResult> {
  const newPassword = formData.get("password") as string;

  if (!newPassword || newPassword.length < 6) {
    return { success: false, message: "Password must be at least 6 characters." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return {
    success: true,
    message: "Password updated successfully! You can now log in.",
  };
}

/**
 * Get Authenticated User Profile Action
 */
export async function getAuthUserAction() {
  const user = await getAuthenticatedUser();
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role as "tenant" | "owner" | "admin",
    isVerified: user.isVerified,
  };
}
