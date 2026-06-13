import Link from "next/link";
import AdBanner from "@app/components/ad/AdBanner";
import { adSlots } from "@app/components/ad/adConfig";
import CtaBanner from "../../_components/CtaBanner";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "防御率はいくつから良いと言える？",
    answer:
      "NPB（日本プロ野球）のリーグ平均防御率は年によって 2.76〜4.10 のレンジで大きく変動しますが、概ね 3.50 前後が目安です。3.00 を下回ると「優秀」、2.00 を下回ると「エース級」、1.00 台で安定すると最優秀防御率タイトル候補のレベルになります。",
  },
  {
    question: "防御率 1.00 / 2.00 / 3.00 / 4.00 のそれぞれの意味は？",
    answer:
      "1.00 台は歴代でも数えるほどのレジェンド級、2.00 台はリーグを代表するエース、3.00 台はローテーション中堅〜リーグ平均、4.00 台は先発として実力に課題があるレベルです。",
  },
  {
    question: "先発と中継ぎ・抑えで防御率の基準は違う？",
    answer:
      "中継ぎ・抑え投手は短いイニングを投げるため、先発より防御率が出やすい傾向があります。中継ぎは 2.50 以下、抑え（クローザー）は 2.00 以下が一線級の目安です。",
  },
  {
    question: "高校野球の防御率目安は？",
    answer:
      "金属バットの影響で全体に数字が出やすい高校野球では、2.00 以下なら地区上位、3.00 以下で好投手、4.00 以下で平均的、それ以上は改善余地ありが目安です。",
  },
  {
    question: "中学野球（シニア・ボーイズ）の防御率目安は？",
    answer:
      "硬式リーグでは 2.50 以下でエース級、3.50 以下で主戦投手、4.50 以下で平均的が目安。軟式では球速が上がりにくく、エースで 1.50 以下が見える水準もあります。",
  },
  {
    question: "MLB と NPB で防御率の基準は変わる？",
    answer:
      "MLB はリーグ平均が 3.80〜4.20 で推移する年が多く、NPB（年により 2.76〜4.10）より平均すると高めに出ます。タイトル獲得ラインも MLB は 3.00 前後、NPB は 2.00 前後と異なります。",
  },
];

const benchmarks = [
  {
    level: "S（歴代級）",
    era: "1.00 以下",
    pro: "シーズン通算では数十年に数人レベル",
    high: "地区を代表する絶対エース",
    middle: "全国大会で勝てる絶対エース",
    color: "text-amber-400",
  },
  {
    level: "A（エース）",
    era: "1.00 〜 1.99",
    pro: "最優秀防御率タイトル獲得圏",
    high: "強豪校エース・甲子園レベル",
    middle: "シニア・ボーイズ全国レベルのエース",
    color: "text-yellow-400",
  },
  {
    level: "B（好投手）",
    era: "2.00 〜 2.99",
    pro: "ローテーションの柱・優秀",
    high: "強豪校レギュラー上位",
    middle: "シニア・ボーイズの主戦投手",
    color: "text-yellow-500",
  },
  {
    level: "C（平均）",
    era: "3.00 〜 3.99",
    pro: "リーグ平均前後・先発として標準",
    high: "公立校でも十分エース候補",
    middle: "シニア・ボーイズで安定した先発",
    color: "text-zinc-300",
  },
  {
    level: "D（要改善）",
    era: "4.00 以上",
    pro: "先発降格 / 二軍調整のリスク",
    high: "制球力・変化球の改善が必要",
    middle: "投球フォーム・球種の見直し",
    color: "text-zinc-500",
  },
];

