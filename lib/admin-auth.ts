import { cookies } from "next/headers";

export interface AdminUser {
  id: number;
  email: string;
  name: string;
}

export interface AdminSession {
  user: AdminUser;
  timestamp: number;
}

/**
 * NOTE: サーバーサイドで管理者認証を確認
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("admin-session")?.value;

    if (!sessionCookie) {
      return null;
    }

    const session: AdminSession = JSON.parse(sessionCookie);

    const maxAge = 60 * 60 * 24 * 7 * 1000;
    if (Date.now() - session.timestamp > maxAge) {
      return null;
    }

    return session.user;
  } catch (error) {
    console.error("Failed to get admin user:", error);
    return null;
  }
}

/**
 * NOTE: 管理者がログインしているかチェック
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const user = await getAdminUser();
  return user !== null;
}
