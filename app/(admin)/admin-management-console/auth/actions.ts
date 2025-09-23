"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function adminLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const RAILS_API_URL = process.env.RAILS_API_URL || "http://back:3000";

  try {
    const response = await fetch(`${RAILS_API_URL}/api/v1/admin/sign_in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || "ログインに失敗しました" };
    }

    if (data.success && data.access_token && data.refresh_token && data.user) {
      const cookieStore = cookies();

      cookieStore.set("admin-access-token", data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 15,
        path: "/",
      });

      cookieStore.set("admin-refresh-token", data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });

      redirect("/admin-management-console/dashboard");
    } else {
      return { error: "ログインに失敗しました" };
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("Admin login error:", error);
    return { error: "ログイン処理中にエラーが発生しました" };
  }
}

export async function adminLogout() {
  const RAILS_API_URL = process.env.RAILS_API_URL || "http://back:3000";
  const cookieStore = cookies();

  try {
    await fetch(`${RAILS_API_URL}/api/v1/admin/sign_out`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Admin logout API error:", error);
  }

  cookieStore.delete("admin-access-token");
  cookieStore.delete("admin-refresh-token");

  redirect("/admin-management-console/login");
}

