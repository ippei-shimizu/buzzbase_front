import type { UserSearchParams } from "../../../types/admin";
import Link from "next/link";
import { Suspense } from "react";
import AppUserTable from "./_components/AppUserTable";
import Pagination from "./_components/Pagination";
import UserSearchFilters from "./_components/UserSearchFilters";
import { getAppUsers } from "./actions";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<UserSearchParams>;
}

export default async function AppUsersPage(props: PageProps) {
  const searchParams = await props.searchParams;

  let data;
  try {
    data = await getAppUsers(searchParams);
  } catch (error) {
    console.error("Error loading app users:", error);

    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">エラー</h3>
            <p className="text-gray-500 mb-4">
              ユーザー一覧の取得に失敗しました
            </p>
            <Link
              href="/admin-management-console/app-users"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              再試行
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">ユーザー管理</h2>
          <span className="text-sm text-gray-500">
            {data.pagination.total_count}人
          </span>
        </div>

        <Suspense fallback={null}>
          <UserSearchFilters />
        </Suspense>

        <AppUserTable users={data.users} />

        <Suspense fallback={null}>
          <Pagination pagination={data.pagination} />
        </Suspense>
      </div>
    </div>
  );
}
