"use server";

import { cookies } from "next/headers";
import { NextRequest } from "next/server";

interface DashboardStats {
  totalUsers: number;
  dailyActiveUsers: number;
  newRegistrations: number;
  monthlyActiveUsers: number;
  userGrowthData: Array<{
    date: string;
    users: number;
  }>;
  activityData: Array<{
    date: string;
    dailyActive: number;
    newUsers: number;
  }>;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const routeModule = await import("../../../api/admin/analytics/dashboard/route");

  const request = new NextRequest('http://localhost/api/admin/analytics/dashboard', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
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
