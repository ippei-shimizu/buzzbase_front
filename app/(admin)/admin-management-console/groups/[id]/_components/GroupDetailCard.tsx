import { type AdminGroupDetail } from "../../../../../types/admin";

interface GroupDetailCardProps {
  group: AdminGroupDetail;
}

export default function GroupDetailCard({ group }: GroupDetailCardProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">グループ情報</h3>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium text-gray-500">グループ名</dt>
          <dd className="mt-1 text-sm text-gray-900">{group.name}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">アイコン</dt>
          <dd className="mt-1">
            {group.icon_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={group.icon_url}
                alt={group.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-sm text-gray-400">なし</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">メンバー数</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {group.group_users_count}人
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">招待数</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {group.group_invitations_count}件
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">作成日時</dt>
          <dd className="mt-1 text-sm text-gray-900">{group.created_at}</dd>
        </div>
      </dl>
    </div>
  );
}
