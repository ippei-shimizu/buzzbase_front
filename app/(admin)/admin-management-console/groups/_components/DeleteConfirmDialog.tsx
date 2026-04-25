import Link from "next/link";
import { redirect } from "next/navigation";
import { type AdminGroup } from "../../../../types/admin";
import { deleteGroup } from "../actions";

interface DeleteConfirmDialogProps {
  group: AdminGroup;
}

export default function DeleteConfirmDialog({
  group,
}: DeleteConfirmDialogProps) {
  const deleteAction = async () => {
    "use server";
    const result = await deleteGroup(group.id);

    if (result.success) {
      redirect("/admin-management-console/groups");
    } else {
      redirect(
        `/admin-management-console/groups?mode=delete&id=${group.id}&error=${encodeURIComponent(result.errors?.join(", ") || "削除に失敗しました")}`,
      );
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
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

      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          グループを削除
        </h3>
        <div className="text-sm text-gray-500 mb-6">
          <p className="mb-2">以下のグループを削除しますか？</p>
          <div className="bg-gray-50 p-3 rounded-md text-left">
            <p>
              <span className="font-medium">グループ名:</span> {group.name}
            </p>
            <p>
              <span className="font-medium">メンバー数:</span>{" "}
              {group.group_users_count}
            </p>
            <p>
              <span className="font-medium">ID:</span> {group.id}
            </p>
          </div>
          <p className="mt-3 text-red-600 font-medium">
            この操作は取り消せません。
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-3">
        <Link
          href="/admin-management-console/groups"
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          キャンセル
        </Link>
        <form action={deleteAction}>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            削除する
          </button>
        </form>
      </div>
    </div>
  );
}
