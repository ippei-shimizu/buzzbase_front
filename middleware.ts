import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RAILS_API_URL } from "./app/constants/api";

function checkBasicAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return false;
  }

  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "utf-8",
  );
  const [username, password] = credentials.split(":");

  const validUsername = process.env.BASIC_AUTH_USER;
  const validPassword = process.env.BASIC_AUTH_PASSWORD;

  return username === validUsername && password === validPassword;
}

function createBasicAuthResponse(): NextResponse {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Area"',
    },
  });
}

async function refreshAccessToken(
  refreshToken: string,
): Promise<string | null> {
  try {
    const response = await fetch(`${RAILS_API_URL}/api/v1/admin/refresh`, {
      method: "POST",
      headers: { Cookie: `admin-refresh-token=${refreshToken}` },
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

async function validateToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${RAILS_API_URL}/api/v1/admin/validate`, {
      method: "GET",
      headers: {
        Cookie: `admin-access-token=${accessToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.success === true;
    }
  } catch (error) {
    console.error("Token validation error:", error);
  }
  return false;
}

async function validateAdminAuth(
  request: NextRequest,
): Promise<{ isValid: boolean; newAccessToken?: string }> {
  const accessToken = request.cookies.get("admin-access-token")?.value;
  const refreshToken = request.cookies.get("admin-refresh-token")?.value;

  if (accessToken) {
    const isValid = await validateToken(accessToken);
    if (isValid) {
      return { isValid: true };
    }
  }

  if (refreshToken) {
    const newAccessToken = await refreshAccessToken(refreshToken);
    if (newAccessToken) {
      return { isValid: true, newAccessToken };
    }
  }

  return { isValid: false };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin-management-console")) {
    // NOTE: Basic認証チェック
    if (!checkBasicAuth(request)) {
      return createBasicAuthResponse();
    }

    if (pathname === "/admin-management-console/login") {
      const authResult = await validateAdminAuth(request);
      if (authResult.isValid) {
        return NextResponse.redirect(
          new URL("/admin-management-console/dashboard", request.url),
        );
      }
      return NextResponse.next();
    }

    const authResult = await validateAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.redirect(
        new URL("/admin-management-console/login", request.url),
      );
    }

    if (authResult.newAccessToken) {
      const response = NextResponse.next();
      response.cookies.set("admin-access-token", authResult.newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 15,
        path: "/",
      });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin-management-console/:path*"],
};
