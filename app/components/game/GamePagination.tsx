"use client";

interface GamePaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export default function GamePagination({
  currentPage,
  totalPages,
  totalCount,
  perPage,
  onPageChange,
}: GamePaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalCount);

  return (
    <div className="flex items-center justify-between pt-4 text-sm">
      <span className="text-zinc-400">
        {totalCount}件中 {startItem}-{endItem}件
      </span>
      <div className="flex items-center gap-1">
        {currentPage > 1 ? (
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            className="px-3 py-1 rounded border border-zinc-600 text-zinc-300 hover:bg-zinc-700"
          >
            前へ
          </button>
        ) : (
          <span className="px-3 py-1 rounded border border-zinc-700 text-zinc-600">
            前へ
          </span>
        )}

        <span className="px-3 py-1 text-zinc-300">
          {currentPage} / {totalPages}
        </span>

        {currentPage < totalPages ? (
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            className="px-3 py-1 rounded border border-zinc-600 text-zinc-300 hover:bg-zinc-700"
          >
            次へ
          </button>
        ) : (
          <span className="px-3 py-1 rounded border border-zinc-700 text-zinc-600">
            次へ
          </span>
        )}
      </div>
    </div>
  );
}
