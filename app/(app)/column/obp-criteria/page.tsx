import Link from "next/link";
import AdBanner from "@app/components/ad/AdBanner";
import { adSlots } from "@app/components/ad/adConfig";
import CtaBanner from "../../_components/CtaBanner";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "出塁率はいくつから良いと言える？",
    answer:
      "NPB（日本プロ野球）では .310〜.330 がリーグ平均で、.350 を超えれば中堅レギュラー上位、.380 を超えれば最高出塁率タイトル争い、.420 を超えれば歴代級の偉業です。",
  },
  {
    question: "出塁率 .310 / .350 / .380 / .420 のそれぞれの意味は？",
    answer:
      ".310 はリーグ平均水準、.350 は中堅レギュラー上位 (選球眼が安定)、.380 は最高出塁率タイトル争いの常連クラス、.420 以上は MVP・首位打者級の歴代偉業です。",
  },
  {
    question: "高校野球の出塁率目安は？",
    answer:
      "金属バットの影響で打率が出やすい高校野球では、.380 はレギュラー水準、.420 は強豪校の主軸、.450 以上は地区を背負うバットマンの目安です。",
  },
  {
    question: "中学野球（シニア・ボーイズ）の出塁率目安は？",
    answer:
      "硬式リーグでは .380 以上でレギュラー、.420 以上でクリーンアップ、.450 を超えれば全国レベルの強打者の目安です。軟式中学野球ではさらに数値が伸びる傾向があります。",
  },
  {
    question: "ポジションによって出塁率の基準は違う？",
    answer:
      "捕手・遊撃手・二塁手などセンターラインのポジションは守備負担が大きいため、.330 前後でも十分な打撃力と評価されます。一塁手・指名打者・外野コーナーは打撃が期待されるため、.350 以上が標準ラインです。",
  },
  {
    question: "リードオフマン (1〜2 番) には出塁率がどれくらい重要？",
    answer:
      "リードオフマンには「塁に出る能力」が最重要で、打率よりも出塁率が評価の中心になります。打率 .280 でも出塁率 .380 なら、優秀なリードオフマンと評価されます。",
  },
];

const benchmarks = [
  {
    level: "S（歴代級）",
    obp: ".420 以上",
    pro: "MVP・首位打者・最高出塁率の主役級",
    high: "甲子園を背負うバットマン",
    middle: "全国大会で勝てるクリーンアップ",
    color: "text-amber-400",
  },
  {
    level: "A（好打者上位）",
    obp: ".380 〜 .419",
    pro: "最高出塁率タイトル争い・リードオフマン一流",
    high: "強豪校の主軸・地区上位",
    middle: "シニア・ボーイズの主軸打者",
    color: "text-yellow-400",
  },
  {
    level: "B（中堅レギュラー上位）",
    obp: ".350 〜 .379",
    pro: "リーグ平均より上の中堅レギュラー水準",
    high: "強豪校レギュラー上位",
    middle: "シニア・ボーイズで安定したレギュラー",
    color: "text-yellow-500",
  },
  {
    level: "C（平均）",
    obp: ".310 〜 .349",
    pro: "NPB のリーグ平均前後・標準的レギュラー",
    high: "公立校レギュラー・打撃よりは守備で勝負",
    middle: "中位打線として標準的",
    color: "text-zinc-300",
  },
  {
    level: "D（要改善）",
    obp: ".310 未満",
    pro: "二軍調整候補・代走代守の枠",
    high: "選球眼・接触率の改善が必須",
    middle: "個別の技術課題の見直し",
    color: "text-zinc-500",
  },
];

