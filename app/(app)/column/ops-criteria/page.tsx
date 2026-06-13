import Link from "next/link";
import AdBanner from "@app/components/ad/AdBanner";
import { adSlots } from "@app/components/ad/adConfig";
import CtaBanner from "../../_components/CtaBanner";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import OpsCriteriaColumnJsonLd from "./_components/OpsCriteriaColumnJsonLd";

const faqItems = [
  {
    question: "OPSはいくつから良いと言える？",
    answer:
      "歴史的に NPB のリーグ平均は .700 前後とされてきましたが、近年は .660〜.700 まで低下しているため、現代の感覚では .700 を超えれば「平均より良い」、.800 を超えればクリーンアップを任される好打者、.900 以上で中心打者、1.000 超えでリーグを代表するスラッガーが目安です。",
  },
  {
    question: "OPS .700／.800／.900／1.000 のそれぞれの意味は？",
    answer:
      ".700はリーグ平均水準（レギュラー定着の目安）、.800はクリーンアップ任せられる好打者、.900は中心打者・タイトル争いに絡むレベル、1.000超えはMVP・首位打者級の超一流打者を意味します。",
  },
  {
    question: "OPS 1超え（1.000以上）の意味は？",
    answer:
      "出塁率と長打率の合計が1.000を超える状態のことです。NPBでも年間で達成できる選手は数人レベル、MLBでも歴代の超一流打者の象徴的な数字として扱われます。",
  },
  {
    question: "高校野球のOPS目安は？",
    answer:
      "金属バットの影響で数値が出やすく、.800前後でレギュラー上位、.900以上で強打者、1.000超えで地区を代表するレベルが目安です。",
  },
  {
    question: "中学野球（シニア・ボーイズ）のOPS目安は？",
    answer:
      "中学硬式（シニア・ボーイズ等）でも金属バットが中心のため、.800前後でレギュラー上位、.900以上で4番候補、1.000超えで全国レベルの強打者の目安になります。",
  },
  {
    question: "OPSの基準はNPBとMLBで変わる？",
    answer:
      "基本的な評価基準（.800で優秀／.900で強打者／1.000超えで超一流）はほぼ共通で使えます。MLBの方が長打率が出やすい傾向はありますが、目安の桁が変わるほどの差ではありません。",
  },
];

const benchmarks = [
  {
    level: "S（超一流）",
    ops: "1.000以上",
    pro: "NPB・MLB ともMVP / 首位打者争い",
    high: "甲子園を主導するスラッガー",
    middle: "全国大会で上位を狙える強打者",
    color: "text-amber-400",
  },
  {
    level: "A（中心打者）",
    ops: ".900〜.999",
    pro: "リーグ代表クラスのクリーンアップ",
    high: "強豪校の主軸打者",
    middle: "シニア・ボーイズ全国レベルの4番",
    color: "text-yellow-400",
  },
  {
    level: "B（好打者）",
    ops: ".800〜.899",
    pro: "クリーンアップを任される好打者",
    high: "強豪校レギュラー上位／地方大会の主軸",
    middle: "シニア・ボーイズの主軸打者",
    color: "text-yellow-500",
  },
  {
    level: "C（平均）",
    ops: ".700〜.799",
    pro: "リーグ平均前後・安定したレギュラー",
    high: "公立校でも十分レギュラーレベル",
    middle: "シニア・ボーイズで安定したレギュラー",
    color: "text-zinc-300",
  },
  {
    level: "D（要改善）",
    ops: ".700未満",
    pro: "出場機会が減るリスクあり",
    high: "出塁・長打のどちらかを伸ばす必要",
    middle: "個別の課題（打撃フォーム等）を見直し",
    color: "text-zinc-500",
  },
];

