"use client";
import { useAuth } from "../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

export function useAuthGuard() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const requireAuth = (callback) => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    callback();
  };

  return { requireAuth, isLoggedIn: !!user };
}
