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
    player: "村山 実",
    year: "1970",
    era: "0.98",
    note: "規定投球回到達者の歴代最低（1リーグ時代除く）",
  },
  {
    rank: 2,
    player: "稲尾 和久",
    year: "1956",
    era: "1.06",
    note: "西鉄ライオンズ",
  },
  {
    rank: 3,
    player: "金田 正一",
    year: "1958",
    era: "1.30",
    note: "国鉄スワローズ・歴代最多勝の名手",
  },
  {
    rank: 4,
    player: "杉浦 忠",
    year: "1958",
    era: "1.42",
    note: "南海ホークス・新人王",
  },
  {
    rank: 5,
    player: "斉藤 雅樹",
    year: "1989",
    era: "1.62",
    note: "巨人・沢村賞",
  },
];

const notableSeasons = [
  {
    label: "伊藤智仁（1993, ヤクルト）",
    note: "0.91 — 新人記録、肘の故障で短期間ながら衝撃の数字",
  },
  {
    label: "村田兆治（1981, ロッテ）",
    note: "1.96 — 沢村賞",
  },
  {
    label: "江夏豊（1968, 阪神）",
    note: "2.13 → 翌 1969 年 1.55 へ — 401 奪三振の年",
  },
  {
    label: "前田健太（2010, 広島）",
    note: "2.21 — 沢村賞・MLB 移籍前の最高シーズン",
  },
  {
    label: "山本由伸（2021, オリックス）",
    note: "1.39 — 沢村賞・MVP・パ・リーグ史上 4 人目の防御率 1.39 以下",
  },
];

const faqItems = [
  {
    question: "NPB 歴代最高シーズン防御率は？",
    answer:
      "規定投球回到達者では村山実の 1970 年シーズン 0.98 が歴代最低（=最高評価）クラスです。1 リーグ時代を含めるとさらに低い記録もあります。",
  },
  {
    question: "現役 NPB 選手の防御率の目安は？",
    answer:
      "リーグを代表するエースは 2.50 以下、タイトル争いは 2.00 前後、リーグ平均は 3.50 前後で推移します。1.50 を切るシーズンは年間 0〜1 人の歴史的水準です。",
  },
];

export default function EraRankingNpbColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="NPB 防御率ランキング｜歴代シーズン上位の名投手"
        description="NPB 歴代シーズン防御率上位の名投手と、注目すべき歴史的シーズンを整理。"
        path="/column/era-ranking-npb"
        breadcrumbLeafName="NPB 防御率ランキング"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "NPB 防御率ランキング" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        NPB 防御率ランキング｜歴代シーズン上位の名投手
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        NPB（日本プロ野球）の歴代シーズン防御率上位を整理しました。
        <strong>1 点台以下を残すシーズン</strong>
        は歴代でも限られており、リーグを代表する超一流投手の証です。
      </p>

      <p className="text-sm text-zinc-400 leading-6 mt-2">
        ※本記事の数値は規定投球回到達者を対象としており、年度や情報源によって小数第
        3 位以下が変動する場合があります。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-4">歴代シーズン防御率上位</h2>
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
        <h2 className="text-xl font-bold mb-3">
          他に語られることの多い名シーズン
        </h2>
        <ul className="space-y-2 text-sm text-zinc-300 leading-6 list-disc ml-5">
          {notableSeasons.map((season) => (
            <li key={season.label}>
              <strong>{season.label}</strong>: {season.note}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">現役 NPB 投手の防御率の目安</h2>
        <p className="text-sm text-zinc-300 leading-6">
          シーズンを通して 2.50 以下を維持できれば各球団のエース、2.00
          を切れば最優秀防御率タイトル候補。1.50 以下まで来ると沢村賞・MVP
          級の歴史的シーズンになります。
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
            href="/column/era-ranking-mlb"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">MLB 防御率歴代 TOP</p>
            <p className="text-xs text-zinc-400 mt-1">
              ボブ・ギブソンから現役まで
            </p>
          </Link>
          <Link
            href="/column/npb-era-average"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">NPB 防御率平均値の推移</p>
            <p className="text-xs text-zinc-400 mt-1">リーグ平均と歴代エース</p>
          </Link>
          <Link
            href="/column/era"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率（ERA）とは</p>
            <p className="text-xs text-zinc-400 mt-1">意味・計算方法</p>
          </Link>
          <Link
            href="/column/era-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率の目安・基準</p>
            <p className="text-xs text-zinc-400 mt-1">レベル別の意味</p>
          </Link>
        </div>
      </section>
    </>
  );
}
