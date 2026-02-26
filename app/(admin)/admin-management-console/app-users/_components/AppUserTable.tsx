import type { AppUser, AccountStatus } from "../../../../types/admin";
import Image from "next/image";
import Link from "next/link";

interface AppUserTableProps {
  users: AppUser[];
}

function StatusDot({ status }: { status: AccountStatus }) {
  const colors = {
    active: "bg-green-400",
    suspended: "bg-yellow-400",
    deleted: "bg-red-400",
  };

  const labels = {
    active: "アクティブ",
    suspended: "停止中",
    deleted: "削除済み",
  };

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
      <span className={`inline-block h-2 w-2 rounded-full ${colors[status]}`} />
      {labels[status]}
    </span>
  );
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function AppUserTable({ users }: AppUserTableProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        該当するユーザーが見つかりません
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
            <th className="pb-2 pr-4 font-medium">ユーザー</th>
            <th className="pb-2 pr-4 font-medium">状態</th>
            <th className="pb-2 pr-4 font-medium">最終ログイン</th>
            <th className="pb-2 pr-4 font-medium text-right">試合</th>
            <th className="pb-2 pr-4 font-medium text-right">フォロワー</th>
            <th className="pb-2 pr-4 font-medium">登録日</th>
            <th className="pb-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                  <Image
                    className="h-8 w-8 rounded-full object-cover"
                    src={user.image_url || "/images/user-default-yellow.svg"}
                    alt=""
                    width={32}
                    height={32}
                    unoptimized={!!user.image_url}
                  />
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {user.name || "未設定"}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {user.user_id ? `@${user.user_id}` : user.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-3 pr-4 whitespace-nowrap">
                <StatusDot status={user.account_status} />
              </td>
              <td className="py-3 pr-4 whitespace-nowrap text-gray-500">
                {user.last_login_at ? formatDate(user.last_login_at) : "-"}
              </td>
              <td className="py-3 pr-4 whitespace-nowrap text-gray-700 text-right tabular-nums">
                {user.game_results_count}
              </td>
              <td className="py-3 pr-4 whitespace-nowrap text-gray-700 text-right tabular-nums">
                {user.followers_count}
              </td>
              <td className="py-3 pr-4 whitespace-nowrap text-gray-500">
                {formatDate(user.created_at)}
              </td>
              <td className="py-3 whitespace-nowrap text-right">
                <Link
                  href={`/admin-management-console/app-users/${user.id}`}
                  className="text-indigo-600 hover:text-indigo-800 text-xs"
                >
                  詳細
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
