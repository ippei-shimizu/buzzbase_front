import Link from "next/link";
import AdBanner from "@app/components/ad/AdBanner";
import { adSlots } from "@app/components/ad/adConfig";
import CtaBanner from "../../_components/CtaBanner";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "打率はいくつから良いと言える？",
    answer:
      "NPB（日本プロ野球）では .250 前後がリーグ平均で、.280 を超えると「平均より上」、.300 を超えると「好打者・クリーンアップ」、.350 以上で「歴代級・首位打者上位」と評価されます。",
  },
  {
    question: "打率 .250 / .280 / .300 / .350 のそれぞれの意味は？",
    answer:
      ".250 はリーグ平均（レギュラーの最低ライン）、.280 は中堅レギュラー、.300 は 3 割打者の証で好打者、.350 以上は首位打者争いに絡む歴代級のレベルです。",
  },
  {
    question: "高校野球の打率目安は？",
    answer:
      "金属バットの影響で全体に数字が出やすい高校野球では、.300 以下なら改善余地、.350 前後でレギュラー、.400 を超えれば強豪校の主軸・地区上位レベルが目安です。",
  },
  {
    question: "中学野球（シニア・ボーイズ）の打率目安は？",
    answer:
      "硬式リーグでは .300 以上でレギュラー、.350 以上でクリーンアップ、.400 を超えればチームを引っ張る強打者の目安です。軟式中学野球では数値がさらに伸びる傾向があります。",
  },
  {
    question: "ポジションによって打率の基準は違う？",
    answer:
      "捕手・遊撃手・二塁手などセンターラインのポジションは守備負担が大きいため、.260 前後でも十分な打撃力と評価されます。一塁手・指名打者・外野コーナーは打撃が期待される枠なので、.280 以上が標準ラインです。",
  },
  {
    question: "MLB と NPB で打率の基準は変わる？",
    answer:
      "MLB はリーグ平均が .240〜.260 で推移する年が多く、NPB（.240〜.260）と概ね同等です。タイトル獲得ラインも MLB は .330 前後、NPB は .320〜.340 とほぼ同じ水準です。",
  },
];

const benchmarks = [
  {
    level: "S（歴代級）",
    avg: ".350 以上",
    pro: "首位打者の最上位ライン・MVP 候補",
    high: "甲子園を背負う絶対的なバットマン",
    middle: "全国大会で勝てるクリーンアップ",
    color: "text-amber-400",
  },
  {
    level: "A（好打者）",
    avg: ".300 〜 .349",
    pro: "3 割打者の証・クリーンアップ",
    high: "強豪校の主軸打者・地方大会上位",
    middle: "シニア・ボーイズの主軸打者",
    color: "text-yellow-400",
  },
  {
    level: "B（中堅）",
    avg: ".280 〜 .299",
    pro: "リーグ平均より上の中堅レギュラー",
    high: "強豪校レギュラー上位",
    middle: "シニア・ボーイズで安定したレギュラー",
    color: "text-yellow-500",
  },
  {
    level: "C（平均）",
    avg: ".250 〜 .279",
    pro: "NPB のリーグ平均前後・標準的レギュラー",
    high: "公立校レギュラー・打撃よりは守備で勝負",
    middle: "中位打線として標準的",
    color: "text-zinc-300",
  },
  {
    level: "D（要改善）",
    avg: ".250 未満",
    pro: "二軍調整候補・代走代守の枠",
    high: "バッティング練習の強化が必須",
    middle: "個別の技術課題の見直し",
    color: "text-zinc-500",
  },
];

