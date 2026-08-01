"use client";
import * as Sentry from "@sentry/nextjs";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { useAuthContext } from "@app/contexts/useAuthContext";
import { signOut } from "@app/services/authService";

export default function Logout() {
  const router = useRouter();
  const { setIsLoggedIn } = useAuthContext();

  const handleLogout = async () => {
    try {
      await signOut();
      setIsLoggedIn(false);
      // 認証 cookie 削除後も Server Component のレンダー結果はログイン中のまま
      // 残るため、明示的に作り直す。
      // 単一 transition にまとめて遷移先の RSC を2回取りに行かないようにする。
      startTransition(() => {
        router.push("/signin?logout=success");
        router.refresh();
      });
    } catch (error) {
      Sentry.captureException(error, {
        tags: { source: "logout" },
      });
    }
  };
  return (
    <button onClick={handleLogout} className="text-sm text-white">
      ログアウト
    </button>
  );
}
