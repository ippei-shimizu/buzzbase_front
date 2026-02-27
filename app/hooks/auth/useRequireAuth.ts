"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthContext } from "@app/contexts/useAuthContext";

export default function useRequireAuth() {
  const router = useRouter();
  const { isLoggedIn } = useAuthContext();

  useEffect(() => {
    if (isLoggedIn === false) {
      router.push("/signup?auth_required=true");
    }
  }, [isLoggedIn, router]);

  return isLoggedIn;
}
