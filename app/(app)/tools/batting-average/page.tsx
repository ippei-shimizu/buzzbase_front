import type { Metadata } from "next";
import Link from "next/link";
import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorPageContent from "../_components/CalculatorPageContent";
import BattingAverageCalculator from "./_components/BattingAverageCalculator";

const definition = getCalculatorDefinition("batting-average")!;

export const metadata: Metadata = {
  title: definition.metaTitle,
  description: definition.metaDescription,
  alternates: {
    canonical: `https://buzzbase.jp/tools/${definition.slug}`,
  },
};

export default function BattingAveragePage() {
  return (
    <>
      <CalculatorPageContent
        definition={definition}
        calculatorSlot={<BattingAverageCalculator />}
      />

      {/* 打率の計算方法と計算例 */}
      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">打率の計算方法と計算例</h2>
        <p className="text-sm text-zinc-300 leading-6">
          打率は「安打数 ÷
          打数」で計算します。打数には四球・死球・犠打・犠飛は含まれません。以下に具体的な計算例を示します。
        </p>

        <h3 className="font-bold text-base mt-6 mb-3">
          計算例①：好打者（3割打者）
        </h3>
        <p className="text-sm text-zinc-300 leading-6">150打数45安打の場合:</p>
        <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">打率 =</span> 45 ÷ 150 ={" "}
            <span className="text-yellow-500 font-bold">.300（3割0分0厘）</span>
          </p>
        </div>

        <h3 className="font-bold text-base mt-6 mb-3">計算例②：平均的な打者</h3>
        <p className="text-sm text-zinc-300 leading-6">200打数50安打の場合:</p>
        <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">打率 =</span> 50 ÷ 200 ={" "}
            <span className="text-yellow-500 font-bold">.250（2割5分0厘）</span>
          </p>
        </div>

        <h3 className="font-bold text-base mt-6 mb-3">
          計算例③：打撃不振の打者
        </h3>
        <p className="text-sm text-zinc-300 leading-6">100打数18安打の場合:</p>
        <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">打率 =</span> 18 ÷ 100 ={" "}
            <span className="text-yellow-500 font-bold">.180（1割8分0厘）</span>
          </p>
        </div>

        <h3 className="font-bold text-base mt-6 mb-3">打数と打席数の違い</h3>
        <p className="text-sm text-zinc-300 leading-6">
          打率の計算で使う「打数」と「打席数」は異なる概念です。打席数から以下を除いたものが打数になります。
        </p>
        <ul className="text-sm text-zinc-300 leading-6 mt-2 ml-4 list-disc space-y-1">
          <li>四球（フォアボール）</li>
          <li>死球（デッドボール）</li>
          <li>犠打（バント）</li>
          <li>犠飛（犠牲フライ）</li>
          <li>打撃妨害</li>
        </ul>
        <p className="text-sm text-zinc-300 leading-6 mt-3">
          たとえば10打席で四球が2回あった場合、打数は8です。8打数3安打なら打率は
          3÷8=.375 となります。
        </p>
      </section>

      {/* 打率の目安値テーブル */}
      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">打率の目安値・評価基準</h2>

        <h3 className="font-bold text-base mb-3">プロ野球（NPB）の打率目安</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-zinc-700">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  評価
                </th>
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  打率
                </th>
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  説明
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-zinc-800/50">
                <td className="px-4 py-2 border-b border-zinc-700 text-yellow-500 font-bold">
                  首位打者クラス
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .350以上
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  リーグを代表するトップバッター
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b border-zinc-700 text-yellow-500 font-bold">
                  好打者
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .300〜.349
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  クリーンアップを任せられる一流レベル
                </td>
              </tr>
              <tr className="bg-zinc-800/50">
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  平均的
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .250〜.299
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  リーグ平均前後。レギュラーとして標準的
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  要改善
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .250未満
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  打撃面での貢献が低い。守備や走塁で補う必要あり
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="font-bold text-base mt-6 mb-3">高校野球の打率目安</h3>
        <p className="text-sm text-zinc-300 leading-6 mb-3">
          高校野球では金属バットを使用するため、プロ野球より全体的に数値が高くなる傾向があります。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-zinc-700">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  評価
                </th>
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  打率
                </th>
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  説明
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-zinc-800/50">
                <td className="px-4 py-2 border-b border-zinc-700 text-yellow-500 font-bold">
                  優秀
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .400以上
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  甲子園出場レベルのチームの中心打者
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  好打者
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .350〜.399
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  地方大会で上位を狙えるレベル
                </td>
              </tr>
              <tr className="bg-zinc-800/50">
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  平均的
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .300〜.349
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  レギュラーとして標準的なレベル
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  要改善
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .300未満
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  バッティング練習の強化が必要
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-6 mb-4">
        <Link
          href="/column/batting-average"
          className="inline-flex items-center gap-1 text-sm text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
        >
          打率とは？意味・計算方法・目安を詳しく解説 &rarr;
        </Link>
      </div>
    </>
  );
}
