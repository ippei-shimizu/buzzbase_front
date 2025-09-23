import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "../../../../../lib/admin-auth";
import { generateInternalJWT } from "../../../../../lib/internal-jwt";
import {
  withAdminErrorHandler,
  handleExternalApiCall,
} from "../../../../../lib/admin-api-handler";

export const dynamic = "force-dynamic";

const RAILS_API_URL = process.env.RAILS_API_URL || "http://back:3000";

async function dashboardHandler(request: NextRequest) {
  const adminUser = await getAdminUser();
  const jwtToken = generateInternalJWT(adminUser!.id);

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "30";
  const granularity = searchParams.get("granularity") || "daily";

  const apiUrl = new URL(`${RAILS_API_URL}/api/v1/admin/analytics/dashboard`);
  apiUrl.searchParams.set("period", period);
  apiUrl.searchParams.set("granularity", granularity);

  const data = await handleExternalApiCall(
    () =>
      fetch(apiUrl.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
      }),
    "ダッシュボードデータの取得に失敗しました"
  );

  return NextResponse.json(data);
}

export const GET = withAdminErrorHandler(dashboardHandler);
