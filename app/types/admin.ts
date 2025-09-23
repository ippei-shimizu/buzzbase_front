export interface AdminUser {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface AdminUserFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AdminUserUpdateData {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
}

export interface AdminUserResponse {
  admin_users: AdminUser[];
}

export interface AdminUserSingleResponse {
  admin_user: AdminUser;
  message?: string;
}

export interface AdminUserCreateRequest {
  admin_user: AdminUserFormData;
}

export interface AdminUserUpdateRequest {
  admin_user: AdminUserUpdateData;
}
