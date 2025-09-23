"use server";

import { generateInternalJWT } from "../../../../lib/internal-jwt";
import { getAdminUser } from "../../../../lib/admin-auth";

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

const RAILS_API_URL = process.env.RAILS_API_URL || "http://back:3000";

export async function getDashboardStats(
  period: number = 30,
  granularity: "daily" | "weekly" | "monthly" = "daily",
): Promise<DashboardStats> {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      throw new Error("認証が必要です");
    }

    const jwtToken = generateInternalJWT(adminUser.id);

    const url = new URL(`${RAILS_API_URL}/api/v1/admin/analytics/dashboard`);
    url.searchParams.set("period", period.toString());
    url.searchParams.set("granularity", granularity);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("ダッシュボードデータの取得に失敗しました");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}

export async function getUserAnalytics(period: "7d" | "30d" | "90d" = "30d") {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      throw new Error("認証が必要です");
    }

    const jwtToken = generateInternalJWT(adminUser.id);

    const response = await fetch(
      `${RAILS_API_URL}/api/v1/admin/analytics/users?period=${period}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("ユーザー分析データの取得に失敗しました");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    throw error;
  }
}