export default function OpsCriteriaColumnPage() {
  return (
    <>
      <OpsCriteriaColumnJsonLd faq={faqItems} />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "OPSの目安・基準" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        OPSはいくつから良い？レベル別の目安・基準を野球指標で解説
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        OPS（オーピーエス）の良し悪しを判断する目安は、
        <strong>
          「.700で平均」「.800で好打者」「.900で中心打者」「1.000で超一流」
        </strong>
        の4段階で覚えるとシンプルです。本記事ではNPB・MLB・高校野球・中学野球それぞれのレベル別目安と、「4番を任されるOPS」「強豪校レギュラーのOPS」など現場感のある数字を紹介します。
      </p>

      <p className="text-sm text-zinc-400 leading-6 mt-2">
        OPSの意味や計算式から確認したい場合は{" "}
        <Link
          href="/column/ops"
          className="text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
        >
          OPSとは？意味・計算方法の記事
        </Link>{" "}
        を併せてご覧ください。
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">
          数値帯ごとのOPSの意味（.700／.800／.900／1.000）
        </h2>

        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
            <p className="font-bold text-zinc-200">
              <span className="text-yellow-500">.700</span> ／ リーグ平均ライン
            </p>
            <p className="text-sm text-zinc-300 leading-6 mt-2">
              NPB・MLBともリーグ全体の平均OPSが.700前後で推移しています。レギュラー定着の最低ラインと言われることが多く、ここを超えるかどうかで「平均的なバッター」と評価されるかが分かれます。
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
            <p className="font-bold text-zinc-200">
              <span className="text-yellow-500">.800</span> ／ 好打者の入口
            </p>
            <p className="text-sm text-zinc-300 leading-6 mt-2">
              リーグ平均を1割上回る水準で、クリーンアップ（3〜5番）を任される好打者の目安です。長打力か出塁率のどちらかが平均より明確に高く、得点貢献度の高いバッターです。
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
            <p className="font-bold text-zinc-200">
              <span className="text-yellow-500">.900</span> ／
              中心打者・タイトル争い
            </p>
            <p className="text-sm text-zinc-300 leading-6 mt-2">
              チームの中心打者として打線を引っ張るクラス。OPSランキングで上位に入り、シーズン後半にはタイトル争いに名前が挙がる水準です。
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
            <p className="font-bold text-zinc-200">
              <span className="text-amber-400">1.000</span> ／
              超一流（MVP・首位打者級）
            </p>
            <p className="text-sm text-zinc-300 leading-6 mt-2">
              年間を通して1.000を超える選手はNPBでも数人レベル。MLBでも歴代の超一流打者の象徴的な数値として扱われ、「1超え（いちこえ）」と呼ばれることもあります。
            </p>
          </div>
        </div>
      </section>

      <AdBanner slot={adSlots.columnMiddle} className="mt-8" />

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">
          カテゴリ別 OPS 目安テーブル（プロ／高校／中学）
        </h2>
        <p className="text-sm text-zinc-300 leading-6 mb-4">
          金属バット／木製バットの違い、球場の広さ、投手レベルの差により、同じOPSでもカテゴリによって意味合いが変わります。下表は現場で語られることの多い目安をまとめたものです。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-zinc-700">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  レベル
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  OPS
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
                    {row.ops}
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
        <h2 className="text-xl font-bold mb-4">
          現場感：「4番を任されるOPS」「強豪校レギュラーのOPS」
        </h2>
        <ul className="space-y-3 text-sm text-zinc-300 leading-6">
          <li className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-3">
            <strong>チームの4番を任される目安：</strong> 高校野球では .850〜.950
            が目安。長打率を高めつつ出塁率を落とさないバランスが必要です。
          </li>
          <li className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-3">
            <strong>強豪校レギュラーの目安：</strong> 打順問わず .800
            を切らないことが目安。OPSがチーム全体で .800
            を超えるとリーグ上位の打力チームと言えます。
          </li>
          <li className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-3">
            <strong>シニア・ボーイズ全国レベルの目安：</strong> 主力打者で .900
            前後、4番で 1.000
            近辺。出塁率より長打率で数字を作るタイプが多い傾向です。
          </li>
          <li className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-3">
            <strong>大学・社会人野球の目安：</strong>{" "}
            木製バットに切り替わるため数字は下振れする傾向。リーグ戦で .800
            を超えれば十分にスカウト対象になる水準です。
          </li>
        </ul>
      </section>

      <div className="mt-8 rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6 text-center">
        <p className="text-lg font-bold mb-2">あなたのOPSはどのレベル？</p>
        <p className="text-sm text-zinc-300 mb-4">
          安打数・打数・四球・死球・塁打数を入力するだけでOPS・出塁率・長打率を自動計算。レベル評価バッジ付き。
        </p>
        <Link
          href="/tools/ops"
          className="inline-block rounded-lg bg-yellow-600 hover:bg-yellow-500 transition-colors px-6 py-2.5 text-sm font-bold text-white"
        >
          OPS計算ツールを使う &rarr;
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
            href="/column/ops"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPSとは（基本記事）</p>
            <p className="text-xs text-zinc-400 mt-1">
              意味・計算方法・読み方を解説
            </p>
          </Link>
          <Link
            href="/column/ops-800"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPS .800 はどのレベル？</p>
            <p className="text-xs text-zinc-400 mt-1">プロ・高校野球での意味</p>
          </Link>
          <Link
            href="/column/ops-1000"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPS 1.000 を超える選手</p>
            <p className="text-xs text-zinc-400 mt-1">
              歴代スラッガーと「1超え」の意味
            </p>
          </Link>
          <Link
            href="/column/ops-700"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPS .700 は平均？</p>
            <p className="text-xs text-zinc-400 mt-1">
              プロ・高校野球での位置づけ
            </p>
          </Link>
        </div>
      </section>

      <CtaBanner
        className="mt-10"
        heading="チームの成績をアプリでまとめて管理するなら"
        body="BUZZ BASEアプリなら試合結果を入力するだけで、OPSを含む全29指標を自動算出。チームメイトとランキング形式で成績を共有できます。完全無料。"
      />

      <AdBanner
        slot={adSlots.columnHorizontal}
        format="horizontal"
        className="mt-8"
      />
    </>
  );
}