export default function BattingAverageCriteriaColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="打率はいくつから良い？レベル別の目安・基準・ポジション別を解説"
        description="打率（AVG）はいくつから良いのか、.250 / .280 / .300 / .350 の意味とカテゴリ別の目安、ポジション別の基準を解説。"
        path="/column/batting-average-criteria"
        breadcrumbLeafName="打率の目安・基準"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "打率の目安・基準" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        打率はいくつから良い？レベル別の目安・基準を野球指標で解説
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        打率（AVG）の良し悪しを判断する目安は、
        <strong>
          「.250 で平均」「.280 で中堅」「.300 で好打者」「.350 で歴代級」
        </strong>
        の 4 段階で覚えるとシンプルです。本記事では
        NPB・MLB・高校野球・中学野球それぞれのレベル別目安と、ポジション別の基準を整理します。
      </p>

      <p className="text-sm text-zinc-400 leading-6 mt-2">
        打率の計算方法や意味から確認したい場合は{" "}
        <Link
          href="/column/batting-average"
          className="text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
        >
          打率とは？計算方法の記事
        </Link>{" "}
        を併せてご覧ください。
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">
          数値帯ごとの打率の意味（.250 / .280 / .300 / .350）
        </h2>

        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
            <p className="font-bold text-zinc-200">
              <span className="text-amber-400">.350 以上</span> ／
              首位打者・歴代級
            </p>
            <p className="text-sm text-zinc-300 leading-6 mt-2">
              首位打者争いの最上位ライン。シーズンを通して .350
              を維持できる打者はリーグでも年間 0〜2
              名程度の偉業。イチロー、落合博満、青木宣親らが該当します。
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
            <p className="font-bold text-zinc-200">
              <span className="text-yellow-500">.300 以上</span> ／ 好打者ライン
            </p>
            <p className="text-sm text-zinc-300 leading-6 mt-2">
              「3
              割打者」の代名詞。クリーンアップを任される一流レベル。リーグ平均を
              0.04〜0.05 上回り、シーズン通算 .300
              は野手の目標値として最もよく語られる数字です。
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
            <p className="font-bold text-zinc-200">
              <span className="text-yellow-500">.280 以上</span> ／
              中堅レギュラー
            </p>
            <p className="text-sm text-zinc-300 leading-6 mt-2">
              リーグ平均より上の中堅レギュラー水準。クリーンアップではなく 1〜2
              番や下位打線でも、安定して .280
              を残せれば打線の核として機能します。
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
            <p className="font-bold text-zinc-200">
              <span className="text-zinc-300">.250 前後</span> ／
              リーグ平均ライン
            </p>
            <p className="text-sm text-zinc-300 leading-6 mt-2">
              NPB のリーグ平均打率は概ね .240〜.260 で推移するため、.250
              はちょうど平均水準。レギュラー定着の最低ラインとして語られることが多い数字です。
            </p>
          </div>
        </div>
      </section>

      <AdBanner slot={adSlots.columnMiddle} className="mt-8" />

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">
          カテゴリ別 打率 目安テーブル（プロ／高校／中学）
        </h2>
        <p className="text-sm text-zinc-300 leading-6 mb-4">
          金属バット /
          木製バットの違い、投手レベルの差により、同じ打率でもカテゴリによって意味合いが変わります。下表は現場で語られることの多い目安をまとめたものです。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-zinc-700">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  レベル
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  打率
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
                    {row.avg}
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
        <h2 className="text-xl font-bold mb-3">ポジション別の目安</h2>
        <p className="text-sm text-zinc-300 leading-6 mb-4">
          守備負担の大きいポジションは打撃面での要求が緩く、守備負担の小さいポジションは打撃で結果を残すことが期待されます。NPB
          の目安は以下のとおりです。
        </p>
        <ul className="space-y-3 text-sm text-zinc-300 leading-6">
          <li className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-3">
            <strong>捕手・遊撃手・二塁手:</strong> .260
            前後で十分。守備負担が大きいため打撃要求は緩め
          </li>
          <li className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-3">
            <strong>三塁手・中堅手:</strong> .270〜.290
            が標準。攻守両面のバランスが求められる
          </li>
          <li className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-3">
            <strong>一塁手・外野コーナー:</strong> .280
            以上が標準。打撃が主役のポジション
          </li>
          <li className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-3">
            <strong>指名打者（DH）:</strong> .280〜.300
            を求められる。打撃のみで結果を出す枠
          </li>
        </ul>
      </section>

      <div className="mt-8 rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6 text-center">
        <p className="text-lg font-bold mb-2">あなたの打率はどのレベル？</p>
        <p className="text-sm text-zinc-300 mb-4">
          安打数と打数を入力するだけで打率を自動計算。
        </p>
        <Link
          href="/tools/batting-average"
          className="inline-block rounded-lg bg-yellow-600 hover:bg-yellow-500 transition-colors px-6 py-2.5 text-sm font-bold text-white"
        >
          打率計算ツールを使う &rarr;
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
            href="/column/batting-average"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">打率とは（基本記事）</p>
            <p className="text-xs text-zinc-400 mt-1">意味・計算方法</p>
          </Link>
          <Link
            href="/column/batting-average-300"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">打率 3 割の意味</p>
            <p className="text-xs text-zinc-400 mt-1">
              3 割打者の証・好打者ライン
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
            href="/column/batting-average-vs-obp"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">打率と出塁率の違い</p>
            <p className="text-xs text-zinc-400 mt-1">指標の使い分け方</p>
          </Link>
        </div>
      </section>

      <CtaBanner
        className="mt-10"
        heading="チームの打撃成績をアプリでまとめて管理するなら"
        body="BUZZ BASEアプリなら試合結果を入力するだけで、打率を含む全29指標を自動算出。チームメイトとランキング形式で成績を共有できます。完全無料。"
      />

      <AdBanner
        slot={adSlots.columnHorizontal}
        format="horizontal"
        className="mt-8"
      />
    </>
  );
}
