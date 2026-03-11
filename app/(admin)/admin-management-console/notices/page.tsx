import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteConfirmDialog from "./_components/DeleteConfirmDialog";
import ManagementNoticeForm from "./_components/ManagementNoticeForm";
import ManagementNoticeTable from "./_components/ManagementNoticeTable";
import { getManagementNotices } from "./actions";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    mode?: "create" | "edit" | "delete";
    id?: string;
    error?: string;
  }>;
}

export default async function NoticesPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const { mode, id, error } = searchParams;

  let notices;
  try {
    notices = await getManagementNotices();
  } catch (_error) {
    console.error("Error loading notices:", _error);

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
            <p className="text-gray-500 mb-4">お知らせの取得に失敗しました</p>
            <Link
              href="/admin-management-console/notices"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              再試行
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const editingNotice = id
    ? notices.find((notice) => notice.id === parseInt(id))
    : null;

  if ((mode === "edit" || mode === "delete") && id && !editingNotice) {
    redirect("/admin-management-console/notices");
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">お知らせ管理</h2>
            <p className="mt-2 text-sm text-gray-700">
              運営からのお知らせの作成・編集・削除を行えます。
            </p>
          </div>
          {!mode && (
            <div className="mt-4 sm:mt-0">
              <Link
                href="/admin-management-console/notices?mode=create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                新規作成
              </Link>
            </div>
          )}
        </div>

        {mode === "create" || mode === "edit" ? (
          <ManagementNoticeForm notice={editingNotice} error={error} />
        ) : mode === "delete" && editingNotice ? (
          <DeleteConfirmDialog notice={editingNotice} />
        ) : (
          <ManagementNoticeTable notices={notices} />
        )}
      </div>
    </div>
  );
}
