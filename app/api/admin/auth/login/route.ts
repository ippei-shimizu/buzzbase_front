import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  withAdminErrorHandler,
  AdminApiError,
  validateRequestBody,
  handleExternalApiCall
} from "../../../../../lib/admin-api-handler";

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

interface LoginRequest {
  email: string;
  password: string;
}

async function validateLoginRequest(data: any): Promise<LoginRequest> {
  if (!data.email || !data.password) {
    throw new Error("メールアドレスとパスワードが必要です");
  }
  return { email: data.email, password: data.password };
}

async function loginHandler(request: NextRequest) {
  const { email, password } = await validateRequestBody(
    request,
    validateLoginRequest
  );

  const data: LoginResponse = await handleExternalApiCall(
    () =>
      fetch(`${RAILS_API_URL}/api/v1/admin/sign_in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }),
    "ログインに失敗しました"
  );

  if (!data.success || !data.user) {
    throw new AdminApiError("認証に失敗しました", 401, "AUTHENTICATION_FAILED");
  }

  const cookieStore = cookies();
  cookieStore.set(
    "admin-session",
    JSON.stringify({
      user: data.user,
      timestamp: Date.now(),
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    }
  );

  return NextResponse.json({
    success: true,
    user: data.user,
  });
}

export const POST = withAdminErrorHandler(loginHandler, { requireAuth: false });
