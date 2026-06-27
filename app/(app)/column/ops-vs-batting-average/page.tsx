import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "OPSと打率はどう違う？",
    answer:
      "打率は「安打数÷打数」で安打を打つ確率だけを評価します。OPSは出塁率（四球・死球を含む）と長打率（長打の威力）を合算した指標で、打者の総合的な攻撃力をより正確に評価できます。",
  },
  {
    question: "打率が高いのにOPSが低い選手は？",
    answer:
      "四球を選ばず長打も少ない「アベレージヒッタータイプ」がこれに該当します。例：打率.310 / OBP .340 / SLG .380 = OPS .720。打率の高さの割にOPSが平均水準にとどまります。",
  },
  {
    question: "打率が低いのにOPSが高い選手は？",
    answer:
      "選球眼が良く四球が多いタイプや、本塁打や長打が多いタイプが該当します。例：打率.250 / OBP .380 / SLG .520 = OPS .900。打率はそこそこでもOPSは強打者級になります。",
  },
];

export default function OpsVsBattingAverageColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="OPSと打率・出塁率・長打率の違いをわかりやすく解説"
        description="OPS・打率・出塁率・長打率の違いと使い分け方を、具体的な選手タイプ別に整理。"
        path="/column/ops-vs-batting-average"
        breadcrumbLeafName="OPSと打率の違い"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "OPSと打率の違い" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        OPSと打率・出塁率・長打率の違いをわかりやすく解説
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        OPS・打率（AVG）・出塁率（OBP）・長打率（SLG）はどれも打撃を評価する指標ですが、
        <strong>「何を測っているか」が異なります</strong>
        。本記事では各指標の意味と、打率は高いのにOPSが低い／逆に打率は低いのにOPSが高い、といった具体例を整理します。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">4つの指標の比較表</h2>
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
                  評価対象
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2 border-b border-zinc-700 font-bold text-yellow-500">
                  打率
                </td>
                <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300">
                  安打 ÷ 打数
                </td>
                <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300">
                  安打を打つ確率のみ
                </td>
              </tr>
              <tr className="bg-zinc-800/50">
                <td className="px-3 py-2 border-b border-zinc-700 font-bold text-yellow-500">
                  出塁率
                </td>
                <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300">
                  (安打＋四球＋死球) ÷ (打数＋四球＋死球＋犠飛)
                </td>
                <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300">
                  塁に出る能力（四球・死球含む）
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 border-b border-zinc-700 font-bold text-yellow-500">
                  長打率
                </td>
                <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300">
                  塁打数 ÷ 打数
                </td>
                <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300">
                  長打の威力（単打1／二塁打2／三塁打3／本塁打4）
                </td>
              </tr>
              <tr className="bg-zinc-800/50">
                <td className="px-3 py-2 border-b border-zinc-700 font-bold text-yellow-500">
                  OPS
                </td>
                <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300">
                  出塁率 ＋ 長打率
                </td>
                <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300">
                  打者の総合的な攻撃力
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">
          打率が高いのにOPSが低いケース
        </h2>
        <p className="text-sm text-zinc-300 leading-6">
          四球を選ばず長打も少ないアベレージヒッタータイプは、打率の割にOPSが伸びません。
          <br />
          例：打率 .310 / OBP .340 / SLG .380 = <strong>OPS .720</strong>
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">
          打率が低いのにOPSが高いケース
        </h2>
        <p className="text-sm text-zinc-300 leading-6">
          選球眼が良く四球が多い／本塁打が多いタイプは、打率は控えめでもOPSは高くなります。
          <br />
          例：打率 .250 / OBP .380 / SLG .520 = <strong>OPS .900</strong>
        </p>
        <p className="text-sm text-zinc-400 leading-6 mt-2">
          打率だけ見ると「平均的なバッター」に見えても、OPSで見ると中心打者クラスというケースは少なくありません。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">どう使い分ける？</h2>
        <ul className="text-sm text-zinc-300 leading-6 list-disc ml-5 space-y-1">
          <li>
            <strong>打率：</strong> 「安打を打つ技術」を見たいときの基本指標
          </li>
          <li>
            <strong>出塁率：</strong> リードオフマン・1〜2番タイプの評価に向く
          </li>
          <li>
            <strong>長打率：</strong> クリーンアップ・パワーヒッターの評価に向く
          </li>
          <li>
            <strong>OPS：</strong> 打者の総合力をひとつの数字で見たいとき
          </li>
        </ul>
      </section>

      <div className="mt-8 rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6 text-center">
        <p className="text-lg font-bold mb-2">あなたのOPSを計算してみよう</p>
        <Link
          href="/tools/ops"
          className="inline-block rounded-lg bg-yellow-600 hover:bg-yellow-500 transition-colors px-6 py-2.5 text-sm font-bold text-white"
        >
          OPS計算ツールを使う &rarr;
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
            href="/column/ops"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPSとは（基本記事）</p>
            <p className="text-xs text-zinc-400 mt-1">意味・計算方法・読み方</p>
          </Link>
          <Link
            href="/column/ops-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPSの目安・基準</p>
            <p className="text-xs text-zinc-400 mt-1">
              .700/.800/.900/1.000 の意味
            </p>
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
            href="/tools/slugging"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">長打率（SLG）計算ツール</p>
            <p className="text-xs text-zinc-400 mt-1">打撃の威力を数値化</p>
          </Link>
        </div>
      </section>
    </>
  );
}
