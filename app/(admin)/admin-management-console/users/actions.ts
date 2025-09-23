'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { generateInternalJWT } from '../../../../lib/internal-jwt';
import { getAdminUser } from '../../../../lib/admin-auth';
import type { AdminUser, AdminUserFormData, AdminUserUpdateData, AdminUserResponse, AdminUserSingleResponse } from '../../../types/admin';

const RAILS_API_URL = process.env.RAILS_API_URL || 'http://back:3000';

export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      throw new Error('認証が必要です');
    }

    const jwtToken = generateInternalJWT(adminUser.id);

    const response = await fetch(`${RAILS_API_URL}/api/v1/admin/admin_users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('管理者ユーザーの取得に失敗しました');
    }

    const data: AdminUserResponse = await response.json();
    return data.admin_users;
  } catch (error) {
    console.error('Error fetching admin users:', error);
    throw error;
  }
}

export async function createAdminUser(formData: AdminUserFormData): Promise<{ success: boolean; message?: string; errors?: string[] }> {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return { success: false, errors: ['認証が必要です'] };
    }

    const jwtToken = generateInternalJWT(adminUser.id);

    const response = await fetch(`${RAILS_API_URL}/api/v1/admin/admin_users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ admin_user: formData }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, errors: data.errors || ['管理者ユーザーの作成に失敗しました'] };
    }

    revalidatePath('/admin-management-console/users');
    return { success: true, message: data.message };
  } catch (error) {
    console.error('Error creating admin user:', error);
    return { success: false, errors: ['管理者ユーザーの作成中にエラーが発生しました'] };
  }
}

export async function updateAdminUser(id: number, formData: AdminUserUpdateData): Promise<{ success: boolean; message?: string; errors?: string[] }> {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return { success: false, errors: ['認証が必要です'] };
    }

    const jwtToken = generateInternalJWT(adminUser.id);

    const response = await fetch(`${RAILS_API_URL}/api/v1/admin/admin_users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ admin_user: formData }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, errors: data.errors || ['管理者ユーザーの更新に失敗しました'] };
    }

    revalidatePath('/admin-management-console/users');
    return { success: true, message: data.message };
  } catch (error) {
    console.error('Error updating admin user:', error);
    return { success: false, errors: ['管理者ユーザーの更新中にエラーが発生しました'] };
  }
}

export async function deleteAdminUser(id: number): Promise<{ success: boolean; message?: string; errors?: string[] }> {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return { success: false, errors: ['認証が必要です'] };
    }

    const jwtToken = generateInternalJWT(adminUser.id);

    const response = await fetch(`${RAILS_API_URL}/api/v1/admin/admin_users/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, errors: data.errors || ['管理者ユーザーの削除に失敗しました'] };
    }

    revalidatePath('/admin-management-console/users');
    return { success: true, message: data.message };
  } catch (error) {
    console.error('Error deleting admin user:', error);
    return { success: false, errors: ['管理者ユーザーの削除中にエラーが発生しました'] };
  }
}


export async function createAdminUserAction(formData: FormData) {
  const data = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    password_confirmation: formData.get('password_confirmation') as string,
  };

  const result = await createAdminUser(data);

  if (result.success) {
    redirect('/admin-management-console/users');
  } else {
    // エラーがある場合は、エラー情報と共にフォームを再表示
    redirect(`/admin-management-console/users?mode=create&error=${encodeURIComponent(result.errors?.join(', ') || '作成に失敗しました')}`);
  }
}

export async function updateAdminUserAction(id: number, formData: FormData) {
  const password = formData.get('password') as string;
  const passwordConfirmation = formData.get('password_confirmation') as string;

  const data: any = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
  };

  // パスワードが入力されている場合のみ追加
  if (password && password.trim() !== '') {
    data.password = password;
    data.password_confirmation = passwordConfirmation;
  }

  const result = await updateAdminUser(id, data);

  if (result.success) {
    redirect('/admin-management-console/users');
  } else {
    // エラーがある場合は、エラー情報と共にフォームを再表示
    redirect(`/admin-management-console/users?mode=edit&id=${id}&error=${encodeURIComponent(result.errors?.join(', ') || '更新に失敗しました')}`);
  }
}