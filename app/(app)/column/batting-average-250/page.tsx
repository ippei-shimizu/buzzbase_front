import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "打率 .250 は NPB で平均レベル？",
    answer:
      "はい、NPB のリーグ平均打率はおおむね .240〜.260 の範囲で推移しているため、.250 はちょうど平均水準です。レギュラー定着の最低ラインとして語られることが多いラインです。",
  },
  {
    question: "高校野球で打率 .250 はどう評価される？",
    answer:
      "金属バットの影響で全体に数字が出やすい高校野球では、.250 は「やや低い」イメージ。レギュラーを維持するには .300 前後、強豪校で主軸を狙うには .350 以上が必要です。",
  },
  {
    question: "打率 .250 から .300 に上げるためのポイントは？",
    answer:
      "三振率を 5% 程度下げ、強い打球（ライナー性）の割合を増やすことが基本。さらに「追い込まれてからのカット技術」「インコースの捌き」など 2 ストライク打率を上げる工夫で .280 → .300 が見えてきます。",
  },
];

export default function BattingAverage250ColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="打率 .250 は平均？高校野球・プロ野球での位置づけ"
        description="打率 .250 はリーグ平均水準。プロ・高校野球での意味と .250 から .280 / .300 に上げる改善ポイントを整理。"
        path="/column/batting-average-250"
        breadcrumbLeafName="打率 .250"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "打率 .250 とは" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        打率 .250 は平均？高校野球とプロ野球での位置づけ
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        打率 <strong>.250</strong> は NPB
        のリーグ平均ラインです。年度によりますがリーグ平均打率は概ね .240〜.260
        で推移しており、.250 はちょうど「レギュラーとして平均的な打者」の目安。
        <strong>レギュラー定着の最低ライン</strong>
        として語られることも多い水準です。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">プロ野球での打率 .250</h2>
        <p className="text-sm text-zinc-300 leading-6">
          NPB の場合、.250 前後ならリーグ平均レベルのレギュラーです。.250
          を下回り続けると、守備や走塁での貢献がなければスタメンを外れやすくなります。逆に
          .250
          を安定して超えていれば、下位打線として価値のあるバッターと言えます。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">高校野球での打率 .250</h2>
        <p className="text-sm text-zinc-300 leading-6">
          金属バットの影響で全体に数字が出やすい高校野球では、.250
          は「やや低い」イメージ。レギュラーを維持するには .300
          前後、強豪校で主軸を狙うには .350 以上が必要です。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">
          .250 を超えるための改善ポイント
        </h2>
        <ul className="text-sm text-zinc-300 leading-6 list-disc ml-5 space-y-1">
          <li>
            <strong>三振率を下げる</strong>:
            振る前に「これは打てるか」を判断する精度を上げる
          </li>
          <li>
            <strong>ライナー率を上げる</strong>:
            ゴロや内野フライを減らし、ライナー性の打球を増やす
          </li>
          <li>
            <strong>2 ストライク打率を上げる</strong>:
            追い込まれてからのカット技術・コンパクトスイング
          </li>
          <li>
            <strong>逆方向への打ち分け</strong>:
            ヒットゾーンを広げて守備シフトを無効化
          </li>
        </ul>
      </section>

      <div className="mt-8 rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6 text-center">
        <p className="text-lg font-bold mb-2">あなたの打率を計算してみよう</p>
        <Link
          href="/tools/batting-average"
          className="inline-block rounded-lg bg-yellow-600 hover:bg-yellow-500 transition-colors px-6 py-2.5 text-sm font-bold text-white"
        >
          打率計算ツールを使う &rarr;
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
            href="/column/batting-average"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">打率とは（基本記事）</p>
            <p className="text-xs text-zinc-400 mt-1">意味・計算方法</p>
          </Link>
          <Link
            href="/column/batting-average-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">打率の目安・基準</p>
            <p className="text-xs text-zinc-400 mt-1">レベル別の意味</p>
          </Link>
          <Link
            href="/column/batting-average-300"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">打率 3 割の意味</p>
            <p className="text-xs text-zinc-400 mt-1">好打者ライン</p>
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
    </>
  );
}
