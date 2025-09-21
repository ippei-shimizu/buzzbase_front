import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function validateAdminAuth(request: NextRequest): Promise<boolean> {
  const sessionCookie = request.cookies.get("admin-session")?.value;

  if (!sessionCookie) {
    return false;
  }

  try {
    const session = JSON.parse(sessionCookie);

    const maxAge = 60 * 60 * 24 * 7 * 1000;
    if (Date.now() - session.timestamp > maxAge) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Invalid admin session cookie:", error);
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
