export const dynamic = 'force-dynamic';

export default function UsersPage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          ユーザー管理
        </h2>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">ユーザー管理機能</h3>
            <p className="text-gray-500 mb-4">
              ユーザーの管理・監視機能を準備中です。
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                実装予定機能：
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>• ユーザー一覧・検索</li>
                <li>• ユーザー詳細情報</li>
                <li>• アカウント停止・復活</li>
                <li>• ユーザー行動履歴</li>
                <li>• 権限管理</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
