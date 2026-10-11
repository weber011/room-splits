import { UserProfile } from "@/types";
import { createClient } from "@/lib/supabase/client";

export interface AuthService {
  getCurrentUser(): Promise<UserProfile | null>;
  signInWithOtp(phoneOrEmail: string): Promise<{ success: boolean; message: string }>;
  signOut(): Promise<void>;
}

/**
 * Supabase Auth Service Facade
 * Connects directly to Supabase Auth while preparing infrastructure for STUDENT, OWNER, and ADMIN roles.
 */
export const authService: AuthService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      // Map Supabase User metadata to RoomSplits UserProfile contract
      const role = (user.user_metadata?.role as "tenant" | "owner" | "admin") || "tenant";

      return {
        id: user.id,
        email: user.email || "",
        fullName: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        phone: user.phone || user.user_metadata?.phone || "",
        role,
        isVerified: user.user_metadata?.is_verified || false,
        createdAt: user.created_at,
        updatedAt: user.updated_at || user.created_at,
      };
    } catch {
      return null;
    }
  },

  async signInWithOtp(phoneOrEmail: string) {
    try {
      const supabase = createClient();
      const isEmail = phoneOrEmail.includes("@");

      if (isEmail) {
        const { error } = await supabase.auth.signInWithOtp({ email: phoneOrEmail });
        if (error) return { success: false, message: error.message };
      } else {
        const { error } = await supabase.auth.signInWithOtp({ phone: phoneOrEmail });
        if (error) return { success: false, message: error.message };
      }

      return { success: true, message: "OTP verification code dispatched" };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initiate OTP sign in";
      return { success: false, message: msg };
    }
  },

  async signOut() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("[AuthService] Error during sign out:", err);
    }
  },
};
