"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

interface AdminUser {
  id: number;
  email: string;
  name: string;
}

export async function adminLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  let shouldRedirect = false;

  try {
    const routeModule = await import("../../../api/admin/auth/login/route");

    const request = new NextRequest('http://localhost/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const response = await routeModule.POST(request);

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || "ログインに失敗しました" };
    }

    const data = await response.json();

    if (data.success && data.user) {
      shouldRedirect = true;
    } else {
      return { error: "ログインに失敗しました" };
    }
  } catch (error) {
    console.error("Admin login error:", error);
    return { error: "ログイン処理中にエラーが発生しました" };
  }

  if (shouldRedirect) {
    redirect("/admin-management-console/dashboard");
  }
}

export async function adminLogout() {
  const cookieStore = cookies();

  const RAILS_API_URL = process.env.RAILS_API_URL || "http://back:3000";

  try {
    await fetch(`${RAILS_API_URL}/api/v1/admin/sign_out`, {
      method: "DELETE",
      credentials: "include",
    });
  } catch (error) {
    console.error("Admin logout API error:", error);
  }

  cookieStore.delete("admin-session");

  redirect("/admin-management-console/login");
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("admin-session")?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const sessionData = JSON.parse(sessionCookie);

    const maxAge = 60 * 60 * 24 * 7 * 1000;
    if (Date.now() - sessionData.timestamp > maxAge) {
      return null;
    }

    return sessionData.user;
  } catch (error) {
    console.error("Failed to parse admin session:", error);
    return null;
  }
}
