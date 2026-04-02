import Link from "next/link";
import AdBanner from "@app/components/ad/AdBanner";
import { adSlots } from "@app/components/ad/adConfig";
import CtaBanner from "../../_components/CtaBanner";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import EraColumnJsonLd from "./_components/EraColumnJsonLd";

const faqItems = [
  {
    question: "防御率の計算方法は？",
    answer:
      "防御率は「自責点 × 9 ÷ 投球回数」で計算します。たとえば、7イニングで2自責点なら、防御率は 2 × 9 ÷ 7 = 2.57 です。投球回数が 6回1/3 の場合は 6.333... として計算します。",
  },
  {
    question: "自責点と失点の違いは？",
    answer:
      "自責点は投手の責任による得点のみを数えたもので、野手のエラーで生じた得点は含みません。失点はエラーによる得点も含むすべての得点です。防御率の計算には自責点を使います。",
  },
  {
    question: "防御率の良い数値はいくつ？",
    answer:
      "プロ野球（NPB）では防御率2.00以下がエース級、2.00〜3.00が優秀、3.00〜4.00がリーグ平均前後です。高校野球では木製バットではないため、2.00以下なら地区大会で上位を狙える投手です。",
  },
  {
    question: "高校野球の防御率の目安は？",
    answer:
      "高校野球では金属バットを使用するため、プロ野球より全体的に数値が高くなる傾向があります。2.00以下ならエース級、2.00〜3.00なら好投手、3.00〜4.00が平均的、4.00以上は改善が必要です。",
  },
];

