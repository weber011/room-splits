"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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
 * Sign Up Server Action
 * Creates user in Supabase Auth & inserts user profile record
 */
export async function signUpAction(formData: FormData): Promise<AuthActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const requestedRole = (formData.get("role") as string) || "tenant";
  // PRIVILEGE GUARD: Never allow self-registration as "admin" via public sign-up form
  const role: "tenant" | "owner" = requestedRole === "owner" ? "owner" : "tenant";

  if (!email || !password || !fullName) {
    return { success: false, message: "Email, password, and full name are required." };
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

  // 2. Server-side Database Profile Insertion
  const { error: profileError } = await supabase.from("users").upsert({
    id: data.user.id,
    email: email,
    full_name: fullName,
    phone: phone || null,
    role: role,
    is_verified: false,
  });

  if (profileError) {
    console.warn("[signUpAction] Profile table insertion warning:", profileError.message);
  }

  // 3. If owner role, create owner profile row
  if (role === "owner") {
    await supabase.from("owners").upsert({
      user_id: data.user.id,
      verification_status: "pending",
    });
  }

  revalidatePath("/");
  return {
    success: true,
    message: "Account created successfully! Please verify your email if required.",
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
 * Authenticates user credentials & sets session cookies
 */
export async function signInAction(formData: FormData): Promise<AuthActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const expectedRole = formData.get("role") as string;

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

  const userRole = data.user.user_metadata?.role || "tenant";

  // Role verification guard
  if (expectedRole && expectedRole !== "all" && userRole !== expectedRole) {
    await supabase.auth.signOut();
    return {
      success: false,
      message: `Access denied. Account is registered as '${userRole}', not '${expectedRole}'.`,
    };
  }

  revalidatePath("/");
  return {
    success: true,
    message: "Logged in successfully!",
    user: {
      id: data.user.id,
      email: data.user.email || email,
      fullName: data.user.user_metadata?.full_name || "User",
      role: userRole as "tenant" | "owner" | "admin",
    },
  };
}

/**
 * Sign Out Server Action
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/login");
}

/**
 * Forgot Password Server Action
 */
export async function forgotPasswordAction(formData: FormData): Promise<AuthActionResult> {
  const email = formData.get("email") as string;

  if (!email) {
    return { success: false, message: "Please enter your registered email address." };
  }

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
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
 * Get Authenticated User Profile Server Action
 */
export async function getAuthUserAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email || "",
    fullName: user.user_metadata?.full_name || "User",
    phone: user.user_metadata?.phone || "",
    role: (user.user_metadata?.role || "tenant") as "tenant" | "owner" | "admin",
    isVerified: user.user_metadata?.is_verified || false,
  };
}
