import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteConfirmDialog from "./_components/DeleteConfirmDialog";
import GroupTable from "./_components/GroupTable";
import { getGroups } from "./actions";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    mode?: "delete";
    id?: string;
    error?: string;
  }>;
}

export default async function GroupsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const { mode, id, error } = searchParams;

  let groups;
  try {
    groups = await getGroups();
  } catch (_error) {
    console.error("Error loading groups:", _error);

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
            <p className="text-gray-500 mb-4">グループの取得に失敗しました</p>
            <Link
              href="/admin-management-console/groups"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              再試行
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const targetGroup = id
    ? groups.find((group) => group.id === parseInt(id, 10))
    : null;

  if (mode === "delete" && id && !targetGroup) {
    redirect("/admin-management-console/groups");
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">グループ管理</h2>
            <p className="mt-2 text-sm text-gray-700">
              グループの一覧表示・削除を行えます。
            </p>
          </div>
        </div>

        {error ? (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{decodeURIComponent(error)}</p>
          </div>
        ) : null}

        {mode === "delete" && targetGroup ? (
          <DeleteConfirmDialog group={targetGroup} />
        ) : (
          <GroupTable groups={groups} />
        )}
      </div>
    </div>
  );
}