export default function ObpCriteriaColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="出塁率はいくつから良い？レベル別の目安・基準・ポジション別を解説"
        description="出塁率（OBP）はいくつから良いのか、.310 / .350 / .380 / .420 の意味とカテゴリ別の目安、ポジション別の基準を解説。"
        path="/column/obp-criteria"
        breadcrumbLeafName="出塁率の目安・基準"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "出塁率の目安・基準" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        出塁率はいくつから良い？レベル別の目安・基準を野球指標で解説
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        出塁率（OBP）の良し悪しを判断する目安は、
        <strong>
          「.310 で平均」「.350 で中堅上位」「.380 で好打者上位」「.420
          で歴代級」
        </strong>
        の 4 段階で覚えるとシンプルです。本記事では
        NPB・MLB・高校野球・中学野球それぞれのレベル別目安と、ポジション別の基準を整理します。
      </p>

      <p className="text-sm text-zinc-400 leading-6 mt-2">
        出塁率の計算方法や打率との違いから確認したい場合は{" "}
        <Link
          href="/column/obp"
          className="text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
        >
          出塁率（OBP）とは？計算方法の記事
        </Link>{" "}
        を併せてご覧ください。
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">
          数値帯ごとの出塁率の意味（.310 / .350 / .380 / .420）
        </h2>

        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
            <p className="font-bold text-zinc-200">
              <span className="text-amber-400">.420 以上</span> ／ 歴代級・MVP
              圏
            </p>
            <p className="text-sm text-zinc-300 leading-6 mt-2">
              MVP・首位打者・最高出塁率の主役級。年間で達成できる選手は
              0〜数人レベルで、リーグを代表する打者の証です。
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
            <p className="font-bold text-zinc-200">
              <span className="text-yellow-500">.380 以上</span> ／
              好打者上位・タイトル争い
            </p>
            <p className="text-sm text-zinc-300 leading-6 mt-2">
              最高出塁率タイトル争いの常連ライン。リードオフマンや 2
              番打者として高い評価を受ける水準です。
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
            <p className="font-bold text-zinc-200">
              <span className="text-yellow-500">.350 以上</span> ／
              中堅レギュラー上位
            </p>
            <p className="text-sm text-zinc-300 leading-6 mt-2">
              リーグ平均より上の中堅レギュラー水準。打率と選球眼のバランスが良く、安定して塁に出る能力がある打者です。
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
            <p className="font-bold text-zinc-200">
              <span className="text-zinc-300">.310 前後</span> ／ リーグ平均
            </p>
            <p className="text-sm text-zinc-300 leading-6 mt-2">
              NPB のリーグ平均出塁率は概ね .310〜.330 で推移するため、.310
              はちょうど平均水準。レギュラー定着の最低ラインとして語られることが多い数字です。
            </p>
          </div>
        </div>
      </section>

      <AdBanner slot={adSlots.columnMiddle} className="mt-8" />

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">
          カテゴリ別 出塁率 目安テーブル（プロ／高校／中学）
        </h2>
        <p className="text-sm text-zinc-300 leading-6 mb-4">
          金属バット /
          木製バットの違い、投手レベルの差により、同じ出塁率でもカテゴリによって意味合いが変わります。下表は現場で語られることの多い目安をまとめたものです。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-zinc-700">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  レベル
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  出塁率
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
                    {row.obp}
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
          守備負担の大きいポジションは出塁率の要求も緩く、守備負担の小さいポジションは打撃で結果を残すことが期待されます。NPB
          の目安は以下のとおりです。
        </p>
        <ul className="space-y-3 text-sm text-zinc-300 leading-6">
          <li className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-3">
            <strong>捕手・遊撃手・二塁手:</strong> .330
            前後で十分。守備負担が大きいため打撃要求は緩め
          </li>
          <li className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-3">
            <strong>三塁手・中堅手:</strong> .340〜.360
            が標準。攻守両面のバランス
          </li>
          <li className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-3">
            <strong>一塁手・外野コーナー:</strong> .350
            以上が標準。打撃が主役のポジション
          </li>
          <li className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-3">
            <strong>指名打者（DH）:</strong> .360〜.380
            を求められる。打撃のみで結果を出す枠
          </li>
        </ul>
      </section>

      <div className="mt-8 rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6 text-center">
        <p className="text-lg font-bold mb-2">あなたの出塁率はどのレベル？</p>
        <p className="text-sm text-zinc-300 mb-4">
          安打数・打数・四球・死球・犠飛を入力するだけで出塁率を自動計算。
        </p>
        <Link
          href="/tools/obp"
          className="inline-block rounded-lg bg-yellow-600 hover:bg-yellow-500 transition-colors px-6 py-2.5 text-sm font-bold text-white"
        >
          出塁率計算ツールを使う &rarr;
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
            href="/column/obp"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">出塁率とは（基本記事）</p>
            <p className="text-xs text-zinc-400 mt-1">
              意味・計算方法・打率との違い
            </p>
          </Link>
          <Link
            href="/column/obp-400"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">出塁率 .400 とは</p>
            <p className="text-xs text-zinc-400 mt-1">
              最高出塁率タイトルライン
            </p>
          </Link>
          <Link
            href="/column/obp-380"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">出塁率 .380 とは</p>
            <p className="text-xs text-zinc-400 mt-1">好打者上位ライン</p>
          </Link>
          <Link
            href="/column/obp-350"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">出塁率 .350 とは</p>
            <p className="text-xs text-zinc-400 mt-1">中堅レギュラー上位</p>
          </Link>
        </div>
      </section>

      <CtaBanner
        className="mt-10"
        heading="チームの打撃成績をアプリでまとめて管理するなら"
        body="BUZZ BASEアプリなら試合結果を入力するだけで、出塁率を含む全29指標を自動算出。チームメイトとランキング形式で成績を共有できます。完全無料。"
      />

      <AdBanner
        slot={adSlots.columnHorizontal}
        format="horizontal"
        className="mt-8"
      />
    </>
  );
}
