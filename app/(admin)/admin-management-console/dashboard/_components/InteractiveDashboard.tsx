"use client";

import { useState } from "react";
import { getDashboardStats } from "../actions";
import UserGrowthChart from "../../../_components/charts/UserGrowthChart";
import ActivityChart from "../../../_components/charts/ActivityChart";
import DashboardControls from "./DashboardControls";
import MetricToggle from "./MetricToggle";
import DataTable from "./DataTable";

interface InteractiveDashboardProps {
  initialStats: any;
}

export default function InteractiveDashboard({ initialStats }: InteractiveDashboardProps) {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState(30);
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const [visibleUserMetrics, setVisibleUserMetrics] = useState(new Set(['new_users', 'total_users', 'active_users']));
  const [visibleActivityMetrics, setVisibleActivityMetrics] = useState(new Set(['games', 'batting_records', 'pitching_records', 'total_posts']));

  const userMetrics = [
    { key: 'new_users', label: '新規ユーザー', color: '#3B82F6' },
    { key: 'total_users', label: '累計ユーザー', color: '#10B981' },
    { key: 'active_users', label: 'アクティブユーザー', color: '#F59E0B' },
  ];

  const activityMetrics = [
    { key: 'games', label: 'ゲーム数', color: '#8B5CF6' },
    { key: 'batting_records', label: '打撃記録', color: '#06B6D4' },
    { key: 'pitching_records', label: '投球記録', color: '#F97316' },
    { key: 'total_posts', label: '総投稿数', color: '#EF4444' },
  ];

  const userGrowthColumns = [
    { key: 'date', label: '日付' },
    { key: 'new_users', label: '新規ユーザー' },
    { key: 'total_users', label: '累計ユーザー' },
    { key: 'active_users', label: 'アクティブユーザー' },
  ];

  const activityColumns = [
    { key: 'date', label: '日付' },
    { key: 'games', label: 'ゲーム数' },
    { key: 'batting_records', label: '打撃記録' },
    { key: 'pitching_records', label: '投球記録' },
    { key: 'total_posts', label: '総投稿数' },
  ];

  const handlePeriodChange = async (newPeriod: number) => {
    setPeriod(newPeriod);
    await fetchStats(newPeriod, granularity);
  };

  const handleGranularityChange = async (newGranularity: 'daily' | 'weekly' | 'monthly') => {
    setGranularity(newGranularity);
    await fetchStats(period, newGranularity);
  };

  const fetchStats = async (period: number, granularity: 'daily' | 'weekly' | 'monthly') => {
    setLoading(true);
    try {
      const data = await getDashboardStats(period, granularity);
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserMetricToggle = (key: string) => {
    const newSet = new Set(visibleUserMetrics);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setVisibleUserMetrics(newSet);
  };

  const handleActivityMetricToggle = (key: string) => {
    const newSet = new Set(visibleActivityMetrics);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setVisibleActivityMetrics(newSet);
  };

  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">データ分析</h3>
        <DashboardControls
          period={period}
          granularity={granularity}
          onPeriodChange={handlePeriodChange}
          onGranularityChange={handleGranularityChange}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="xl:col-span-2">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                ユーザー成長推移
              </h3>
              <MetricToggle
                title="表示指標"
                metrics={userMetrics}
                visibleMetrics={visibleUserMetrics}
                onToggle={handleUserMetricToggle}
              />
              {loading ? (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <p className="text-gray-500">データを読み込み中...</p>
                </div>
              ) : stats?.user_growth_data && stats?.user_growth_data.length > 0 ? (
                <UserGrowthChart
                  data={stats?.user_growth_data || []}
                  height={300}
                  visibleMetrics={visibleUserMetrics}
                />
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <p className="text-gray-500">データがありません</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          {loading ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ) : (
            <DataTable
              title="ユーザーデータ"
              data={stats?.user_growth_data || []}
              columns={userGrowthColumns}
              visibleMetrics={visibleUserMetrics}
            />
          )}
        </div>

        <div className="xl:col-span-2">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                アクティビティ推移
              </h3>
              <MetricToggle
                title="表示指標"
                metrics={activityMetrics}
                visibleMetrics={visibleActivityMetrics}
                onToggle={handleActivityMetricToggle}
              />
              {loading ? (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <p className="text-gray-500">データを読み込み中...</p>
                </div>
              ) : stats?.activity_data && stats?.activity_data.length > 0 ? (
                <ActivityChart
                  data={stats?.activity_data || []}
                  height={300}
                  visibleMetrics={visibleActivityMetrics}
                />
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <p className="text-gray-500">データがありません</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          {loading ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ) : (
            <DataTable
              title="アクティビティデータ"
              data={stats?.activity_data || []}
              columns={activityColumns}
              visibleMetrics={visibleActivityMetrics}
            />
          )}
        </div>
      </div>
    </>
  );
}
