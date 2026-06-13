import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "失点率の計算方法は？",
    answer:
      "失点率は「失点 × 9 ÷ 投球回数」で計算します。たとえば 7 イニングで失点 3 なら、3 × 9 ÷ 7 = 3.86 になります。防御率の計算式（自責点 × 9 ÷ 投球回数）と同じ構造で、自責点ではなく失点を使う点だけが異なります。",
  },
  {
    question: "失点率と防御率の使い分けは？",
    answer:
      "個人投手の純粋な実力を評価するなら防御率（ERA）、投手の実出来高やチーム守備力込みの結果を見るなら失点率（RA）を使います。失点率が防御率より明らかに高い場合は、チームの守備にエラーが多いことを意味します。",
  },
  {
    question: "失点率はいくつから良いと言える？",
    answer:
      "NPB のリーグ平均失点率はおおむね 3.80〜4.20 で推移するため、3.50 を下回れば優秀、3.00 以下なら一線級です。防御率 + 0.3〜0.5 程度が一般的な失点率の上振れ幅です。",
  },
  {
    question: "失点率が高くて防御率が低い投手は？",
    answer:
      "失点率と防御率の差が大きいほど「守備のエラーで余計な失点を喰らっている」状態。投手本人の実力（防御率）は良いが、チーム成績的には失点が嵩んでしまうケースです。",
  },
];

export default function RunsCriteriaColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="失点率（RA）はいくつから良い？目安・計算方法・防御率との違い"
        description="失点率（RA）の計算方法、レベル別の目安、防御率との使い分けを整理。"
        path="/column/runs-criteria"
        breadcrumbLeafName="失点率の目安"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "失点率の目安" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        失点率（RA）はいくつから良い？目安・計算方法・防御率との違い
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        失点率（RA：Run Average）とは、投手が 9
        イニング投げた場合に何点の失点を許すかを示す指標です。自責点ベースの防御率（ERA）と違い、
        <strong>野手のエラーによる失点も含めて評価</strong>
        するため、投手単独の実力ではなくチーム守備込みでの結果指標として使われます。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">失点率の計算方法</h2>
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-yellow-500 font-mono text-sm text-center">
            失点率（RA） = 失点 × 9 ÷ 投球回数
          </p>
        </div>
        <p className="text-sm text-zinc-300 leading-6 mt-3">
          7 回を投げて失点 3 なら、3 × 9 ÷ 7 = <strong>3.86</strong>
          。同じ試合で自責点が 2 なら防御率は 2 × 9 ÷ 7 = 2.57 となり、両者の差
          1.29 がエラー由来の失点ということになります。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">失点率の目安</h2>
        <p className="text-sm text-zinc-300 leading-6">
          NPB のリーグ平均失点率は概ね <strong>3.80〜4.20</strong>
          で推移しており、これを基準に評価します。
        </p>
        <ul className="text-sm text-zinc-300 leading-6 list-disc ml-5 space-y-1 mt-3">
          <li>
            <strong>2.00 以下:</strong> 歴代級・絶対的エース水準
          </li>
          <li>
            <strong>2.00〜2.99:</strong> エース・タイトル争い
          </li>
          <li>
            <strong>3.00〜3.49:</strong> 好投手・ローテーション中軸
          </li>
          <li>
            <strong>3.50〜3.99:</strong> リーグ平均下〜やや上
          </li>
          <li>
            <strong>4.00 以上:</strong> 平均以下・改善余地あり
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">失点率と防御率の使い分け</h2>
        <p className="text-sm text-zinc-300 leading-6">
          <strong>投手の純粋な実力</strong>を見たいときは防御率、
          <strong>実際にチームが許した失点</strong>
          を含めた結果を見たいときは失点率。両者の差が大きい投手は守備に助けられていない・足を引っ張られているということです。
        </p>
        <p className="text-sm text-zinc-400 leading-6 mt-3">
          MLB
          のセイバーメトリクスでは、防御率より失点率（RA9）の方が「実際に起きた失点」を反映するため重視されることもあります。WAR（勝利貢献度）の計算では失点率ベースの版が使われる場面もあります。
        </p>
      </section>

      <div className="mt-8 rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6 text-center">
        <p className="text-lg font-bold mb-2">防御率を計算してみよう</p>
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
            href="/column/runs"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">失点・自責点とは</p>
            <p className="text-xs text-zinc-400 mt-1">
              失点と自責点の違い・計算
            </p>
          </Link>
          <Link
            href="/column/era"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率（ERA）とは</p>
            <p className="text-xs text-zinc-400 mt-1">意味・計算方法・読み方</p>
          </Link>
          <Link
            href="/column/era-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率の目安・基準</p>
            <p className="text-xs text-zinc-400 mt-1">
              レベル別の意味・先発/中継ぎ別
            </p>
          </Link>
          <Link
            href="/column/era-vs-runs"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率と失点率の違い</p>
            <p className="text-xs text-zinc-400 mt-1">指標の使い分け方</p>
          </Link>
        </div>
      </section>
    </>
  );
}
