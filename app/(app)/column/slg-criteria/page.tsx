import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "長打率はいくつから「良い」と言える？",
    answer:
      "NPB のリーグ平均長打率が概ね .360〜.400 で推移する中、.450 を超えれば好打者、.500 を超えれば中心打者、.550 以上はリーグ代表級です。.380 がリーグ平均ラインで、それを下回ると長打力不足とされます。",
  },
  {
    question: "高校野球での長打率の目安は？",
    answer:
      "高校野球は金属バットを使うため打高傾向で、地方大会レギュラーで .400 前後、甲子園レベルの中軸打者は .500 を超えることが多いです。プロ志望投手相手だと数値が伸びにくくなるため、相手投手のレベルも考慮して判断します。",
  },
  {
    question: "ポジションによって長打率の期待値は変わる？",
    answer:
      "コーナー（一塁手・三塁手・コーナー外野）は打撃を強く期待されるため .450 以上、センターライン（二遊間・中堅）は .380 以上、捕手は守備負担が重いため .350〜.400 が標準です。",
  },
  {
    question: "長打率 .500 と .550 の差はどれくらい大きい？",
    answer:
      "シーズン 500 打数で換算すると、.500 は塁打数 250、.550 は塁打数 275 で 25 塁打の差。本塁打換算で 6〜7 本に相当し、チームの得点期待値で年間 8〜12 得点、勝率で 1 勝前後の差になります。",
  },
  {
    question: "打率と長打率のバランスはどう見る？",
    answer:
      "ISO（長打率 - 打率）が一つの目安です。ISO .150 以上で長打型、.100 前後で平均型、.080 以下なら単打型と判断できます。長打率 .500 / 打率 .300 なら ISO .200 で強打者、長打率 .380 / 打率 .300 なら ISO .080 でアベレージヒッターです。",
  },
  {
    question: "MLB と NPB で目安は違う？",
    answer:
      "MLB のリーグ平均長打率は .395〜.415 程度で NPB よりやや高めです。タイトル獲得ラインは MLB が .600 前後、NPB が .550〜.600 とほぼ同水準で、レベル別の目安はほぼそのまま流用できます。",
  },
];

const benchmarks = [
  {
    range: ".550 以上",
    pro: "リーグ最高長打率タイトル争い・本塁打王級",
    high: "甲子園出場校の主砲・プロ志望候補",
    middle: "全国大会レベルの主砲",
  },
  {
    range: ".500〜.549",
    pro: "クリーンアップ標準・主軸打者",
    high: "強豪校 4 番打者",
    middle: "県大会上位レベルの中軸",
  },
  {
    range: ".450〜.499",
    pro: "好打者・上位レギュラー",
    high: "地方大会レギュラー上位",
    middle: "市区大会レギュラー中軸",
  },
  {
    range: ".380〜.449",
    pro: "リーグ平均前後・レギュラー標準",
    high: "地方大会レギュラー標準",
    middle: "レギュラー水準",
  },
  {
    range: ".380 未満",
    pro: "長打力不足・要改善",
    high: "長打面で課題",
    middle: "長打面で課題",
  },
];

const positionBench = [
  {
    position: "一塁手・三塁手・コーナー外野",
    target: ".450 以上",
    note: "打撃を強く期待される。.500 を超えればチームの主軸",
  },
  {
    position: "中堅手・左翼手",
    target: ".420 以上",
    note: "走攻守バランス。中軸を任される場合は .450 以上",
  },
  {
    position: "二塁手・遊撃手",
    target: ".380 以上",
    note: "守備負担が重く、.400 を超えれば打撃でも貢献度大",
  },
  {
    position: "捕手",
    target: ".350〜.400",
    note: "守備・配球の負担を考慮した標準値",
  },
];

