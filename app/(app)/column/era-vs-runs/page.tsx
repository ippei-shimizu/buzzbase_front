import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "防御率と失点率の違いは？",
    answer:
      "防御率（ERA）は自責点だけを使い、失点率（RA）はエラーによる失点も含めた失点全体を使います。同じ投手の同じ試合でも、失点率は防御率以上の値になります。",
  },
  {
    question: "失点と自責点の違いは？",
    answer:
      "失点は投手がマウンドにいる間に相手チームが取った全ての得点。自責点はそのうち、野手のエラーがなかったと仮定して入る得点だけを数えたものです。守備のミスによる得点は失点には含まれますが、自責点からは除外されます。",
  },
  {
    question: "どっちの指標を見るべき？",
    answer:
      "投手単独の純粋な実力を評価するなら防御率、チーム守備込みでの実際の失点結果を評価するなら失点率を使います。両方を見ることで「投手の実力 vs チームの結果」の差異がわかります。",
  },
];

export default function EraVsRunsColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="防御率と失点率の違いをわかりやすく解説｜自責点・失点の使い分け"
        description="防御率（ERA）と失点率（RA）の違いと使い分け方を、自責点と失点の定義から具体例で整理。"
        path="/column/era-vs-runs"
        breadcrumbLeafName="防御率と失点率の違い"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "防御率と失点率の違い" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        防御率と失点率の違いをわかりやすく解説
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        防御率（ERA）と失点率（RA）はどちらも投手評価に使う指標ですが、
        <strong>「自責点を使うか / 失点を使うか」</strong>の 1
        点が決定的に違います。本記事では両者の意味と使い分け方、具体例を整理します。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">2 指標の比較表</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-zinc-700">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  指標
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  式
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  使う数字
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2 border-b border-zinc-700 font-bold text-yellow-500">
                  防御率（ERA）
                </td>
                <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300">
                  自責点 × 9 ÷ 投球回
                </td>
                <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300">
                  エラー除く失点
                </td>
              </tr>
              <tr className="bg-zinc-800/50">
                <td className="px-3 py-2 border-b border-zinc-700 font-bold text-yellow-500">
                  失点率（RA）
                </td>
                <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300">
                  失点 × 9 ÷ 投球回
                </td>
                <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300">
                  エラー含む全失点
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">具体例で見る違い</h2>
        <p className="text-sm text-zinc-300 leading-6">
          7 イニングを投げて失点 3（うち 1 はエラー由来、自責点 2）の場合:
        </p>
        <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4 space-y-2">
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">防御率 =</span> 2 × 9 ÷ 7 ={" "}
            <span className="text-yellow-500 font-bold">2.57</span>
          </p>
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">失点率 =</span> 3 × 9 ÷ 7 ={" "}
            <span className="text-yellow-500 font-bold">3.86</span>
          </p>
        </div>
        <p className="text-sm text-zinc-300 leading-6 mt-3">
          差 1.29 がエラー由来の失点。<strong>同じ投球内容</strong>
          でも、守備に助けられない試合では失点率が大きく悪化します。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">どう使い分ける？</h2>
        <ul className="text-sm text-zinc-300 leading-6 list-disc ml-5 space-y-1">
          <li>
            <strong>防御率（ERA）:</strong>{" "}
            投手の純粋な実力を比較する時の基本指標
          </li>
          <li>
            <strong>失点率（RA）:</strong>{" "}
            チームが実際に許した失点ベースの結果指標。WAR の計算などで使われる
          </li>
          <li>
            <strong>両者の差が大きい投手:</strong> 守備に助けられていない /
            助けられている、を表す
          </li>
        </ul>
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
            href="/column/era"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率（ERA）とは（基本記事）</p>
            <p className="text-xs text-zinc-400 mt-1">意味・計算方法</p>
          </Link>
          <Link
            href="/column/runs"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">失点・自責点とは</p>
            <p className="text-xs text-zinc-400 mt-1">定義と計算</p>
          </Link>
          <Link
            href="/column/era-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率の目安・基準</p>
            <p className="text-xs text-zinc-400 mt-1">レベル別の意味</p>
          </Link>
          <Link
            href="/column/runs-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">失点率の目安</p>
            <p className="text-xs text-zinc-400 mt-1">RA の目安</p>
          </Link>
        </div>
      </section>
    </>
  );
}
