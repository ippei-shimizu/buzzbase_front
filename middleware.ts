import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function validateAdminAuth(request: NextRequest): Promise<boolean> {
  const jwtToken = request.cookies.get("admin-jwt")?.value;

  if (!jwtToken) {
    return false;
  }

  try {
    const RAILS_API_URL = process.env.RAILS_API_URL || "http://back:3000";
    const response = await fetch(`${RAILS_API_URL}/api/v1/admin/validate`, {
      method: "GET",
      headers: {
        "Cookie": `admin-jwt=${jwtToken}`,
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("JWT validation error:", error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin-management-console")) {
    if (pathname === "/admin-management-console/login") {
      const isAuthenticated = await validateAdminAuth(request);
      if (isAuthenticated) {
        return NextResponse.redirect(new URL("/admin-management-console/dashboard", request.url));
      }
      return NextResponse.next();
    }

    const isAuthenticated = await validateAdminAuth(request);
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/admin-management-console/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin-management-console/:path*"],
};
