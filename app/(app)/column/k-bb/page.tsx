import Link from "next/link";
import AdBanner from "@app/components/ad/AdBanner";
import { adSlots } from "@app/components/ad/adConfig";
import CtaBanner from "../../_components/CtaBanner";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleDates from "../_components/ColumnArticleDates";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";
import {
  COLUMN_PUBLISHED_AT,
  COLUMN_UPDATED_AT,
  KBB_COLUMN_DESCRIPTION,
  KBB_COLUMN_TITLE,
} from "./_constants/meta";

const faqItems = [
  {
    question: "K/BBの読み方は？",
    answer:
      "「ケーバイビービー」または「ケービービー」と読みます。K は奪三振（Strikeout）、BB は四球（Base on Balls）の略で、英語では Strikeout-to-Walk Ratio と呼ばれます。",
  },
  {
    question: "K/BBはどうやって出す？死球は含む？",
    answer:
      "K/BB = 奪三振 ÷ 与四球 で計算します。たとえば奪三振 80・与四球 20 なら 80 ÷ 20 = 4.00 です。死球は与四球に含めません。",
  },
  {
    question: "K/BBはいくつから良い？",
    answer:
      "NPB のリーグ平均はおおむね 2.50 前後です。3.00 以上で優秀、4.00 以上で非常に優秀、5.00 以上ならリーグトップクラスの制球力と奪三振能力を兼ね備えた投手といえます。2.00 を下回ると四球が多く、制球に課題がある水準です。",
  },
  {
    question: "高校野球ではK/BBをどう読めばいい？",
    answer:
      "高校生は四球が多くなりがちなので、2.00 を超えていれば平均以上、3.00 以上あれば制球力のあるエースです。甲子園出場レベルのエースは 4.00 以上を記録することもあります。",
  },
  {
    question: "与四球が 0 のときK/BBはどうなる？",
    answer:
      "奪三振 ÷ 0 となり計算できません（ゼロ除算）。記録上は「計算不能」や「∞」として扱われますが、与四球 0 は制球力が最高の状態を意味します。短いイニングでは起こりやすいので、ある程度の投球回がまとまってから評価するのがおすすめです。",
  },
  {
    question: "K/BBだけで投手は評価できる？",
    answer:
      "K/BB だけでは不十分です。K/BB は奪三振と与四球の比率で、投球回の情報を含みません。K/9 は 9 イニングあたりの奪三振数、BB/9 は 9 イニングあたりの与四球数で、それぞれ絶対数を示します。K/BB が同じ 3.00 でも、K/9 が 9.00 の奪三振型と 5.00 の打たせて取る型では投球スタイルが異なります。",
  },
  {
    question: "K/BBとWHIPの違いは？",
    answer:
      "WHIP は（与四球＋被安打）÷ 投球回で、走者をどれだけ許したかを示します。K/BB は安打を含まず、三振と四球のバランスだけを見る指標です。K/BB が高くても被安打が多ければ WHIP は悪化するため、2 つを併用すると投手の特徴がより正確に分かります。",
  },
  {
    question: "K/BBが低い投手は何を改善すべき？",
    answer:
      "原因は「三振が少ない」か「四球が多い」かのどちらかです。BB/9 が高いなら制球（ストライク先行で四球を減らす）、K/9 が低いなら空振りを取れる決め球の習得が課題になります。多くの場合、四球を減らす方が短期間で K/BB は改善します。",
  },
];

const npbBenchmarks = [
  {
    level: "S",
    range: "5.00 以上",
    label: "リーグトップ級",
    description: "制球と奪三振を両立。最多奪三振・沢村賞候補の水準",
  },
  {
    level: "A",
    range: "4.00〜4.99",
    label: "非常に優秀",
    description: "エース級。四球が少なく三振も多い安定した投球",
  },
  {
    level: "B",
    range: "3.00〜3.99",
    label: "優秀",
    description: "ローテーションの柱として計算できる制球力",
  },
  {
    level: "C",
    range: "2.00〜2.99",
    label: "平均",
    description: "NPB のリーグ平均前後（約 2.50）",
  },
  {
    level: "D",
    range: "2.00 未満",
    label: "要改善",
    description: "四球が多く走者を溜めやすい。制球の改善が課題",
  },
];

