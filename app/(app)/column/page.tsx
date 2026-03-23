import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "コラム一覧｜野球の指標・用語をわかりやすく解説",
  description:
    "OPS・出塁率・長打率など、野球の指標や用語をわかりやすく解説するコラム一覧。計算方法や目安値も掲載。",
  alternates: {
    canonical: "https://buzzbase.jp/column",
  },
};

const columns = [
  {
    slug: "ops",
    title: "OPSとは？意味・計算方法・目安を解説",
    description:
      "OPSの意味・計算式・評価基準を解説。NPB・高校野球・中学野球の目安値を一覧表で掲載。",
  },
];

export default function ColumnIndexPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">コラム一覧</h1>
      <p className="text-sm text-zinc-400 mb-8">
        野球の指標や用語をわかりやすく解説するコラムです。
      </p>

      <div className="grid grid-cols-1 gap-3">
        {columns.map((column) => (
          <Link
            key={column.slug}
            href={`/column/${column.slug}`}
            className="group rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3 flex items-center justify-between gap-3"
          >
            <div>
              <p className="font-bold text-sm text-white">{column.title}</p>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                {column.description}
              </p>
            </div>
            <svg
              className="w-4 h-4 shrink-0 text-zinc-500 group-hover:text-yellow-600 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