export default function SlgCriteriaColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="長打率はいくつから良い？レベル別の目安・基準・ポジション別を解説"
        description="長打率 .380 / .450 / .500 / .550 の意味と、レベル別の目安、ポジション別の基準を整理。"
        path="/column/slg-criteria"
        breadcrumbLeafName="長打率の目安・基準"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "長打率の目安・基準" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        長打率はいくつから良い？レベル別の目安・基準・ポジション別を解説
      </h1>

      <p className="mt-4 text-sm text-zinc-300 leading-6">
        長打率（SLG）は打者の長打力を示す指標で、NPB のリーグ平均が概ね
        <strong> .360〜.400 </strong>
        で推移します。本記事では数値帯ごとの意味と、ポジション別・カテゴリ別の目安を整理します。
      </p>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">数値帯別の意味</h2>
        <ul className="ml-5 list-disc space-y-2 text-sm text-zinc-300 leading-6">
          <li>
            <strong>.380（リーグ平均）</strong>: NPB
            のリーグ平均ライン。レギュラーとして最低限の長打力を示す
          </li>
          <li>
            <strong>.450（好打者ライン）</strong>:
            上位レギュラー水準。アベレージと長打のバランスが取れた打者
          </li>
          <li>
            <strong>.500（中心打者ライン）</strong>:
            クリーンアップを任される強打者の標準。年間 20
            本塁打以上が見える長打力
          </li>
          <li>
            <strong>.550（リーグ代表級）</strong>: 本塁打王・MVP
            を狙えるリーグトップクラスの長打力
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">レベル別の長打率目安テーブル</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-zinc-700 text-sm">
            <thead>
              <tr className="bg-zinc-800">
                <th className="border-b border-zinc-700 px-3 py-2 text-left text-zinc-300">
                  長打率
                </th>
                <th className="border-b border-zinc-700 px-3 py-2 text-left text-zinc-300">
                  プロ
                </th>
                <th className="border-b border-zinc-700 px-3 py-2 text-left text-zinc-300">
                  高校
                </th>
                <th className="border-b border-zinc-700 px-3 py-2 text-left text-zinc-300">
                  中学
                </th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((row) => (
                <tr key={row.range} className="even:bg-zinc-800/50">
                  <td className="border-b border-zinc-700 px-3 py-2 whitespace-nowrap font-bold text-yellow-500">
                    {row.range}
                  </td>
                  <td className="border-b border-zinc-700 px-3 py-2 text-zinc-300">
                    {row.pro}
                  </td>
                  <td className="border-b border-zinc-700 px-3 py-2 text-zinc-300">
                    {row.high}
                  </td>
                  <td className="border-b border-zinc-700 px-3 py-2 text-zinc-300">
                    {row.middle}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">ポジション別の長打率目安</h2>
        <p className="text-sm text-zinc-300 leading-6">
          守備負担の大きさによって、ポジションごとに期待される長打力の水準は変わります。同じ長打率でも、守備位置が違えば評価が大きく変わる点に注意してください。
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border border-zinc-700 text-sm">
            <thead>
              <tr className="bg-zinc-800">
                <th className="border-b border-zinc-700 px-3 py-2 text-left text-zinc-300">
                  ポジション
                </th>
                <th className="border-b border-zinc-700 px-3 py-2 text-left text-zinc-300">
                  目安
                </th>
                <th className="border-b border-zinc-700 px-3 py-2 text-left text-zinc-300">
                  補足
                </th>
              </tr>
            </thead>
            <tbody>
              {positionBench.map((row) => (
                <tr key={row.position} className="even:bg-zinc-800/50">
                  <td className="border-b border-zinc-700 px-3 py-2 font-bold text-zinc-200">
                    {row.position}
                  </td>
                  <td className="border-b border-zinc-700 px-3 py-2 whitespace-nowrap font-bold text-yellow-500">
                    {row.target}
                  </td>
                  <td className="border-b border-zinc-700 px-3 py-2 text-zinc-400">
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-8 rounded-xl border border-yellow-700/40 bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 px-5 py-6 text-center">
        <p className="mb-2 text-lg font-bold">あなたの長打率を計算してみよう</p>
        <Link
          href="/tools/slugging"
          className="inline-block rounded-lg bg-yellow-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-yellow-500"
        >
          長打率計算ツールを使う &rarr;
        </Link>
      </div>

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
            href="/column/slg"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">長打率とは（基本記事）</p>
            <p className="mt-1 text-xs text-zinc-400">
              意味・計算方法・打率との違い
            </p>
          </Link>
          <Link
            href="/column/slg-500"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">長打率 .500 とは</p>
            <p className="mt-1 text-xs text-zinc-400">中心打者ライン</p>
          </Link>
          <Link
            href="/column/slg-450"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">長打率 .450 とは</p>
            <p className="mt-1 text-xs text-zinc-400">好打者ライン</p>
          </Link>
          <Link
            href="/column/slg-ranking-npb"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">NPB 長打率ランキング</p>
            <p className="mt-1 text-xs text-zinc-400">歴代上位のスラッガー</p>
          </Link>
        </div>
      </section>
    </>
  );
}
