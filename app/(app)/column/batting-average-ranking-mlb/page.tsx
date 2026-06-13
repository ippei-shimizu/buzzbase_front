import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

type RankingRow = {
  player: string;
  year: string;
  avg: string;
  note: string;
};

// 規定打席到達者の歴代シーズン打率上位として広く知られる選手のみを記載。
// デッドボール時代（1920 年代以前）の極端な記録は除外し、
// モダンエラ以降を中心に整理する。
const highAverageSeasons: RankingRow[] = [
  {
    player: "テッド・ウィリアムズ",
    year: "1941",
    avg: ".406",
    note: "MLB 最後の 4 割打者・OPS 1.287",
  },
  {
    player: "トニー・グウィン",
    year: "1994",
    avg: ".394",
    note: "ストライキでシーズン途中終了",
  },
  {
    player: "ジョージ・ブレット",
    year: "1980",
    avg: ".390",
    note: "AL MVP・歴代でも稀有な高打率",
  },
  {
    player: "イチロー",
    year: "2004",
    avg: ".372",
    note: "MLB シーズン安打記録 262 本・日本人最高",
  },
  {
    player: "ノマー・ガルシアパーラ",
    year: "2000",
    avg: ".372",
    note: "Red Sox 時代のキャリアハイ",
  },
];

const faqItems = [
  {
    question: "MLB 歴代最高シーズン打率は？",
    answer:
      "モダンエラ以降ではテッド・ウィリアムズの 1941 年シーズン .406 が「MLB 最後の 4 割打者」として歴史に刻まれており、規定打席到達の現代的記録としては最高クラスです。デッドボール時代（1920 年代以前）にはさらに高い記録もあります。",
  },
  {
    question: "日本人 MLB 選手の最高シーズン打率は？",
    answer:
      "イチローの 2004 年シーズン .372 が日本人 MLB 最高記録です。同年はシーズン 262 安打のメジャーリーグ最多安打記録も樹立しました。",
  },
];

export default function BattingAverageRankingMlbColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="MLB 打率歴代 TOP｜テッド・ウィリアムズ・イチローら歴代名打者"
        description="MLB 歴代シーズン打率上位ランキング。最後の 4 割打者ウィリアムズ、イチローの .372 など代表的シーズンを整理。"
        path="/column/batting-average-ranking-mlb"
        breadcrumbLeafName="MLB 打率歴代 TOP"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "MLB 打率歴代 TOP" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        MLB 打率歴代 TOP｜テッド・ウィリアムズ・イチローら歴代名打者
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        MLB（メジャーリーグ）歴代シーズン打率の上位を整理しました。
        <strong>1941 年のテッド・ウィリアムズ .406</strong> が「最後の 4
        割打者」として現代の事実上の最高記録であり、以降は .380
        を超えるシーズンも数えるほどに留まっています。
      </p>

      <p className="text-sm text-zinc-400 leading-6 mt-2">
        ※規定打席到達者を対象としており、年度・出典のカウントによって順位が変動するため、本記事ではあえて順位を付けず代表的なシーズンを整理しています。デッドボール時代（1920
        年代以前）の極端な記録は除外しています。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-4">
          MLB モダンエラ以降の代表的な高打率シーズン
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-zinc-700">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  選手
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  年度
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  打率
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  備考
                </th>
              </tr>
            </thead>
            <tbody>
              {highAverageSeasons.map((row) => (
                <tr
                  key={`${row.player}-${row.year}`}
                  className="even:bg-zinc-800/50"
                >
                  <td className="px-3 py-2 border-b border-zinc-700 text-zinc-200 font-bold">
                    {row.player}
                  </td>
                  <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300 whitespace-nowrap">
                    {row.year}
                  </td>
                  <td className="px-3 py-2 border-b border-zinc-700 text-yellow-500 font-bold whitespace-nowrap">
                    {row.avg}
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
        <h2 className="text-xl font-bold mb-3">現役 MLB 選手の打率の目安</h2>
        <p className="text-sm text-zinc-300 leading-6">
          MLB はリーグ平均が概ね .240〜.260 の範囲で推移します。シーズンを通して
          .320 以上なら首位打者争い、.350 以上は歴史的シーズン、.380
          を超えれば近年では特筆級の偉業です。
        </p>
      </section>

      <div className="mt-8 rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6 text-center">
        <p className="text-lg font-bold mb-2">あなたの打率を計算してみよう</p>
        <Link
          href="/tools/batting-average"
          className="inline-block rounded-lg bg-yellow-600 hover:bg-yellow-500 transition-colors px-6 py-2.5 text-sm font-bold text-white"
        >
          打率計算ツールを使う &rarr;
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
            href="/column/batting-average-ranking-npb"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">NPB 打率ランキング</p>
            <p className="text-xs text-zinc-400 mt-1">
              バース・イチロー・落合ら
            </p>
          </Link>
          <Link
            href="/column/batting-average-350"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">打率 .350 はどのレベル？</p>
            <p className="text-xs text-zinc-400 mt-1">歴代首位打者級</p>
          </Link>
          <Link
            href="/column/batting-average"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">打率とは（基本記事）</p>
            <p className="text-xs text-zinc-400 mt-1">意味・計算方法</p>
          </Link>
          <Link
            href="/column/batting-average-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">打率の目安・基準</p>
            <p className="text-xs text-zinc-400 mt-1">レベル別の意味</p>
          </Link>
        </div>
      </section>
    </>
  );
}
