"use server";

import { NextRequest } from "next/server";

interface DashboardStats {
  total_users: number;
  daily_active_users: number;
  new_registrations: number;
  monthly_active_users: number;
  user_growth_data: Array<{
    date: string;
    new_users: number;
    total_users: number;
    active_users: number;
  }>;
  activity_data: Array<{
    date: string;
    games: number;
    batting_records: number;
    pitching_records: number;
    total_posts: number;
  }>;
  growth_rates?: {
    users?: number;
    dau?: number;
    new_users?: number;
  };
}

export async function getDashboardStats(
  period: number = 30,
  granularity: "daily" | "weekly" | "monthly" = "daily"
): Promise<DashboardStats> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:8000";

  const routeModule = await import(
    "../../../api/admin/analytics/dashboard/route"
  );

  const url = new URL(`${baseUrl}/api/admin/analytics/dashboard`);
  url.searchParams.set("period", period.toString());
  url.searchParams.set("granularity", granularity);

  const request = new NextRequest(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const response = await routeModule.GET(request);

  if (!response.ok) {
    throw new Error("データの取得に失敗しました");
  }

  return await response.json();
}

export async function getUserAnalytics(period: "7d" | "30d" | "90d" = "30d") {
  const RAILS_API_URL = process.env.RAILS_API_URL || "http://back:3000";

  const response = await fetch(
    `${RAILS_API_URL}/api/v1/admin/analytics/users?period=${period}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("ユーザー分析データの取得に失敗しました");
  }

  return await response.json();
}
