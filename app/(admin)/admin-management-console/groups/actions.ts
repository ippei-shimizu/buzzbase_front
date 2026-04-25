"use server";

import type { AdminGroupsResponse } from "../../../types/admin";
import { revalidatePath } from "next/cache";
import { getAdminUser } from "../../../../lib/admin-auth";
import { generateInternalJWT } from "../../../../lib/internal-jwt";
import { RAILS_API_URL } from "../../../constants/api";

export async function getGroups(
  params: { page?: string } = {},
): Promise<AdminGroupsResponse> {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      throw new Error("認証が必要です");
    }

    const jwtToken = generateInternalJWT(adminUser.id);

    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", params.page);

    const query = searchParams.toString();
    const url = `${RAILS_API_URL}/api/v1/admin/groups${query ? `?${query}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("グループの取得に失敗しました");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching groups:", error);
    throw error;
  }
}

export async function deleteGroup(
  id: number,
): Promise<{ success: boolean; message?: string; errors?: string[] }> {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return { success: false, errors: ["認証が必要です"] };
    }

    const jwtToken = generateInternalJWT(adminUser.id);

    const response = await fetch(`${RAILS_API_URL}/api/v1/admin/groups/${id}`, {
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
        errors: data.errors || ["グループの削除に失敗しました"],
      };
    }

    revalidatePath("/admin-management-console/groups");
    const data = await response.json().catch(() => ({}));
    return { success: true, message: data.message || "グループを削除しました" };
  } catch (error) {
    console.error("Error deleting group:", error);
    return {
      success: false,
      errors: ["グループの削除中にエラーが発生しました"],
    };
  }
}
