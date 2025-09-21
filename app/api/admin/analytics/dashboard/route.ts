import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "../../../../../lib/admin-auth";
import { generateInternalJWT } from "../../../../../lib/internal-jwt";

const RAILS_API_URL = process.env.RAILS_API_URL || "http://back:3000";

export async function GET(request: NextRequest) {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const jwtToken = generateInternalJWT(adminUser.id);

    const response = await fetch(`${RAILS_API_URL}/api/v1/admin/analytics/dashboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwtToken}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "データの取得に失敗しました" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Dashboard analytics error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
