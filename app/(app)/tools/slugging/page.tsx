import type { Metadata } from "next";
import { SITE_URL } from "@app/constants/app";
import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorPageContent from "../_components/CalculatorPageContent";
import SluggingCalculator from "./_components/SluggingCalculator";

const definition = getCalculatorDefinition("slugging")!;

type SluggingSearchParams = {
  slg?: string;
};

const NUMERIC_PARAM_RE = /^\d+(?:\.\d{1,3})?$/;

/**
 * シェア URL のクエリパラメータを安全な数値に正規化する。
 * 長打率は理論上 0〜4 (全打席本塁打)。想定外の大きな値を弾いて metadata 出力をコントロールしやすくする。
 */
function parseShareSlg(value: string | undefined): number | null {
  if (!value || !NUMERIC_PARAM_RE.test(value)) return null;
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 4) return null;
  return parsed;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SluggingSearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const slgValue = parseShareSlg(sp.slg);

  const baseMetadata: Metadata = {
    title: definition.metaTitle,
    description: definition.metaDescription,
    alternates: {
      canonical: `${SITE_URL}/tools/${definition.slug}`,
    },
  };

  if (slgValue === null) {
    return baseMetadata;
  }

  const slgText = slgValue.toFixed(3);
  const ogImageUrl = `${SITE_URL}/api/og/slg-card?slg=${slgText}`;

  return {
    ...baseMetadata,
    openGraph: {
      title: definition.metaTitle,
      description: `長打率 ${slgText} の計算結果。あなたも BUZZ BASE で長打率を計算してシェアしよう。`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `長打率 ${slgText} の計算結果カード`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: definition.metaTitle,
      description: `長打率（SLG） ${slgText}`,
      images: [ogImageUrl],
    },
  };
}

export default function SluggingPage() {
  return (
    <CalculatorPageContent
      definition={definition}
      calculatorSlot={<SluggingCalculator />}
    />
  );
}
