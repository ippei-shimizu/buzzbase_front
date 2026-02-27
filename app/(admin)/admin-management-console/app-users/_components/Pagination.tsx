"use client";

import type { PaginationInfo } from "../../../../types/admin";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PaginationProps {
  pagination: PaginationInfo;
}

export default function Pagination({ pagination }: PaginationProps) {
  const searchParams = useSearchParams();
  const { current_page, total_pages, total_count, per_page } = pagination;

  if (total_pages <= 1) return null;

  function buildHref(page: number): string {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `/admin-management-console/app-users?${params.toString()}`;
  }

  const startItem = (current_page - 1) * per_page + 1;
  const endItem = Math.min(current_page * per_page, total_count);

  return (
    <div className="flex items-center justify-between pt-4 text-sm">
      <span className="text-gray-500">
        {total_count}件中 {startItem}-{endItem}件
      </span>
      <div className="flex items-center gap-1">
        {current_page > 1 ? (
          <Link
            href={buildHref(current_page - 1)}
            className="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            前へ
          </Link>
        ) : (
          <span className="px-3 py-1 rounded border border-gray-200 text-gray-300">
            前へ
          </span>
        )}

        <span className="px-3 py-1 text-gray-600">
          {current_page} / {total_pages}
        </span>

        {current_page < total_pages ? (
          <Link
            href={buildHref(current_page + 1)}
            className="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            次へ
          </Link>
        ) : (
          <span className="px-3 py-1 rounded border border-gray-200 text-gray-300">
            次へ
          </span>
        )}
      </div>
    </div>
  );
}
