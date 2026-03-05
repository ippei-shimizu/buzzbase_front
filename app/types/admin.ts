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

// App User Management types
export type AccountStatus = "active" | "suspended" | "deleted";
export type ActivityStatus = "active" | "recent" | "inactive";

export interface AppUser {
  id: number;
  name: string;
  email: string;
  user_id: string | null;
  image_url: string | null;
  created_at: string;
  last_login_at: string | null;
  account_status: AccountStatus;
  activity_status: ActivityStatus;
  game_results_count: number;
  followers_count: number;
  following_count: number;
}

export interface AppUserDetail extends AppUser {
  introduction: string | null;
  suspended_at: string | null;
  suspended_reason: string | null;
  deleted_at: string | null;
  batting_averages_count: number;
  pitching_results_count: number;
  baseball_notes_count: number;
  groups_count: number;
  team_name: string | null;
}

export interface PaginationInfo {
  current_page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
}

export interface AppUsersResponse {
  users: AppUser[];
  pagination: PaginationInfo;
}

export interface AppUserDetailResponse {
  user: AppUserDetail;
}

export interface UserSearchParams {
  page?: string;
  per_page?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

// Management Notice types
export type ManagementNoticeStatus = "draft" | "published";

export interface ManagementNotice {
  id: number;
  title: string;
  body: string;
  status: ManagementNoticeStatus;
  published_at: string | null;
  created_at: string;
  created_by_name: string;
}

export interface ManagementNoticeFormData {
  title: string;
  body: string;
  status: ManagementNoticeStatus;
}

export interface ManagementNoticeResponse {
  management_notices: ManagementNotice[];
}

export interface ManagementNoticeSingleResponse {
  management_notice: ManagementNotice;
  message?: string;
}
