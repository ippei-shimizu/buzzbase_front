import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

type RankingRow = {
  rank: number;
  player: string;
  year: string;
  era: string;
  note: string;
};

const historicalRanking: RankingRow[] = [
  {
    rank: 1,
    player: "ボブ・ギブソン",
    year: "1968",
    era: "1.12",
    note: "「投高打低の象徴」、翌年から MLB がマウンドを下げる契機に (22勝9敗)",
  },
  {
    rank: 2,
    player: "ドワイト・グッデン",
    year: "1985",
    era: "1.53",
    note: "CY Young 賞・投手三冠 (24勝・268奪三振)",
  },
  {
    rank: 3,
    player: "グレッグ・マダックス",
    year: "1995",
    era: "1.63",
    note: "CY Young 賞 4 連覇の年 (19勝2敗・WS 制覇)",
  },
  {
    rank: 4,
    player: "ジェイコブ・デグロム",
    year: "2018",
    era: "1.70",
    note: "CY Young 賞、現代のエース基準",
  },
  {
    rank: 5,
    player: "ペドロ・マルティネス",
    year: "2000",
    era: "1.74",
    note: "WHIP 0.737 は歴代最低 (18勝6敗・284奪三振)",
  },
  {
    rank: 6,
    player: "ロジャー・クレメンス",
    year: "1990",
    era: "1.93",
    note: "AL CY Young 賞",
  },
  {
    rank: 7,
    player: "ザック・グレインキー",
    year: "2009",
    era: "2.16",
    note: "AL CY Young 賞",
  },
];

const faqItems = [
  {
    question: "MLB 歴代最高シーズン防御率は？",
    answer:
      "デッドボール時代を除けば、ボブ・ギブソンの 1968 年シーズン 1.12 が現代寄りの記録としてはトップクラスです。同年は「ピッチャーズイヤー」と呼ばれリーグ全体が投高打低でした。",
  },
  {
    question: "現役 MLB 投手で 2 点台の選手は？",
    answer:
      "シーズンを通して 2 点台を維持できれば CY Young 賞争いに絡みます。直近ではジェイコブ・デグロム、シャヘイ・オオタニ、ザック・ホイーラーらが該当する年があります。",
  },
];

export default function EraRankingMlbColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="MLB 防御率歴代 TOP｜ボブ・ギブソンから現役まで歴代シーズン最低 ERA"
        description="MLB 歴代シーズン防御率上位ランキング。ボブ・ギブソンの 1.12 から現代のジェイコブ・デグロムまで。"
        path="/column/era-ranking-mlb"
        breadcrumbLeafName="MLB 防御率歴代 TOP"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "MLB 防御率歴代 TOP" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        MLB 防御率歴代 TOP｜ボブ・ギブソンから現役まで歴代シーズン最低 ERA
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        MLB（メジャーリーグ）歴代シーズン防御率の上位を整理しました。
        <strong>
          ボブ・ギブソン、ペドロ・マルティネス、グレッグ・マダックス
        </strong>
        といった伝説的なエースたちが上位に並びます。
      </p>

      <p className="text-sm text-zinc-400 leading-6 mt-2">
        ※本記事の数値は規定投球回到達者を対象としており、年度や情報源によって小数第
        3 位以下が変動する場合があります。デッドボール時代（1920
        年代以前）の極端な記録は除外して整理しています。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-4">
          MLB 歴代シーズン防御率上位（モダンエラ）
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-zinc-700">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  順位
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  選手
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  年度
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  防御率
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  備考
                </th>
              </tr>
            </thead>
            <tbody>
              {historicalRanking.map((row) => (
                <tr
                  key={`${row.player}-${row.year}`}
                  className="even:bg-zinc-800/50"
                >
                  <td className="px-3 py-2 border-b border-zinc-700 text-yellow-500 font-bold">
                    {row.rank}
                  </td>
                  <td className="px-3 py-2 border-b border-zinc-700 text-zinc-200 font-bold">
                    {row.player}
                  </td>
                  <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300 whitespace-nowrap">
                    {row.year}
                  </td>
                  <td className="px-3 py-2 border-b border-zinc-700 text-yellow-500 font-bold whitespace-nowrap">
                    {row.era}
                  </td>
                  <td className="px-3 py-2 border-b border-zinc-700 text-zinc-400">
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">現役 MLB 投手の防御率水準</h2>
        <p className="text-sm text-zinc-300 leading-6">
          シーズンを通して 3.00 以下なら All-Star 級、2.50 以下で CY Young
          賞争い、2.00 を切れば歴史的シーズン。MLB はリーグ平均が NPB
          より高め（3.80〜4.20）なので、同じ数字でも価値が上振れます。
        </p>
      </section>

      <div className="mt-8 rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6 text-center">
        <p className="text-lg font-bold mb-2">あなたの防御率を計算してみよう</p>
        <Link
          href="/tools/era"
          className="inline-block rounded-lg bg-yellow-600 hover:bg-yellow-500 transition-colors px-6 py-2.5 text-sm font-bold text-white"
        >
          防御率計算ツールを使う &rarr;
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">よくある質問</h2>
        <div className="space-y-3">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group rounded-lg border border-zinc-700 bg-zinc-800/50"
            >
              <summary className="cursor-pointer px-5 py-3 text-sm font-bold text-zinc-200">
                {item.question}
              </summary>
              <p className="px-5 pb-4 text-sm text-zinc-300 leading-6">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">関連コラム</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/column/era-ranking-npb"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">NPB 防御率ランキング</p>
            <p className="text-xs text-zinc-400 mt-1">歴代上位の日本人名投手</p>
          </Link>
          <Link
            href="/column/era-1"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率 1 点台はどのレベル？</p>
            <p className="text-xs text-zinc-400 mt-1">歴代級水準</p>
          </Link>
          <Link
            href="/column/era"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率（ERA）とは</p>
            <p className="text-xs text-zinc-400 mt-1">意味・計算方法</p>
          </Link>
          <Link
            href="/column/npb-era-average"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">NPB 防御率平均値の推移</p>
            <p className="text-xs text-zinc-400 mt-1">リーグ平均と歴代エース</p>
          </Link>
        </div>
      </section>
    </>
  );
}
