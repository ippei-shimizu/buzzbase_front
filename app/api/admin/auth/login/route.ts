import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const RAILS_API_URL = process.env.RAILS_API_URL || "http://back:3000";

interface AdminUser {
  id: number;
  email: string;
  name: string;
}

interface LoginResponse {
  success: boolean;
  user?: AdminUser;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "メールアドレスとパスワードが必要です" },
        { status: 400 }
      );
    }

    const response = await fetch(`${RAILS_API_URL}/api/v1/admin/sign_in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: errorData.error || "ログインに失敗しました" },
        { status: response.status }
      );
    }

    const data: LoginResponse = await response.json();

    if (data.success && data.user) {
      const cookieStore = cookies();

      cookieStore.set("admin-session", JSON.stringify({
        user: data.user,
        timestamp: Date.now()
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/"
      });

      return NextResponse.json({
        success: true,
        user: data.user
      });
    }

    return NextResponse.json(
      { success: false, error: "認証に失敗しました" },
      { status: 401 }
    );

  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
