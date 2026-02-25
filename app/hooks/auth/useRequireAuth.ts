"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthContext } from "@app/contexts/useAuthContext";

export default function useRequireAuth() {
  const router = useRouter();
  const { isLoggedIn } = useAuthContext();

  useEffect(() => {
    if (isLoggedIn === false) {
      router.push("/signin");
    }
  }, [isLoggedIn, router]);

  return isLoggedIn;
}
