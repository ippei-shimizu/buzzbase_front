import { cookies } from "next/headers";

export interface AdminUser {
  id: number;
  email: string;
  name: string;
}

const RAILS_API_URL = process.env.RAILS_API_URL || 'http://back:3000';

/**
 * NOTE: サーバーサイドで管理者認証を確認
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const cookieStore = cookies();
    const jwtToken = cookieStore.get("admin-jwt")?.value;

    if (!jwtToken) {
      return null;
    }

    const response = await fetch(`${RAILS_API_URL}/api/v1/admin/validate`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.success && data.user) {
      return data.user;
    }

    return null;
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
