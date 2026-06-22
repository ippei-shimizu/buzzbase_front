import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@app/constants/app";
import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorPageContent from "../_components/CalculatorPageContent";
import OpsCalculator from "./_components/OpsCalculator";

const definition = getCalculatorDefinition("ops")!;

type OpsSearchParams = {
  ops?: string;
  obp?: string;
  slg?: string;
};

// 数値だけを許容する厳密な正規表現。Number.parseFloat は "0.5<script>" のような
// 末尾ゴミ付き文字列も部分的にパースしてしまうため、metadata 注入を防ぐ目的で
// 文字列全体が数値表現であることをチェックする。
const NUMERIC_PARAM_RE = /^\d+(?:\.\d{1,3})?$/;

/**
 * シェア URL のクエリパラメータを安全な数値に正規化する。
 * 形式不正・範囲外なら null。0..5 の範囲は OPS の理論最大値 5.000 に合わせている。
 */
function parseShareParam(value: string | undefined): number | null {
  if (!value || !NUMERIC_PARAM_RE.test(value)) return null;
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 5) return null;
  return parsed;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<OpsSearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const opsValue = parseShareParam(sp.ops);
  const obpValue = parseShareParam(sp.obp);
  const slgValue = parseShareParam(sp.slg);

  const baseMetadata: Metadata = {
    title: definition.metaTitle,
    description: definition.metaDescription,
    alternates: {
      canonical: `${SITE_URL}/tools/${definition.slug}`,
    },
  };

  if (opsValue === null || obpValue === null || slgValue === null) {
    return baseMetadata;
  }

  // 以降は必ず正規化済みの数値文字列のみを使い、生クエリは description / alt に
  // 一切流入させない。これにより metadata 注入の余地を構造的に消す。
  const opsText = opsValue.toFixed(3);
  const obpText = obpValue.toFixed(3);
  const slgText = slgValue.toFixed(3);
  const ogImageUrl = `${SITE_URL}/api/og/ops-card?ops=${opsText}&obp=${obpText}&slg=${slgText}`;

  return {
    ...baseMetadata,
    openGraph: {
      title: definition.metaTitle,
      description: `OPS ${opsText} の計算結果。出塁率 ${obpText} / 長打率 ${slgText}。あなたも BUZZ BASE で OPS を計算してシェアしよう。`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `OPS ${opsText} の計算結果カード`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: definition.metaTitle,
      description: `OPS ${opsText}（出塁率 ${obpText} / 長打率 ${slgText}）`,
      images: [ogImageUrl],
    },
  };
}

export default function OpsPage() {
  return (
    <>
      <CalculatorPageContent
        definition={definition}
        calculatorSlot={<OpsCalculator />}
      />
      <div className="mt-6 mb-4">
        <Link
          href="/column/ops"
          className="inline-flex items-center gap-1 text-sm text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
        >
          OPSとは？意味・計算方法・目安を詳しく解説 &rarr;
        </Link>
      </div>
    </>
  );
}
