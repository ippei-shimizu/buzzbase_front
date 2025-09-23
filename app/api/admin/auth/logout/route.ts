import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withAdminErrorHandler } from "../../../../../lib/admin-api-handler";

async function logoutHandler(request: NextRequest) {
  const cookieStore = cookies();
  cookieStore.delete("admin-session");

  return NextResponse.json({
    success: true,
    message: "ログアウトしました",
  });
}

export const POST = withAdminErrorHandler(logoutHandler, {
  requireAuth: false,
});
