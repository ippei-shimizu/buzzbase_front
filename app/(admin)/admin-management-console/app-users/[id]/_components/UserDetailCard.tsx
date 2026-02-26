import type { AppUserDetail, AccountStatus } from "../../../../../types/admin";
import Image from "next/image";

interface UserDetailCardProps {
  user: AppUserDetail;
}

function AccountStatusBadge({ status }: { status: AccountStatus }) {
  const styles = {
    active: "bg-green-100 text-green-800",
    suspended: "bg-yellow-100 text-yellow-800",
    deleted: "bg-red-100 text-red-800",
  };

  const labels = {
    active: "アクティブ",
    suspended: "停止中",
    deleted: "削除済み",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function UserDetailCard({ user }: UserDetailCardProps) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center">
          <Image
            className="h-16 w-16 rounded-full object-cover"
            src={user.image_url || "/images/user-default-yellow.svg"}
            alt={user.name || ""}
            width={64}
            height={64}
            unoptimized={!!user.image_url}
          />
          <div className="ml-5">
            <h3 className="text-xl font-bold text-gray-900">
              {user.name || "未設定"}
            </h3>
            {user.user_id && (
              <p className="text-sm text-gray-500">@{user.user_id}</p>
            )}
            <div className="mt-1">
              <AccountStatusBadge status={user.account_status} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-5">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">
              メールアドレス
            </dt>
            <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">チーム</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {user.team_name || "未所属"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">自己紹介</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {user.introduction || "未設定"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">登録日</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatDateTime(user.created_at)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">最終ログイン</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {user.last_login_at
                ? formatDateTime(user.last_login_at)
                : "ログイン履歴なし"}
            </dd>
          </div>
          {user.suspended_at && (
            <>
              <div>
                <dt className="text-sm font-medium text-gray-500">停止日時</dt>
                <dd className="mt-1 text-sm text-red-600">
                  {formatDateTime(user.suspended_at)}
                </dd>
              </div>
              {user.suspended_reason && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    停止理由
                  </dt>
                  <dd className="mt-1 text-sm text-red-600">
                    {user.suspended_reason}
                  </dd>
                </div>
              )}
            </>
          )}
          {user.deleted_at && (
            <div>
              <dt className="text-sm font-medium text-gray-500">削除日時</dt>
              <dd className="mt-1 text-sm text-red-600">
                {formatDateTime(user.deleted_at)}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
