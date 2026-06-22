import type { Metadata } from "next";
import { SITE_URL } from "@app/constants/app";
import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorPageContent from "../_components/CalculatorPageContent";
import ObpCalculator from "./_components/ObpCalculator";

const definition = getCalculatorDefinition("obp")!;

type ObpSearchParams = {
  obp?: string;
};

const NUMERIC_PARAM_RE = /^\d+(?:\.\d{1,3})?$/;

/**
 * シェア URL のクエリパラメータを安全な数値に正規化する。
 * 出塁率は理論上 0〜1 だが、想定外の大きな値を弾いて metadata 出力をコントロールしやすくする。
 */
function parseShareObp(value: string | undefined): number | null {
  if (!value || !NUMERIC_PARAM_RE.test(value)) return null;
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 1) return null;
  return parsed;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ObpSearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const obpValue = parseShareObp(sp.obp);

  const baseMetadata: Metadata = {
    title: definition.metaTitle,
    description: definition.metaDescription,
    alternates: {
      canonical: `${SITE_URL}/tools/${definition.slug}`,
    },
  };

  if (obpValue === null) {
    return baseMetadata;
  }

  const obpText = obpValue.toFixed(3);
  const ogImageUrl = `${SITE_URL}/api/og/obp-card?obp=${obpText}`;

  return {
    ...baseMetadata,
    openGraph: {
      title: definition.metaTitle,
      description: `出塁率 ${obpText} の計算結果。あなたも BUZZ BASE で出塁率を計算してシェアしよう。`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `出塁率 ${obpText} の計算結果カード`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: definition.metaTitle,
      description: `出塁率（OBP） ${obpText}`,
      images: [ogImageUrl],
    },
  };
}

export default function ObpPage() {
  return (
    <CalculatorPageContent
      definition={definition}
      calculatorSlot={<ObpCalculator />}
    />
  );
}