export default function EraColumnPage() {
  return (
    <>
      <EraColumnJsonLd faq={faqItems} />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "防御率とは" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        防御率（ERA）とは？計算方法・目安値・良い数値の基準を解説
      </h1>

      {/* リード文 */}
      <p className="text-sm text-zinc-300 leading-6 mt-4">
        防御率（ERA）とは、
        <strong>投手が9イニング投げたと仮定した場合に何点取られるか</strong>
        を示す野球の投手指標です。「Earned Run
        Average」の略で、投手の実力を客観的に評価するために最も広く使われています。この記事では、防御率の意味・計算方法・レベル別の目安値を詳しく解説します。
      </p>

      {/* 目次 */}
      <nav className="mt-6 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
        <p className="font-bold text-sm mb-3">目次</p>
        <ol className="list-decimal list-inside text-sm text-zinc-300 space-y-2">
          <li>
            <a
              href="#meaning"
              className="hover:text-yellow-500 transition-colors"
            >
              防御率の意味
            </a>
          </li>
          <li>
            <a
              href="#calculation"
              className="hover:text-yellow-500 transition-colors"
            >
              防御率の計算方法と計算例
            </a>
          </li>
          <li>
            <a
              href="#benchmarks"
              className="hover:text-yellow-500 transition-colors"
            >
              防御率の目安値・評価基準
            </a>
          </li>
          <li>
            <a href="#faq" className="hover:text-yellow-500 transition-colors">
              よくある質問
            </a>
          </li>
          <li>
            <a
              href="#related"
              className="hover:text-yellow-500 transition-colors"
            >
              関連指標
            </a>
          </li>
        </ol>
      </nav>

      {/* 防御率の意味 */}
      <section id="meaning" className="mt-10">
        <h2 className="text-xl font-bold mb-4">防御率の意味</h2>
        <p className="text-sm text-zinc-300 leading-6">
          防御率は「Earned Run
          Average」の略で、投手が9イニング（1試合分）を投げたと仮定した場合に、何点の自責点を与えるかを示す指標です。
        </p>
        <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-yellow-500 font-mono font-bold text-center">
            防御率（ERA） = 自責点 × 9 ÷ 投球回数
          </p>
        </div>
        <p className="text-sm text-zinc-300 leading-6 mt-4">
          ここで重要なのは、防御率の計算に使うのは
          <strong>「自責点」であり「失点」ではない</strong>
          という点です。自責点とは、野手のエラーを除いた投手の責任による得点だけを数えたものです。これにより、守備力に左右されず投手本来の実力を評価できます。
        </p>
        <p className="text-sm text-zinc-300 leading-6 mt-3">
          防御率が低いほど優秀な投手であることを示します。NPB（日本プロ野球）やMLB（メジャーリーグ）では、先発投手・リリーフ投手の評価に欠かせない指標として広く活用されています。
        </p>
      </section>

      {/* 計算方法 + 計算例 */}
      <section id="calculation" className="mt-10">
        <h2 className="text-xl font-bold mb-4">防御率の計算方法と計算例</h2>
        <p className="text-sm text-zinc-300 leading-6">
          防御率の計算式はシンプルで、自責点と投球回数の2つの数値がわかれば計算できます。
        </p>

        <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-xs text-zinc-400 mb-1">防御率の計算式</p>
          <p className="text-yellow-500 font-mono text-sm">
            防御率 = 自責点 × 9 ÷ 投球回数
          </p>
        </div>

        <h3 className="font-bold text-base mt-6 mb-3">計算例①：先発投手</h3>
        <p className="text-sm text-zinc-300 leading-6">
          7イニングを投げて自責点2の場合:
        </p>
        <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">防御率 =</span> 2 × 9 ÷ 7 ={" "}
            <span className="text-yellow-500 font-bold">2.57</span>
          </p>
        </div>

        <h3 className="font-bold text-base mt-6 mb-3">
          計算例②：端数のある投球回
        </h3>
        <p className="text-sm text-zinc-300 leading-6">
          6回1/3を投げて自責点3の場合（6回1/3 = 6.333...回）:
        </p>
        <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">防御率 =</span> 3 × 9 ÷ 6.333 ={" "}
            <span className="text-yellow-500 font-bold">4.26</span>
          </p>
        </div>
        <p className="text-xs text-zinc-400 mt-2">
          ※ 投球回の「1/3」は1アウト分を意味します。6回1/3 =
          19アウト（6×3+1）を取ったことになります。
        </p>

        <h3 className="font-bold text-base mt-6 mb-3">計算例③：リリーフ投手</h3>
        <p className="text-sm text-zinc-300 leading-6">
          2イニングを投げて自責点0の場合:
        </p>
        <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">防御率 =</span> 0 × 9 ÷ 2 ={" "}
            <span className="text-yellow-500 font-bold">0.00</span>
          </p>
        </div>

        <p className="text-sm text-zinc-300 leading-6 mt-4">
          自分の成績から防御率を計算したい場合は、無料の計算ツールを使えば数値を入力するだけで瞬時に算出できます。
        </p>
        <Link
          href="/tools/era"
          className="inline-flex items-center gap-1 mt-3 text-sm text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
        >
          防御率計算ツールで今すぐ計算する &rarr;
        </Link>
      </section>

      <AdBanner slot={adSlots.columnMiddle} className="mt-8" />

      {/* 目安値・評価基準 */}
      <section id="benchmarks" className="mt-10">
        <h2 className="text-xl font-bold mb-4">防御率の目安値・評価基準</h2>
        <p className="text-sm text-zinc-300 leading-6 mb-4">
          防御率の評価基準はカテゴリによって異なります。以下にプロ野球（NPB）と高校野球の目安を示します。
        </p>

        <h3 className="font-bold text-base mb-3">
          プロ野球（NPB）の防御率目安
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-zinc-700">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  評価
                </th>
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  防御率
                </th>
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  説明
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-zinc-800/50">
                <td className="px-4 py-2 border-b border-zinc-700 text-yellow-500 font-bold">
                  A（エース級）
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  2.00以下
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  リーグを代表するエース。最優秀防御率のタイトル候補
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b border-zinc-700 text-yellow-500 font-bold">
                  B（優秀）
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  2.00〜3.00
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  ローテーションの柱を任せられる好投手
                </td>
              </tr>
              <tr className="bg-zinc-800/50">
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  C（平均的）
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  3.00〜4.00
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  リーグ平均前後。先発ローテーションとして標準的
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  D（要改善）
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  4.00以上
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  失点が多い。球種や制球力の改善が求められる
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="font-bold text-base mt-6 mb-3">高校野球の防御率目安</h3>
        <p className="text-sm text-zinc-300 leading-6 mb-3">
          高校野球では金属バットを使用するため、プロ野球より全体的に数値が高くなる傾向があります。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-zinc-700">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  評価
                </th>
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  防御率
                </th>
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  説明
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-zinc-800/50">
                <td className="px-4 py-2 border-b border-zinc-700 text-yellow-500 font-bold">
                  優秀
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  2.00以下
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  地区大会で上位を狙えるエース級
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  好投手
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  2.00〜3.00
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  チームの主戦投手として十分な成績
                </td>
              </tr>
              <tr className="bg-zinc-800/50">
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  平均的
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  3.00〜4.00
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  標準的なレベル。安定感の向上が課題
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  要改善
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  4.00以上
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  制球力や変化球の精度を上げる練習が必要
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 計算ツールCTA */}
        <div className="mt-8 rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6 text-center">
          <p className="text-lg font-bold mb-2">今すぐ自分の防御率を計算する</p>
          <p className="text-sm text-zinc-300 mb-4">
            自責点と投球回数を入力するだけで防御率を自動計算。登録不要・完全無料。
          </p>
          <Link
            href="/tools/era"
            className="inline-block rounded-lg bg-yellow-600 hover:bg-yellow-500 transition-colors px-6 py-2.5 text-sm font-bold text-white"
          >
            防御率計算ツールを使う &rarr;
          </Link>
        </div>
      </section>

      <AdBanner slot={adSlots.columnBottom} className="mt-8" />

      {/* よくある質問 */}
      <section id="faq" className="mt-10">
        <h2 className="text-xl font-bold mb-4">よくある質問</h2>
        <div className="space-y-3">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group rounded-lg border border-zinc-700 bg-zinc-800/50"
            >
              <summary className="cursor-pointer px-5 py-3 text-sm font-bold text-zinc-200 flex items-center justify-between">
                {item.question}
                <span className="text-zinc-400 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="px-5 pb-4 text-sm text-zinc-300 leading-6">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 関連指標 */}
      <section id="related" className="mt-10">
        <h2 className="text-xl font-bold mb-4">関連指標</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/column/runs"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">失点とは</p>
            <p className="text-xs text-zinc-400 mt-1">
              失点と自責点の違い・失点率の計算
            </p>
          </Link>
          <Link
            href="/tools/whip"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">WHIP</p>
            <p className="text-xs text-zinc-400 mt-1">
              1イニングあたりの走者数を評価
            </p>
          </Link>
          <Link
            href="/tools/k-9"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">K/9（奪三振率）</p>
            <p className="text-xs text-zinc-400 mt-1">
              9イニングあたりの奪三振数
            </p>
          </Link>
        </div>
      </section>

      {/* BUZZ BASEアプリCTA */}
      <CtaBanner
        className="mt-10"
        heading="投手成績をアプリでまとめて管理するなら"
        body="BUZZ BASEアプリなら試合結果を入力するだけで、防御率を含む全投手指標を自動算出。チームメイトとランキング形式で成績を共有できます。完全無料。"
      />

      <AdBanner
        slot={adSlots.columnHorizontal}
        format="horizontal"
        className="mt-8"
      />
    </>
  );
}
