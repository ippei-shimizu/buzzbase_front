import { cookies } from "next/headers";
import { RAILS_API_URL } from "../app/constants/api";

export interface AdminUser {
  id: number;
  email: string;
  name: string;
}

/**
 * NOTE: サーバーサイドで管理者認証を確認
 */
async function refreshAccessToken(
  refreshToken: string,
): Promise<string | null> {
  try {
    const response = await fetch(`${RAILS_API_URL}/api/v1/admin/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `admin-refresh-token=${refreshToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.access_token;
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
  }
  return null;
}

async function validateAccessToken(
  accessToken: string,
): Promise<AdminUser | null> {
  try {
    const response = await fetch(`${RAILS_API_URL}/api/v1/admin/validate`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `admin-access-token=${accessToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.user) {
        return data.user;
      }
    }
  } catch (error) {
    console.error("Token validation failed:", error);
  }
  return null;
}

export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("admin-access-token")?.value;
    const refreshToken = cookieStore.get("admin-refresh-token")?.value;

    if (accessToken) {
      const user = await validateAccessToken(accessToken);
      if (user) {
        return user;
      }
    }

    if (refreshToken) {
      const newAccessToken = await refreshAccessToken(refreshToken);
      if (newAccessToken) {
        cookieStore.set("admin-access-token", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 15,
          path: "/",
        });

        return await validateAccessToken(newAccessToken);
      }
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
