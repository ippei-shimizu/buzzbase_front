import Link from "next/link";
import AdBanner from "@app/components/ad/AdBanner";
import { adSlots } from "@app/components/ad/adConfig";
import CtaBanner from "../../_components/CtaBanner";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import RunsColumnJsonLd from "./_components/RunsColumnJsonLd";

const faqItems = [
  {
    question: "野球の失点とは？",
    answer:
      "失点とは、投手がマウンドにいる間に相手チームが得た得点の総数です。ヒット、四球、野手のエラーなど、得点に至ったすべての要因による得点が含まれます。投手の責任だけでなく、守備のミスによる得点もカウントされます。",
  },
  {
    question: "失点と自責点の違いは？",
    answer:
      "自責点は野手のエラーがなかったと仮定した場合に入る得点だけを数えたものです。たとえば、エラーで出塁した走者がホームインしても、それは失点にはなりますが自責点にはなりません。防御率の計算には自責点を使います。",
  },
  {
    question: "失点率の計算方法は？",
    answer:
      "失点率は「失点 × 9 ÷ 投球回数」で計算します。防御率が自責点を使うのに対し、失点率は失点（エラーによる得点を含む）を使う点が異なります。チーム全体の守備力も反映されるため、投手単独の評価には防御率が適しています。",
  },
  {
    question: "失点が多いと防御率も悪くなる？",
    answer:
      "必ずしもそうとは限りません。失点にはエラーによる得点が含まれますが、防御率の計算に使う自責点にはエラーによる得点は含まれません。守備が安定しているチームでは失点と自責点の差が小さく、守備にミスが多いチームでは差が大きくなります。",
  },
  {
    question: "「6 回 1 失点」「7 回 3 失点」はどう評価される？",
    answer:
      "6 回 1 失点は QS（クオリティスタート：6回以上 3 自責点以下）の中でも上位の出来。7 回 3 失点も QS のラインギリギリですが、ローテーション維持としては十分な内容です。9 イニング換算するとそれぞれ防御率 1.50 / 3.86 になります。",
  },
  {
    question: "失点率と防御率の差は何点くらいが普通？",
    answer:
      "一般的には失点率は防御率より 0.3〜0.5 程度高くなります。差が 1.0 を超えるシーズンは、その投手がエラーの被害を受けやすい状況にあるか、チームの守備力に課題があると見られます。",
  },
  {
    question: "失点率とエラーの関係は？",
    answer:
      "失点率はエラー由来の得点も含むので、チームのエラー数が多いほど失点率は上がりやすくなります。守備が安定したチームでは投手の防御率と失点率の差が小さく、安定しないチームでは差が大きくなります。",
  },
  {
    question: "リリーフ（中継ぎ・抑え）の失点はどう見る？",
    answer:
      "短いイニングを投げるリリーフ投手の場合、1 失点でも失点率（9 イニング換算）が高く出やすい点に注意が必要です。中継ぎ・抑えは登板回数 × 1 試合あたりの失点も併せて評価します。",
  },
  {
    question: "自責点になる条件は？",
    answer:
      "自責点になるかどうかは、得点に至るプロセスに「エラーや守備妨害があったか」で決まります。走者がエラーなしで進塁し得点した場合は自責点、エラーで進塁・出塁した走者が得点した場合は失点だが自責点にはなりません。判定は公式記録員が行います。",
  },
];

