"use server";

import type { AdminTeam, AdminTeamsResponse } from "../../../types/admin";
import { revalidatePath } from "next/cache";
import { getAdminUser } from "../../../../lib/admin-auth";
import { generateInternalJWT } from "../../../../lib/internal-jwt";
import { RAILS_API_URL } from "../../../constants/api";

export async function getTeams(): Promise<AdminTeam[]> {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      throw new Error("認証が必要です");
    }

    const jwtToken = generateInternalJWT(adminUser.id);

    const response = await fetch(`${RAILS_API_URL}/api/v1/admin/teams`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("チームの取得に失敗しました");
    }

    const data: AdminTeamsResponse = await response.json();
    return data.teams;
  } catch (error) {
    console.error("Error fetching teams:", error);
    throw error;
  }
}

export async function deleteTeam(
  id: number,
): Promise<{ success: boolean; message?: string; errors?: string[] }> {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return { success: false, errors: ["認証が必要です"] };
    }

    const jwtToken = generateInternalJWT(adminUser.id);

    const response = await fetch(`${RAILS_API_URL}/api/v1/admin/teams/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        success: false,
        errors: data.errors || ["チームの削除に失敗しました"],
      };
    }

    revalidatePath("/admin-management-console/teams");
    const data = await response.json().catch(() => ({}));
    return { success: true, message: data.message || "チームを削除しました" };
  } catch (error) {
    console.error("Error deleting team:", error);
    return {
      success: false,
      errors: ["チームの削除中にエラーが発生しました"],
    };
  }
}
