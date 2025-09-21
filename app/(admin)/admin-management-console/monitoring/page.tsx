export default function MonitoringPage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          システム監視
        </h2>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-4">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">システム監視機能</h3>
            <p className="text-gray-500 mb-4">
              システムのパフォーマンスと健全性を監視する機能を準備中です。
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                実装予定機能：
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>• サーバー監視・アラート</li>
                <li>• データベース性能監視</li>
                <li>• API応答時間監視</li>
                <li>• エラーログ・監視</li>
                <li>• リアルタイム通知</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}