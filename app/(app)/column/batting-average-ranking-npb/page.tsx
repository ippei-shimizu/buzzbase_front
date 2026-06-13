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
// 順位は出典・規定打席のカウントによって変動するため、本記事ではあえて順位を付けず
// 「高打率を残した歴代の代表的シーズン」として整理する。
const highAverageSeasons: RankingRow[] = [
  {
    player: "ランディ・バース",
    year: "1986",
    avg: ".389",
    note: "阪神・2 年連続三冠王 (.389/47本/109打点)",
  },
  {
    player: "イチロー",
    year: "2000",
    avg: ".387",
    note: "オリックス・NPB 最終シーズン",
  },
  {
    player: "イチロー",
    year: "1994",
    avg: ".385",
    note: "オリックス・シーズン 210 安打のプロ野球記録樹立",
  },
  {
    player: "ランディ・バース",
    year: "1985",
    avg: ".350",
    note: "阪神・三冠王、.350/54本/134打点",
  },
  {
    player: "落合 博満",
    year: "1985",
    avg: ".367",
    note: "ロッテ・2 度目の三冠王 (.367/52本/146打点)",
  },
  {
    player: "落合 博満",
    year: "1986",
    avg: ".360",
    note: "ロッテ・3 度目の三冠王 (.360/50本/116打点)",
  },
  {
    player: "青木 宣親",
    year: "2010",
    avg: ".358",
    note: "ヤクルト・首位打者・最高出塁率",
  },
];

const faqItems = [
  {
    question: "NPB 歴代最高シーズン打率は？",
    answer:
      "ランディ・バースの 1986 年シーズン .389 が NPB 歴代最高クラスとして広く知られています。2 年連続三冠王の年で、47 本塁打・109 打点も併記される伝説的なシーズンです。",
  },
  {
    question: "現役 NPB 選手の打率の目安は？",
    answer:
      "リーグを代表する打者は .320 以上、首位打者争いは .330〜.350 で展開されます。.300 を超えるシーズンは規定打席到達者の中で年間 10 名前後で、好打者の証として安定した評価を得られます。",
  },
];

export default function BattingAverageRankingNpbColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="NPB 打率ランキング｜歴代シーズン上位の名打者"
        description="NPB 歴代シーズン打率上位の名打者と、首位打者争いを彩った代表的シーズンを整理。"
        path="/column/batting-average-ranking-npb"
        breadcrumbLeafName="NPB 打率ランキング"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "NPB 打率ランキング" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        NPB 打率ランキング｜歴代シーズン上位の名打者
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        NPB（日本プロ野球）の歴代シーズン打率の代表的な高打率シーズンを整理しました。
        <strong>.350 を超えるシーズン</strong>
        は歴代でも限られており、リーグを代表するヒットメーカーの証です。
      </p>

      <p className="text-sm text-zinc-400 leading-6 mt-2">
        ※規定打席到達者を対象としており、年度・出典・規定打席のカウントによって順位が変動するため、本記事ではあえて順位を付けず「代表的な高打率シーズン」として時系列・記録の特徴別に整理しています。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-4">代表的な高打率シーズン</h2>
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
        <h2 className="text-xl font-bold mb-3">現役 NPB 選手の打率の目安</h2>
        <p className="text-sm text-zinc-300 leading-6">
          シーズンを通して .320
          以上を維持できればリーグを代表する打者、.330〜.350
          で首位打者争い、.350
          を超えれば歴代級のシーズンに位置付けられます。リーグ平均はおおむね
          .240〜.260 で推移し、レギュラー定着の最低ラインは .250 が目安です。
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
            href="/column/batting-average-ranking-mlb"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">MLB 打率歴代 TOP</p>
            <p className="text-xs text-zinc-400 mt-1">イチロー .372 を含む</p>
          </Link>
          <Link
            href="/column/npb-batting-average-average"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">NPB 打率平均値の推移</p>
            <p className="text-xs text-zinc-400 mt-1">リーグ平均と歴代名打者</p>
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
