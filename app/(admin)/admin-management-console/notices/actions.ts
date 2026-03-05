"use server";

import type {
  ManagementNotice,
  ManagementNoticeFormData,
  ManagementNoticeResponse,
} from "../../../types/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminUser } from "../../../../lib/admin-auth";
import { generateInternalJWT } from "../../../../lib/internal-jwt";
import { RAILS_API_URL } from "../../../constants/api";

export async function getManagementNotices(): Promise<ManagementNotice[]> {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      throw new Error("認証が必要です");
    }

    const jwtToken = generateInternalJWT(adminUser.id);

    const response = await fetch(
      `${RAILS_API_URL}/api/v1/admin/management_notices`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("お知らせの取得に失敗しました");
    }

    const data: ManagementNoticeResponse = await response.json();
    return data.management_notices;
  } catch (error) {
    console.error("Error fetching management notices:", error);
    throw error;
  }
}

export async function createManagementNotice(
  formData: ManagementNoticeFormData,
): Promise<{ success: boolean; message?: string; errors?: string[] }> {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return { success: false, errors: ["認証が必要です"] };
    }

    const jwtToken = generateInternalJWT(adminUser.id);

    const response = await fetch(
      `${RAILS_API_URL}/api/v1/admin/management_notices`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ management_notice: formData }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        errors: data.errors || ["お知らせの作成に失敗しました"],
      };
    }

    revalidatePath("/admin-management-console/notices");
    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error creating management notice:", error);
    return {
      success: false,
      errors: ["お知らせの作成中にエラーが発生しました"],
    };
  }
}

export async function updateManagementNotice(
  id: number,
  formData: ManagementNoticeFormData,
): Promise<{ success: boolean; message?: string; errors?: string[] }> {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return { success: false, errors: ["認証が必要です"] };
    }

    const jwtToken = generateInternalJWT(adminUser.id);

    const response = await fetch(
      `${RAILS_API_URL}/api/v1/admin/management_notices/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ management_notice: formData }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        errors: data.errors || ["お知らせの更新に失敗しました"],
      };
    }

    revalidatePath("/admin-management-console/notices");
    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error updating management notice:", error);
    return {
      success: false,
      errors: ["お知らせの更新中にエラーが発生しました"],
    };
  }
}

export async function deleteManagementNotice(
  id: number,
): Promise<{ success: boolean; message?: string; errors?: string[] }> {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return { success: false, errors: ["認証が必要です"] };
    }

    const jwtToken = generateInternalJWT(adminUser.id);

    const response = await fetch(
      `${RAILS_API_URL}/api/v1/admin/management_notices/${id}`,
      {
        method: "DELETE",
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
        errors: data.errors || ["お知らせの削除に失敗しました"],
      };
    }

    revalidatePath("/admin-management-console/notices");
    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error deleting management notice:", error);
    return {
      success: false,
      errors: ["お知らせの削除中にエラーが発生しました"],
    };
  }
}

export async function createManagementNoticeAction(formData: FormData) {
  const data: ManagementNoticeFormData = {
    title: formData.get("title") as string,
    body: formData.get("body") as string,
    status: (formData.get("status") as "draft" | "published") || "draft",
  };

  const result = await createManagementNotice(data);

  if (result.success) {
    redirect("/admin-management-console/notices");
  } else {
    redirect(
      `/admin-management-console/notices?mode=create&error=${encodeURIComponent(result.errors?.join(", ") || "作成に失敗しました")}`,
    );
  }
}

export async function updateManagementNoticeAction(
  id: number,
  formData: FormData,
) {
  const data: ManagementNoticeFormData = {
    title: formData.get("title") as string,
    body: formData.get("body") as string,
    status: (formData.get("status") as "draft" | "published") || "draft",
  };

  const result = await updateManagementNotice(id, data);

  if (result.success) {
    redirect("/admin-management-console/notices");
  } else {
    redirect(
      `/admin-management-console/notices?mode=edit&id=${id}&error=${encodeURIComponent(result.errors?.join(", ") || "更新に失敗しました")}`,
    );
  }
}
