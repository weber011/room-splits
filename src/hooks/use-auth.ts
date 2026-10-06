"use client";

import { useState } from "react";
import { UserProfile } from "@/types";

export function useAuth() {
  const [user] = useState<UserProfile | null>(null);
  const [isLoading] = useState<boolean>(false);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
