"use client";
import useLogout from "@app/hooks/auth/useLogout";

export default function Logout() {
  const logout = useLogout();

  return (
    <button onClick={logout} className="text-sm text-white">
      ログアウト
    </button>
  );
}
