"use client";
import * as Sentry from "@sentry/nextjs";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@app/contexts/useAuthContext";
import { signOut } from "@app/services/authService";

export default function Logout() {
  const router = useRouter();
  const { setIsLoggedIn } = useAuthContext();

  const handleLogout = async () => {
    try {
      await signOut();
      setIsLoggedIn(false);
      router.push("/signin?logout=success");
      // 認証 cookie 削除後も Server Component のレンダー結果（Pro 状態など）は
      // ログイン中のまま残るため、明示的に作り直す。
      router.refresh();
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
