import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppUser } from "../actions";
import AccountActions from "./_components/AccountActions";
import ActivityMetrics from "./_components/ActivityMetrics";
import UserDetailCard from "./_components/UserDetailCard";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AppUserDetailPage(props: PageProps) {
  const { id } = await props.params;
  const userId = parseInt(id, 10);

  if (isNaN(userId)) {
    notFound();
  }

  let user;
  try {
    user = await getAppUser(userId);
  } catch (error) {
    console.error("Error loading user:", error);

    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">エラー</h3>
            <p className="text-gray-500 mb-4">
              ユーザー情報の取得に失敗しました
            </p>
            <Link
              href="/admin-management-console/app-users"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
        <div className="mb-6">
          <Link
            href="/admin-management-console/app-users"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            ユーザー一覧に戻る
          </Link>
        </div>

        <div className="space-y-6">
          <UserDetailCard user={user} />
          <ActivityMetrics user={user} />
          <AccountActions user={user} />
        </div>
      </div>
    </div>
  );
}
