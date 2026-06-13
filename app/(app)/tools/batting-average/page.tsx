import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@app/constants/app";
import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorPageContent from "../_components/CalculatorPageContent";
import BattingAverageCalculator from "./_components/BattingAverageCalculator";

const definition = getCalculatorDefinition("batting-average")!;

type BattingAverageSearchParams = {
  avg?: string;
};

// 数値だけを許容する厳密な正規表現。Number.parseFloat は "0.3<script>" のような
// 末尾ゴミ付き文字列も部分的にパースしてしまうため、metadata 注入を防ぐ目的で
// 文字列全体が数値表現であることをチェックする。
const NUMERIC_PARAM_RE = /^\d+(?:\.\d{1,3})?$/;

/**
 * シェア URL のクエリパラメータを安全な数値に正規化する。
 * 0.0〜1.0 の範囲は打率の理論上の値域 (安打数 ÷ 打数) に合わせている。
 */
function parseShareAvg(value: string | undefined): number | null {
  if (!value || !NUMERIC_PARAM_RE.test(value)) return null;
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 1) return null;
  return parsed;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<BattingAverageSearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const avgValue = parseShareAvg(sp.avg);

  const baseMetadata: Metadata = {
    title: definition.metaTitle,
    description: definition.metaDescription,
    alternates: {
      canonical: `${SITE_URL}/tools/${definition.slug}`,
    },
  };

  if (avgValue === null) {
    return baseMetadata;
  }

  // 以降は必ず正規化済みの数値文字列のみを使い、生クエリは description / alt に
  // 一切流入させない。これにより metadata 注入の余地を構造的に消す。
  const avgText = avgValue.toFixed(3);
  const ogImageUrl = `${SITE_URL}/api/og/batting-average-card?avg=${avgText}`;

  return {
    ...baseMetadata,
    openGraph: {
      title: definition.metaTitle,
      description: `打率 ${avgText} の計算結果。あなたも BUZZ BASE で打率を計算してシェアしよう。`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `打率 ${avgText} の計算結果カード`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: definition.metaTitle,
      description: `打率（AVG） ${avgText}`,
      images: [ogImageUrl],
    },
  };
}

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
                <td className="px-4 py-2 border-b border-zinc-700 text-amber-400 font-bold">
                  S（歴代級）
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .350以上
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  リーグを代表するトップバッター・首位打者上位
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b border-zinc-700 text-yellow-500 font-bold">
                  A（好打者）
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .300〜.349
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  3 割打者の証・クリーンアップを任せられる一流レベル
                </td>
              </tr>
              <tr className="bg-zinc-800/50">
                <td className="px-4 py-2 border-b border-zinc-700 text-yellow-500 font-bold">
                  B（中堅レギュラー）
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .280〜.299
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  リーグ平均より上の中堅レギュラー水準
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  C（平均）
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .250〜.279
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  NPB のリーグ平均前後・標準的なレギュラー
                </td>
              </tr>
              <tr className="bg-zinc-800/50">
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  D（要改善）
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