const highSchoolBenchmarks = [
  { range: "4.00 以上", label: "甲子園レベルのエース" },
  { range: "3.00〜3.99", label: "地区大会で上位を狙えるエース級" },
  { range: "2.00〜2.99", label: "平均以上の制球力" },
  { range: "2.00 未満", label: "四球が多く、制球が課題" },
];

export default function KbbColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline={KBB_COLUMN_TITLE}
        description={KBB_COLUMN_DESCRIPTION}
        path="/column/k-bb"
        breadcrumbLeafName="K/BBとは"
        faq={faqItems}
        datePublished={COLUMN_PUBLISHED_AT}
        dateModified={COLUMN_UPDATED_AT}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "K/BBとは" },
        ]}
      />

      <h1 className="text-2xl font-bold">{KBB_COLUMN_TITLE}</h1>
      <ColumnArticleDates
        publishedAt={COLUMN_PUBLISHED_AT}
        updatedAt={COLUMN_UPDATED_AT}
      />

      <p className="mt-4 text-sm text-zinc-300 leading-6">
        K/BB（読み方：<strong>ケーバイビービー</strong>）とは、
        <strong>奪三振数を与四球数で割った値</strong>
        で、投手の制球力と奪三振能力のバランスを示す指標です。1
        つの四球に対していくつの三振を奪っているかを表し、値が高いほど「四球で走者を出さず、三振で打者を仕留められる投手」と評価されます。この記事では、K/BB
        の意味・計算方法・レベル別の目安と、K/9・BB/9・WHIP
        との違いを解説します。
      </p>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">K/BBの計算式</h2>
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-sm text-zinc-200">
            <strong>K/BB = 奪三振 ÷ 与四球</strong>
          </p>
          <p className="mt-2 text-sm text-zinc-400 leading-6">
            K = 奪三振（Strikeout）、BB = 四球（Base on Balls）
          </p>
        </div>
        <p className="mt-3 text-sm text-zinc-300 leading-6">
          死球（デッドボール）は与四球に含めません。投球回を使わない比率の指標なので、登板数が少ない投手でも計算できますが、与四球が
          0 のときはゼロ除算になり算出できない点に注意してください。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">計算例</h2>
        <h3 className="mt-4 mb-2 text-base font-bold">例①: エース級の投手</h3>
        <p className="text-sm text-zinc-300 leading-6">
          奪三振 80・与四球 20 の場合:
        </p>
        <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">K/BB =</span> 80 ÷ 20 ={" "}
            <span className="font-bold text-yellow-500">4.00</span>
          </p>
        </div>

        <h3 className="mt-6 mb-2 text-base font-bold">例②: 四球が多い投手</h3>
        <p className="text-sm text-zinc-300 leading-6">
          奪三振 60・与四球 40 の場合:
        </p>
        <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">K/BB =</span> 60 ÷ 40 ={" "}
            <span className="font-bold text-yellow-500">1.50</span>
          </p>
        </div>
        <p className="mt-3 text-sm text-zinc-300 leading-6">
          奪三振の数自体は少なくないのに、四球が多いため K/BB
          は平均を下回ります。三振を増やすより四球を減らす方が数値の改善につながるタイプです。
        </p>
      </section>

      <AdBanner slot={adSlots.columnMiddle} className="mt-8" />

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">K/BBの目安（NPB 基準）</h2>
        <p className="mb-4 text-sm text-zinc-300 leading-6">
          NPB（日本プロ野球）のリーグ全体の K/BB はおおむね 2.50
          前後で推移しています。下表はプロ野球での一般的な評価基準です。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border border-zinc-700 text-sm">
            <thead>
              <tr className="bg-zinc-800">
                <th className="border-b border-zinc-700 px-4 py-2 text-left text-zinc-300">
                  評価
                </th>
                <th className="border-b border-zinc-700 px-4 py-2 text-left text-zinc-300">
                  K/BB
                </th>
                <th className="border-b border-zinc-700 px-4 py-2 text-left text-zinc-300">
                  ラベル
                </th>
                <th className="border-b border-zinc-700 px-4 py-2 text-left text-zinc-300">
                  目安
                </th>
              </tr>
            </thead>
            <tbody>
              {npbBenchmarks.map((row) => (
                <tr key={row.level} className="even:bg-zinc-800/50">
                  <td className="border-b border-zinc-700 px-4 py-2 font-bold text-yellow-500">
                    {row.level}
                  </td>
                  <td className="border-b border-zinc-700 px-4 py-2 whitespace-nowrap text-zinc-300">
                    {row.range}
                  </td>
                  <td className="border-b border-zinc-700 px-4 py-2 text-zinc-200">
                    {row.label}
                  </td>
                  <td className="border-b border-zinc-700 px-4 py-2 text-zinc-400">
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">高校野球のK/BBの目安</h2>
        <p className="mb-4 text-sm text-zinc-300 leading-6">
          高校生は発展途上のため四球が多くなりがちで、プロより低い水準で評価します。相手のレベル差で数値が変わりやすいので、複数試合を合計した値で見るのがおすすめです。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border border-zinc-700 text-sm">
            <thead>
              <tr className="bg-zinc-800">
                <th className="border-b border-zinc-700 px-4 py-2 text-left text-zinc-300">
                  K/BB
                </th>
                <th className="border-b border-zinc-700 px-4 py-2 text-left text-zinc-300">
                  目安
                </th>
              </tr>
            </thead>
            <tbody>
              {highSchoolBenchmarks.map((row) => (
                <tr key={row.range} className="even:bg-zinc-800/50">
                  <td className="border-b border-zinc-700 px-4 py-2 whitespace-nowrap font-bold text-yellow-500">
                    {row.range}
                  </td>
                  <td className="border-b border-zinc-700 px-4 py-2 text-zinc-300">
                    {row.label}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">K/9・BB/9・WHIPとの違い</h2>
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
            <p className="font-bold text-zinc-200">K/9（奪三振率）</p>
            <p className="mt-2 text-sm text-zinc-300 leading-6">
              9 イニングあたりの奪三振数。K/BB が「比率」なのに対し、K/9
              は三振を奪う「量」を表します。K/BB が同じでも K/9
              が高い投手は奪三振型、低い投手は打たせて取る型です。
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
            <p className="font-bold text-zinc-200">BB/9（与四球率）</p>
            <p className="mt-2 text-sm text-zinc-300 leading-6">
              9 イニングあたりの与四球数。制球力そのものを見る指標で、K/BB
              が低い原因が「三振が少ない」のか「四球が多い」のかを切り分けるときに使います。
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
            <p className="font-bold text-zinc-200">WHIP</p>
            <p className="mt-2 text-sm text-zinc-300 leading-6">
              （与四球＋被安打）÷
              投球回。走者をどれだけ許したかを示し、被安打を含む点が K/BB
              と異なります。K/BB が高くても被安打が多ければ WHIP は悪化します。
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 rounded-xl border border-yellow-700/40 bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 px-5 py-6 text-center">
        <p className="mb-2 text-lg font-bold">あなたのK/BBを計算してみよう</p>
        <p className="mb-4 text-sm text-zinc-300">
          奪三振と与四球を入力するだけで K/BB を自動計算。目安付き。
        </p>
        <Link
          href="/tools/k-bb"
          className="inline-block rounded-lg bg-yellow-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-yellow-500"
        >
          K/BB計算ツールを使う &rarr;
        </Link>
      </div>

      <AdBanner slot={adSlots.columnBottom} className="mt-8" />

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold">よくある質問</h2>
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
        <h2 className="mb-4 text-xl font-bold">関連コラム</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/column/era"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">防御率（ERA）とは</p>
            <p className="mt-1 text-xs text-zinc-400">
              計算方法と良い数値の目安
            </p>
          </Link>
          <Link
            href="/column/era-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">防御率はいくつから良い？</p>
            <p className="mt-1 text-xs text-zinc-400">
              先発・中継ぎ・抑え別の基準
            </p>
          </Link>
          <Link
            href="/column/runs"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">失点と自責点の違い</p>
            <p className="mt-1 text-xs text-zinc-400">失点率の計算方法</p>
          </Link>
          <Link
            href="/tools/whip"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">WHIP計算ツール</p>
            <p className="mt-1 text-xs text-zinc-400">
              与四球と被安打から走者許容率を計算
            </p>
          </Link>
        </div>
      </section>

      <CtaBanner
        className="mt-10"
        heading="投手成績をアプリでまとめて管理するなら"
        body="BUZZ BASEアプリなら試合結果を入力するだけで、K/BBを含む全投手指標を自動算出。チームメイトとランキング形式で成績を共有できます。完全無料。"
      />

      <AdBanner slot={adSlots.columnHorizontal} className="mt-8" />
    </>
  );
}