export default function EraCriteriaColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="防御率はいくつから良い？レベル別の目安・基準・先発/中継ぎ別を解説"
        description="防御率（ERA）はいくつから良いのか、1.00 / 2.00 / 3.00 / 4.00 台の意味とカテゴリ別の目安、先発・中継ぎ別の基準を解説。"
        path="/column/era-criteria"
        breadcrumbLeafName="防御率の目安・基準"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "防御率の目安・基準" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        防御率はいくつから良い？レベル別の目安・基準を野球指標で解説
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        防御率（ERA）の良し悪しを判断する目安は、
        <strong>
          「3.50 で平均」「3.00 で優秀」「2.00 でエース」「1.00 台で歴代級」
        </strong>
        の 4 段階で覚えるとシンプルです。本記事では
        NPB・MLB・高校野球・中学野球それぞれのレベル別目安と、先発投手 /
        中継ぎ・抑え別の基準を整理します。
      </p>

      <p className="text-sm text-zinc-400 leading-6 mt-2">
        防御率の計算方法や意味から確認したい場合は{" "}
        <Link
          href="/column/era"
          className="text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
        >
          防御率（ERA）とは？計算方法の記事
        </Link>{" "}
        を併せてご覧ください。
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">
          数値帯ごとの防御率の意味（1.00 / 2.00 / 3.00 / 4.00）
        </h2>

        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
            <p className="font-bold text-zinc-200">
              <span className="text-amber-400">1.00 台</span> ／
              歴代級・レジェンドライン
            </p>
            <p className="text-sm text-zinc-300 leading-6 mt-2">
              シーズン通算で防御率 1 点台を残すのは NPB・MLB
              ともに数年に数人レベル。村田兆治、江夏豊、ヤクルトの伊藤智仁など名球会・殿堂入りレベルの投手が並びます。
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
            <p className="font-bold text-zinc-200">
              <span className="text-yellow-500">2.00 台</span> ／
              エース・タイトル争い
            </p>
            <p className="text-sm text-zinc-300 leading-6 mt-2">
              最優秀防御率タイトル争いの常連ライン。各球団のエース投手・MLB なら
              CY ヤング賞候補が並ぶ水準です。
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
            <p className="font-bold text-zinc-200">
              <span className="text-yellow-500">3.00 台</span> ／
              平均〜ローテーション中堅
            </p>
            <p className="text-sm text-zinc-300 leading-6 mt-2">
              NPB のリーグ平均防御率は年により 2.76〜4.10
              のレンジで変動しますが、3.50 前後が一つの目安です。3.00
              台前半なら平均より良い、後半でリーグ平均近辺。先発ローテーション維持のラインです。
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
            <p className="font-bold text-zinc-200">
              <span className="text-zinc-300">4.00 台</span> ／ 要改善ライン
            </p>
            <p className="text-sm text-zinc-300 leading-6 mt-2">
              先発で 4
              点台が続くとローテーションを外れるリスクが高まります。被打率を下げるか、四球・本塁打を減らす方向性の改善が必要です。
            </p>
          </div>
        </div>
      </section>

      <AdBanner slot={adSlots.columnMiddle} className="mt-8" />

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">
          カテゴリ別 防御率 目安テーブル（プロ／高校／中学）
        </h2>
        <p className="text-sm text-zinc-300 leading-6 mb-4">
          金属バット /
          木製バットの違い、球場の広さ、打者レベルの差により、同じ防御率でもカテゴリによって意味合いが変わります。下表は現場で語られることの多い目安をまとめたものです。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-zinc-700">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  レベル
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  防御率
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  プロ野球
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  高校野球
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  中学野球
                </th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((row) => (
                <tr key={row.level} className="even:bg-zinc-800/50 align-top">
                  <td
                    className={`px-3 py-2 border-b border-zinc-700 font-bold ${row.color}`}
                  >
                    {row.level}
                  </td>
                  <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300 whitespace-nowrap">
                    {row.era}
                  </td>
                  <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300">
                    {row.pro}
                  </td>
                  <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300">
                    {row.high}
                  </td>
                  <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300">
                    {row.middle}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-3">先発・中継ぎ・抑え 別の目安</h2>
        <p className="text-sm text-zinc-300 leading-6 mb-4">
          中継ぎ・抑え投手は短いイニングを高い集中度で投げる役割のため、先発より防御率が低めに出やすい傾向があります。役割別の目安は以下のとおりです。
        </p>
        <ul className="space-y-3 text-sm text-zinc-300 leading-6">
          <li className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-3">
            <strong>先発投手:</strong> 3.00 以下で優秀、2.00
            以下でエース級、4.00 以上はローテーション降格ライン
          </li>
          <li className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-3">
            <strong>中継ぎ投手:</strong> 2.50 以下が一線級、3.50
            以下で実力派、4.00 以上は二軍調整候補
          </li>
          <li className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-3">
            <strong>抑え（クローザー）:</strong> 2.00 以下が守護神級、3.00
            以下で十分、3.50 以上は配置転換も
          </li>
        </ul>
      </section>

      <div className="mt-8 rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6 text-center">
        <p className="text-lg font-bold mb-2">あなたの防御率はどのレベル？</p>
        <p className="text-sm text-zinc-300 mb-4">
          自責点と投球回を入力するだけで防御率を自動計算。
        </p>
        <Link
          href="/tools/era"
          className="inline-block rounded-lg bg-yellow-600 hover:bg-yellow-500 transition-colors px-6 py-2.5 text-sm font-bold text-white"
        >
          防御率計算ツールを使う &rarr;
        </Link>
      </div>

      <AdBanner slot={adSlots.columnBottom} className="mt-8" />

      <section className="mt-10">
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

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">関連コラム</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/column/era"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率（ERA）とは（基本記事）</p>
            <p className="text-xs text-zinc-400 mt-1">意味・計算方法・読み方</p>
          </Link>
          <Link
            href="/column/era-2"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率 2.00 台はどのレベル？</p>
            <p className="text-xs text-zinc-400 mt-1">エース級の入口ライン</p>
          </Link>
          <Link
            href="/column/era-3"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率 3.00 台はどのレベル？</p>
            <p className="text-xs text-zinc-400 mt-1">
              リーグ平均ラインの位置づけ
            </p>
          </Link>
          <Link
            href="/column/runs"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">失点・自責点・失点率とは</p>
            <p className="text-xs text-zinc-400 mt-1">防御率との違いと計算</p>
          </Link>
        </div>
      </section>

      <CtaBanner
        className="mt-10"
        heading="チームの投手成績をアプリでまとめて管理するなら"
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
