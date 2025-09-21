import { getDashboardStats } from "./actions";
import StatCard from "./_components/StatCard";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          ダッシュボード概要
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="総ユーザー数"
            value={stats.totalUsers.toLocaleString()}
            description="累計登録者数"
          />
          <StatCard
            title="日次アクティブユーザー"
            value={stats.dailyActiveUsers.toLocaleString()}
            description="本日のアクティブユーザー"
          />
          <StatCard
            title="新規登録者数"
            value={stats.newRegistrations.toLocaleString()}
            description="本日の新規登録"
          />
          <StatCard
            title="月次アクティブユーザー"
            value={stats.monthlyActiveUsers.toLocaleString()}
            description="今月のアクティブユーザー"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                ユーザー成長推移
              </h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <p className="text-gray-500">チャートコンポーネント予定地</p>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                アクティビティ推移
              </h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <p className="text-gray-500">チャートコンポーネント予定地</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
