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
    title: "OPSとは（オーピーエス）？意味・計算方法・目安を解説",
    description:
      "OPSの読み方・意味・計算式・評価基準を解説。NPB・MLB・高校野球・中学野球の目安値を一覧表で掲載。",
  },
  {
    slug: "ops-criteria",
    title: "OPSはいくつから良い？レベル別の目安・基準を解説",
    description:
      "OPS .700/.800/.900/1.000 の意味と、中学・高校・大学・社会人・プロのカテゴリ別目安テーブル、4 番を任される現場感まで整理。",
  },
  {
    slug: "ops-800",
    title: "OPS .800 はどのレベル？プロ・高校野球での意味",
    description:
      "OPS .800 はクリーンアップを任される好打者の目安。リーグ平均との比較や、達成するための OBP / SLG バランスを解説。",
  },
  {
    slug: "ops-1000",
    title: "OPS 1.000 を超える選手の特徴と「1超え」の意味",
    description:
      "OPS 1超えの難易度、達成に必要な OBP / SLG、NPB・MLB 歴代の 1.000 超えスラッガーを整理。",
  },
  {
    slug: "ops-700",
    title: "OPS .700 は平均？高校野球・プロ野球での位置づけ",
    description:
      "OPS .700 はリーグ平均水準でレギュラー定着の最低ライン。プロ・高校野球での意味と .700 を超えるための課題を解説。",
  },
  {
    slug: "ops-max",
    title: "OPSの最大値（マックス）は？理論値と歴代最高記録",
    description:
      "OPSの理論上の最大値（5.000）と実戦での天井、NPB・MLB 歴代シーズン最高 OPS を整理。",
  },
  {
    slug: "ops-vs-batting-average",
    title: "OPSと打率・出塁率・長打率の違いをわかりやすく解説",
    description:
      "OPS・打率・出塁率・長打率の使い分け方を、打率が高いのにOPSが低い／逆のケースなど具体例で整理。",
  },
  {
    slug: "ops-ranking-npb",
    title: "NPB OPSランキング｜歴代シーズン上位と現役主要選手の目安",
    description:
      "NPB 歴代シーズン OPS ランキングと現役主力打者の OPS 水準を整理。",
  },
  {
    slug: "ops-ranking-mlb",
    title: "MLB OPS歴代TOP｜バリー・ボンズから現役まで歴代シーズン最高 OPS",
    description:
      "MLB 歴代シーズン最高 OPS ランキングと近年のトップ選手の水準を整理。",
  },
  {
    slug: "npb-ops-average",
    title: "NPB OPS平均値の推移｜セ・パ両リーグの平均と歴代スラッガーの比較",
    description:
      "NPB のリーグ平均 OPS の推移、セ・パの違い、歴代スラッガーとの差を整理。",
  },
  {
    slug: "batting-average",
    title: "打率とは？計算方法・打率の出し方・目安値を解説",
    description:
      "打率の意味・計算式・打率の出し方を解説。NPB・高校野球の目安値を一覧表で掲載。",
  },
  {
    slug: "era",
    title: "防御率（ERA）とは？計算方法・目安値を解説",
    description:
      "防御率の意味・計算式・評価基準を解説。NPB・高校野球の目安値を一覧表で掲載。",
  },
  {
    slug: "runs",
    title: "野球の失点とは？自責点との違い・失点率の計算方法",
    description:
      "失点の意味・自責点との違い・失点率の計算方法を解説。防御率との関係もわかりやすく説明。",
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
