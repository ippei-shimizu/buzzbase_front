import { type AdminTeamDetail } from "../../../../../types/admin";

interface TeamDetailCardProps {
  team: AdminTeamDetail;
}

export default function TeamDetailCard({ team }: TeamDetailCardProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">チーム情報</h3>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium text-gray-500">チーム名</dt>
          <dd className="mt-1 text-sm text-gray-900">{team.name}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">カテゴリ</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {team.category_name || "-"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">都道府県</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {team.prefecture_name || "-"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">試合結果数</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {team.match_results_count}件
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">作成日時</dt>
          <dd className="mt-1 text-sm text-gray-900">{team.created_at}</dd>
        </div>
      </dl>
    </div>
  );
}
