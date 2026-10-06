import { UserProfile } from "@/types";

export interface AuthService {
  getCurrentUser(): Promise<UserProfile | null>;
  signInWithOtp(phoneOrEmail: string): Promise<{ success: boolean; message: string }>;
  signOut(): Promise<void>;
}

// Architecture facade contract (Implementation to connect with Supabase Auth)
export const authService: AuthService = {
  async getCurrentUser() {
    // Production architecture hook ready for Supabase auth integration
    return null;
  },
  async signInWithOtp(phoneOrEmail: string) {
    console.log(`[AuthService] OTP login initiated for: ${phoneOrEmail}`);
    return { success: true, message: "OTP sent successfully" };
  },
  async signOut() {
    console.log("[AuthService] Sign out executed");
  },
};
