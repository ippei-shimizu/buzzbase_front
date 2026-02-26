"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

const STATUS_OPTIONS = [
  { value: "", label: "全て（削除済み除く）" },
  { value: "active", label: "アクティブ" },
  { value: "suspended", label: "停止中" },
  { value: "deleted", label: "削除済み" },
];

const SORT_OPTIONS = [
  { value: "created_at", label: "登録日" },
  { value: "last_login_at", label: "最終ログイン" },
  { value: "name", label: "名前" },
  { value: "game_results_count", label: "試合数" },
  { value: "followers_count", label: "フォロワー数" },
];

export default function UserSearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      params.delete("page");
      router.push(`/admin-management-console/app-users?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleSearch = useCallback(() => {
    updateParams({ search });
  }, [search, updateParams]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch],
  );

  const handleReset = useCallback(() => {
    setSearch("");
    router.push("/admin-management-console/app-users");
  }, [router]);

  const hasFilters =
    searchParams.get("search") ||
    searchParams.get("status") ||
    searchParams.get("date_from") ||
    searchParams.get("date_to") ||
    (searchParams.get("sort_by") &&
      searchParams.get("sort_by") !== "created_at");

  return (
    <div className="mb-4 space-y-3">
      {/* 検索 + ステータス + ソート */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="名前、メール、ユーザーIDで検索..."
            className="flex-1 min-w-0 rounded-l-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSearch}
            className="rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 hover:bg-gray-100 text-sm"
          >
            検索
          </button>
        </div>

        <select
          value={searchParams.get("status") || ""}
          onChange={(e) => updateParams({ status: e.target.value })}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="flex">
          <select
            value={searchParams.get("sort_by") || "created_at"}
            onChange={(e) => updateParams({ sort_by: e.target.value })}
            className="rounded-l-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() =>
              updateParams({
                sort_order:
                  searchParams.get("sort_order") === "asc" ? "desc" : "asc",
              })
            }
            className="rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-2 py-2 text-gray-500 hover:bg-gray-100"
            title={searchParams.get("sort_order") === "asc" ? "昇順" : "降順"}
          >
            {searchParams.get("sort_order") === "asc" ? (
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            ) : (
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 日付フィルタ（折りたたみ的に1行で） */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-gray-500">登録日:</span>
        <input
          type="date"
          value={searchParams.get("date_from") || ""}
          onChange={(e) => updateParams({ date_from: e.target.value })}
          className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        />
        <span className="text-gray-400">-</span>
        <input
          type="date"
          value={searchParams.get("date_to") || ""}
          onChange={(e) => updateParams({ date_to: e.target.value })}
          className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        />
        {hasFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="text-gray-400 hover:text-gray-600 text-xs underline ml-2"
          >
            リセット
          </button>
        )}
      </div>
    </div>
  );
}