export default function RunsColumnPage() {
  return (
    <>
      <RunsColumnJsonLd faq={faqItems} />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "失点とは" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        野球の失点とは？自責点との違い・失点率の計算方法を解説
      </h1>

      {/* リード文 */}
      <p className="text-sm text-zinc-300 leading-6 mt-4">
        野球の<strong>失点</strong>
        とは、投手がマウンドにいる間に相手チームが得たすべての得点のことです。似た用語の「自責点」とは異なり、野手のエラーによる得点も含みます。この記事では、失点の意味・自責点との違い・失点率の計算方法をわかりやすく解説します。
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
              失点の定義
            </a>
          </li>
          <li>
            <a
              href="#difference"
              className="hover:text-yellow-500 transition-colors"
            >
              失点と自責点の違い
            </a>
          </li>
          <li>
            <a
              href="#calculation"
              className="hover:text-yellow-500 transition-colors"
            >
              失点率の計算方法
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

      {/* 失点の定義 */}
      <section id="meaning" className="mt-10">
        <h2 className="text-xl font-bold mb-4">失点の定義</h2>
        <p className="text-sm text-zinc-300 leading-6">
          失点とは、投手がマウンドにいる間に相手チームが得た得点の総数です。得点の原因がヒットであろうと、四球であろうと、野手のエラーであろうと、すべての得点が失点として記録されます。
        </p>
        <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-yellow-500 font-mono font-bold text-center">
            失点 = 投手がマウンド上にいる間の相手チームの全得点
          </p>
        </div>
        <p className="text-sm text-zinc-300 leading-6 mt-4">
          たとえば、ある投手が7イニングを投げて、相手チームが3点を取った場合、その投手の失点は3です。このうち1点が野手のエラーに起因するものであっても、失点は3のままです。
        </p>
        <p className="text-sm text-zinc-300 leading-6 mt-3">
          失点は投手個人の記録として記録されるだけでなく、チーム全体の投手力を評価する際にも使われます。シーズン通算の失点数はチームの守備力・投手力を示す重要な指標です。
        </p>
      </section>

      {/* 失点と自責点の違い */}
      <section id="difference" className="mt-10">
        <h2 className="text-xl font-bold mb-4">失点と自責点の違い</h2>
        <p className="text-sm text-zinc-300 leading-6">
          失点と自責点の最大の違いは、
          <strong>エラーによる得点を含むかどうか</strong>
          です。
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm border border-zinc-700">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  項目
                </th>
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  失点
                </th>
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  自責点
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-zinc-800/50">
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  エラーによる得点
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-yellow-500 font-bold">
                  含む
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  含まない
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  投手の責任
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  守備のミスも含む
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-yellow-500 font-bold">
                  投手の責任のみ
                </td>
              </tr>
              <tr className="bg-zinc-800/50">
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  防御率の計算
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  使わない
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-yellow-500 font-bold">
                  使う
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  数値の大小
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  自責点以上になる
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  失点以下になる
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="font-bold text-base mt-6 mb-3">具体例で理解する</h3>
        <p className="text-sm text-zinc-300 leading-6">
          ある試合で投手が以下のような場面に遭遇したとします:
        </p>
        <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4 space-y-2">
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">5回表:</span>{" "}
            ショートのエラーで走者が出塁 → そのままホームイン
          </p>
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">6回表:</span>{" "}
            ヒットで出塁した走者がタイムリーで生還
          </p>
          <p className="text-sm text-zinc-300 mt-3">
            <span className="text-zinc-400">失点:</span>{" "}
            <span className="text-yellow-500 font-bold">2</span>
            （エラー起因の1点 + タイムリーの1点）
          </p>
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">自責点:</span>{" "}
            <span className="text-yellow-500 font-bold">1</span>
            （タイムリーの1点のみ）
          </p>
        </div>
        <p className="text-sm text-zinc-300 leading-6 mt-4">
          このように、失点は常に自責点以上の数値になります。守備が安定しているチームでは両者の差が小さく、エラーが多いチームでは差が大きくなります。
        </p>
      </section>

      <AdBanner slot={adSlots.columnMiddle} className="mt-8" />

      {/* 失点率の計算方法 */}
      <section id="calculation" className="mt-10">
        <h2 className="text-xl font-bold mb-4">失点率の計算方法</h2>
        <p className="text-sm text-zinc-300 leading-6">
          失点率は、投手が9イニング投げた場合に何点の失点を与えるかを示す指標です。防御率が自責点を使うのに対し、失点率は失点を使って計算します。
        </p>

        <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-xs text-zinc-400 mb-1">失点率の計算式</p>
          <p className="text-yellow-500 font-mono text-sm">
            失点率 = 失点 × 9 ÷ 投球回数
          </p>
        </div>

        <h3 className="font-bold text-base mt-6 mb-3">計算例</h3>
        <p className="text-sm text-zinc-300 leading-6">
          7イニングを投げて失点3（うち自責点2）の場合:
        </p>
        <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4 space-y-2">
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">失点率 =</span> 3 × 9 ÷ 7 ={" "}
            <span className="text-yellow-500 font-bold">3.86</span>
          </p>
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">防御率 =</span> 2 × 9 ÷ 7 ={" "}
            <span className="text-yellow-500 font-bold">2.57</span>
          </p>
        </div>
        <p className="text-sm text-zinc-300 leading-6 mt-4">
          このように、同じ試合でも失点率は防御率より高くなります。失点率と防御率の差が大きい場合は、チームの守備にエラーが多いことを意味します。
        </p>

        <h3 className="font-bold text-base mt-6 mb-3">防御率との使い分け</h3>
        <p className="text-sm text-zinc-300 leading-6">
          投手個人の実力を評価するには<strong>防御率</strong>
          が適しています。一方、チーム全体の投手力（守備も含む）を評価する場合は
          <strong>失点率</strong>が参考になります。
        </p>

        <div className="mt-6 rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6 text-center">
          <p className="text-lg font-bold mb-2">防御率を計算するなら</p>
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
            href="/column/era"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率（ERA）</p>
            <p className="text-xs text-zinc-400 mt-1">
              自責点ベースの投手評価指標
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
            href="/tools/era"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率計算ツール</p>
            <p className="text-xs text-zinc-400 mt-1">
              自責点と投球回から防御率を自動計算
            </p>
          </Link>
        </div>
      </section>

      {/* 関連コラム */}
      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">関連コラム</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/column/runs-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">失点率（RA）の目安</p>
            <p className="text-xs text-zinc-400 mt-1">
              レベル別目安と防御率との使い分け
            </p>
          </Link>
          <Link
            href="/column/era-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率の目安・基準</p>
            <p className="text-xs text-zinc-400 mt-1">
              1.00 / 2.00 / 3.00 / 4.00 の意味
            </p>
          </Link>
          <Link
            href="/column/era-vs-runs"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率と失点率の違い</p>
            <p className="text-xs text-zinc-400 mt-1">指標の使い分け方</p>
          </Link>
          <Link
            href="/column/era-ranking-npb"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">NPB 防御率ランキング</p>
            <p className="text-xs text-zinc-400 mt-1">歴代上位の日本人名投手</p>
          </Link>
        </div>
      </section>

      {/* BUZZ BASEアプリCTA */}
      <CtaBanner
        className="mt-10"
        heading="投手成績をアプリでまとめて管理するなら"
        body="BUZZ BASEアプリなら試合結果を入力するだけで、防御率・失点を含む全投手指標を自動算出。チームメイトとランキング形式で成績を共有できます。完全無料。"
      />

      <AdBanner
        slot={adSlots.columnHorizontal}
        format="horizontal"
        className="mt-8"
      />
    </>
  );
}
