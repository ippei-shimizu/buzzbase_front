import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "コラム一覧｜野球の指標・用語をわかりやすく解説",
  description:
    "OPS・打率・出塁率・防御率・失点など、野球の指標や用語をわかりやすく解説するコラム一覧。計算方法や目安値、ランキングまでカテゴリ別に整理。",
  alternates: {
    canonical: "https://buzzbase.jp/column",
  },
};

type Article = {
  slug: string;
  title: string;
  description: string;
};

type StatGroup = {
  label: string | null;
  articles: Article[];
};

type Stat = {
  name: string;
  description: string;
  groups: StatGroup[];
};

type Category = {
  name: string;
  description: string;
  stats: Stat[];
};

const categories: Category[] = [
  {
    name: "打撃指標",
    description: "打者の評価に使う指標群（OPS・打率など）",
    stats: [
      {
        name: "OPS",
        description: "出塁率＋長打率で打者の総合的な攻撃力を評価する指標。",
        groups: [
          {
            label: "基本",
            articles: [
              {
                slug: "ops",
                title: "OPSとは（オーピーエス）？意味・計算方法・目安を解説",
                description:
                  "OPSの読み方・意味・計算式・評価基準を解説。NPB・MLB・高校野球・中学野球の目安値を一覧表で掲載。",
              },
            ],
          },
          {
            label: "目安・基準",
            articles: [
              {
                slug: "ops-criteria",
                title: "OPSはいくつから良い？レベル別の目安・基準を解説",
                description:
                  "OPS .700/.800/.900/1.000 の意味と、中学・高校・大学・社会人・プロのカテゴリ別目安テーブル、4 番を任される現場感まで整理。",
              },
            ],
          },
          {
            label: "数値別解説",
            articles: [
              {
                slug: "ops-800",
                title: "OPS .800 はどのレベル？プロ・高校野球での意味",
                description:
                  "クリーンアップを任される好打者の目安。リーグ平均との比較や、達成するための OBP / SLG バランスを解説。",
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
                  "リーグ平均水準でレギュラー定着の最低ライン。プロ・高校野球での意味と .700 を超えるための課題を解説。",
              },
              {
                slug: "ops-max",
                title: "OPS の最大値（マックス）は？理論値と歴代最高記録",
                description:
                  "OPS の理論上の最大値（5.000）と実戦での天井、NPB・MLB 歴代シーズン最高 OPS を整理。",
              },
            ],
          },
          {
            label: "比較",
            articles: [
              {
                slug: "ops-vs-batting-average",
                title: "OPSと打率・出塁率・長打率の違いをわかりやすく解説",
                description:
                  "4 指標の使い分け方を、打率が高いのに OPS が低い／逆のケースなど具体例で整理。",
              },
            ],
          },
          {
            label: "ランキング・データ",
            articles: [
              {
                slug: "ops-ranking-npb",
                title:
                  "NPB OPSランキング｜歴代シーズン上位と現役主要選手の目安",
                description:
                  "NPB 歴代シーズン OPS ランキングと現役主力打者の OPS 水準を整理。",
              },
              {
                slug: "ops-ranking-mlb",
                title:
                  "MLB OPS歴代TOP｜バリー・ボンズから現役まで歴代シーズン最高 OPS",
                description:
                  "MLB 歴代シーズン最高 OPS ランキングと近年のトップ選手の水準を整理。",
              },
              {
                slug: "npb-ops-average",
                title:
                  "NPB OPS平均値の推移｜セ・パ両リーグの平均と歴代スラッガーの比較",
                description:
                  "NPB のリーグ平均 OPS の推移、セ・パの違い、歴代スラッガーとの差を整理。",
              },
            ],
          },
        ],
      },
      {
        name: "打率",
        description: "安打数÷打数で算出する、最も基本的な打撃指標。",
        groups: [
          {
            label: null,
            articles: [
              {
                slug: "batting-average",
                title: "打率とは？計算方法・打率の出し方・目安値を解説",
                description:
                  "打率の意味・計算式・打率の出し方を解説。NPB・高校野球の目安値を一覧表で掲載。",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "投手指標",
    description: "投手の評価に使う指標群（防御率・失点など）",
    stats: [
      {
        name: "防御率（ERA）",
        description:
          "9 イニング換算で自責点をどれだけ許すかを示す投手の代表指標。",
        groups: [
          {
            label: null,
            articles: [
              {
                slug: "era",
                title: "防御率（ERA）とは？計算方法・目安値を解説",
                description:
                  "防御率の意味・計算式・評価基準を解説。NPB・高校野球の目安値を一覧表で掲載。",
              },
            ],
          },
        ],
      },
      {
        name: "失点",
        description: "失点と自責点の違い、失点率（RA）の意味と計算方法。",
        groups: [
          {
            label: null,
            articles: [
              {
                slug: "runs",
                title: "野球の失点とは？自責点との違い・失点率の計算方法",
                description:
                  "失点の意味・自責点との違い・失点率の計算方法を解説。防御率との関係もわかりやすく説明。",
              },
            ],
          },
        ],
      },
    ],
  },
];

function ArrowRightIcon() {
  return (
    <svg
      className="w-4 h-4 shrink-0 text-zinc-500 group-hover:text-yellow-600 transition-colors"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      key={article.slug}
      href={`/column/${article.slug}`}
      className="group rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3 flex items-center justify-between gap-3"
    >
      <div>
        <p className="font-bold text-sm text-white">{article.title}</p>
        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
          {article.description}
        </p>
      </div>
      <ArrowRightIcon />
    </Link>
  );
}

export default function ColumnIndexPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">コラム一覧</h1>
      <p className="text-sm text-zinc-400 mb-8">
        野球の指標や用語をわかりやすく解説するコラムです。カテゴリ別に整理しています。
      </p>

      <div className="space-y-12">
        {categories.map((category) => (
          <section key={category.name}>
            <h2 className="text-xl font-bold text-white border-b border-zinc-700 pb-2">
              {category.name}
            </h2>
            <p className="text-xs text-zinc-400 mt-2 mb-6">
              {category.description}
            </p>

            <div className="space-y-8">
              {category.stats.map((stat) => (
                <div key={stat.name}>
                  <h3 className="text-base font-bold text-yellow-500">
                    {stat.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 mb-4">
                    {stat.description}
                  </p>

                  <div className="space-y-5">
                    {stat.groups.map((group, index) => (
                      <div key={group.label ?? `${stat.name}-default-${index}`}>
                        {group.label ? (
                          <p className="text-xs font-bold text-zinc-300 mb-2 ml-1">
                            {group.label}
                          </p>
                        ) : null}
                        <div className="grid grid-cols-1 gap-2">
                          {group.articles.map((article) => (
                            <ArticleCard key={article.slug} article={article} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
