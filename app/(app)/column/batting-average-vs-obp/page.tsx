import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "打率と出塁率の違いは？",
    answer:
      "打率は「安打数 ÷ 打数」で安打を打つ確率だけを評価します。出塁率は「(安打 + 四球 + 死球) ÷ (打数 + 四球 + 死球 + 犠飛)」で、四球・死球による出塁も含めた塁に出る確率を評価します。",
  },
  {
    question: "打率が高いのに出塁率が低い選手は？",
    answer:
      "四球を選ばないアグレッシブな打者がこれに該当します。例: 打率 .310 / OBP .340 (差 0.030)。打率の割に出塁率が伸びず、リードオフマンとしての価値は限定的です。",
  },
  {
    question: "打率が低いのに出塁率が高い選手は？",
    answer:
      "選球眼が良く四球が多いタイプ。例: 打率 .250 / OBP .380 (差 0.130)。リードオフマンや 2 番打者として高く評価される選手です。",
  },
];

export default function BattingAverageVsObpColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="打率と出塁率の違いをわかりやすく解説｜AVG と OBP の使い分け"
        description="打率（AVG）と出塁率（OBP）の違いと使い分け方を、具体例で整理。"
        path="/column/batting-average-vs-obp"
        breadcrumbLeafName="打率と出塁率の違い"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "打率と出塁率の違い" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        打率と出塁率の違いをわかりやすく解説
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        打率（AVG）と出塁率（OBP）はどちらも打者の評価に使う指標ですが、
        <strong>「四球・死球を含めるかどうか」</strong>の 1
        点が決定的に違います。本記事では両者の意味と使い分け方、具体例を整理します。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">2 指標の比較表</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-zinc-700">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  指標
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  式
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  四球・死球
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2 border-b border-zinc-700 font-bold text-yellow-500">
                  打率 (AVG)
                </td>
                <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300">
                  安打 ÷ 打数
                </td>
                <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300">
                  含まない
                </td>
              </tr>
              <tr className="bg-zinc-800/50">
                <td className="px-3 py-2 border-b border-zinc-700 font-bold text-yellow-500">
                  出塁率 (OBP)
                </td>
                <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300">
                  (安打＋四球＋死球) ÷ (打数＋四球＋死球＋犠飛)
                </td>
                <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300">
                  含む
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">
          打率が高いのに出塁率が低いケース
        </h2>
        <p className="text-sm text-zinc-300 leading-6">
          四球を選ばないフリースインガータイプ。
          <br />
          例：打率 .310 / 出塁率 .340 = <strong>差 .030</strong>
        </p>
        <p className="text-sm text-zinc-400 leading-6 mt-2">
          打率は高いが、選球眼が課題でリードオフマンとしては物足りない打者。クリーンアップ向きのタイプです。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">
          打率が低いのに出塁率が高いケース
        </h2>
        <p className="text-sm text-zinc-300 leading-6">
          選球眼が良く四球が多いタイプ。
          <br />
          例：打率 .250 / 出塁率 .380 = <strong>差 .130</strong>
        </p>
        <p className="text-sm text-zinc-400 leading-6 mt-2">
          打率は控えめでも出塁率は中心打者級。リードオフマンや 2
          番打者として高く評価される選手です。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">どう使い分ける？</h2>
        <ul className="text-sm text-zinc-300 leading-6 list-disc ml-5 space-y-1">
          <li>
            <strong>打率（AVG）:</strong> 「安打を打つ技術」を評価したいとき
          </li>
          <li>
            <strong>出塁率（OBP）:</strong> 「塁に出る能力」(四球も含めた出塁率)
            を評価したいとき
          </li>
          <li>
            <strong>OBP - AVG の差:</strong> 選球眼の指標。.080 以上あれば優秀
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
        <h2 className="text-xl font-bold mb-4">関連コラム・ツール</h2>
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
            href="/tools/obp"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">出塁率（OBP）計算ツール</p>
            <p className="text-xs text-zinc-400 mt-1">
              四球・死球を含む出塁能力
            </p>
          </Link>
          <Link
            href="/column/ops"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPS とは</p>
            <p className="text-xs text-zinc-400 mt-1">
              出塁率＋長打率による総合評価
            </p>
          </Link>
        </div>
      </section>
    </>
  );
}
