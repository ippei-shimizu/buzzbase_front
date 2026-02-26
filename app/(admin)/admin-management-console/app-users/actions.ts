"use server";

import type {
  AppUsersResponse,
  AppUserDetail,
  AppUserDetailResponse,
  UserSearchParams,
} from "../../../types/admin";
import { revalidatePath } from "next/cache";
import { getAdminUser } from "../../../../lib/admin-auth";
import { generateInternalJWT } from "../../../../lib/internal-jwt";
import { RAILS_API_URL } from "../../../constants/api";

export async function getAppUsers(
  params: UserSearchParams = {},
): Promise<AppUsersResponse> {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    throw new Error("認証が必要です");
  }

  const jwtToken = generateInternalJWT(adminUser.id);

  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page);
  if (params.per_page) searchParams.set("per_page", params.per_page);
  if (params.search) searchParams.set("search", params.search);
  if (params.sort_by) searchParams.set("sort_by", params.sort_by);
  if (params.sort_order) searchParams.set("sort_order", params.sort_order);
  if (params.status) searchParams.set("status", params.status);
  if (params.date_from) searchParams.set("date_from", params.date_from);
  if (params.date_to) searchParams.set("date_to", params.date_to);

  const query = searchParams.toString();
  const url = `${RAILS_API_URL}/api/v1/admin/users${query ? `?${query}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("ユーザー一覧の取得に失敗しました");
  }

  return response.json();
}

export async function getAppUser(id: number): Promise<AppUserDetail> {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    throw new Error("認証が必要です");
  }

  const jwtToken = generateInternalJWT(adminUser.id);

  const response = await fetch(`${RAILS_API_URL}/api/v1/admin/users/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("ユーザー情報の取得に失敗しました");
  }

  const data: AppUserDetailResponse = await response.json();
  return data.user;
}

export async function suspendUser(
  id: number,
  reason?: string,
): Promise<{ success: boolean; message?: string; errors?: string[] }> {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return { success: false, errors: ["認証が必要です"] };
    }

    const jwtToken = generateInternalJWT(adminUser.id);

    const response = await fetch(
      `${RAILS_API_URL}/api/v1/admin/users/${id}/suspend`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ reason }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        errors: data.errors || ["アカウント停止に失敗しました"],
      };
    }

    revalidatePath("/admin-management-console/app-users");
    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error suspending user:", error);
    return {
      success: false,
      errors: ["アカウント停止中にエラーが発生しました"],
    };
  }
}

export async function restoreUser(
  id: number,
): Promise<{ success: boolean; message?: string; errors?: string[] }> {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return { success: false, errors: ["認証が必要です"] };
    }

    const jwtToken = generateInternalJWT(adminUser.id);

    const response = await fetch(
      `${RAILS_API_URL}/api/v1/admin/users/${id}/restore`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        errors: data.errors || ["アカウント復帰に失敗しました"],
      };
    }

    revalidatePath("/admin-management-console/app-users");
    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error restoring user:", error);
    return {
      success: false,
      errors: ["アカウント復帰中にエラーが発生しました"],
    };
  }
}

export async function softDeleteUser(
  id: number,
): Promise<{ success: boolean; message?: string; errors?: string[] }> {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return { success: false, errors: ["認証が必要です"] };
    }

    const jwtToken = generateInternalJWT(adminUser.id);

    const response = await fetch(
      `${RAILS_API_URL}/api/v1/admin/users/${id}/soft_delete`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        errors: data.errors || ["アカウント削除に失敗しました"],
      };
    }

    revalidatePath("/admin-management-console/app-users");
    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      errors: ["アカウント削除中にエラーが発生しました"],
    };
  }
}
