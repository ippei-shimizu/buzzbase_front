import type { Metadata } from "next";
import { SITE_URL } from "@app/constants/app";
import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorPageContent from "../_components/CalculatorPageContent";
import EraCalculator from "./_components/EraCalculator";

const definition = getCalculatorDefinition("era")!;

type EraSearchParams = {
  era?: string;
};

// 数値だけを許容する厳密な正規表現。Number.parseFloat は "2.5<script>" のような
// 末尾ゴミ付き文字列も部分的にパースしてしまうため、metadata 注入を防ぐ目的で
// 文字列全体が数値表現であることをチェックする。
const NUMERIC_PARAM_RE = /^\d+(?:\.\d{1,2})?$/;

/**
 * シェア URL のクエリパラメータを安全な数値に正規化する。
 * 0..99 の範囲は防御率の実用上の最大値に合わせている (理論上の上限はないが、
 * 想定外の大きな値を弾いて metadata 出力をコントロールしやすくする)。
 */
function parseShareEra(value: string | undefined): number | null {
  if (!value || !NUMERIC_PARAM_RE.test(value)) return null;
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 99) return null;
  return parsed;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<EraSearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const eraValue = parseShareEra(sp.era);

  const baseMetadata: Metadata = {
    title: definition.metaTitle,
    description: definition.metaDescription,
    alternates: {
      canonical: `${SITE_URL}/tools/${definition.slug}`,
    },
  };

  if (eraValue === null) {
    return baseMetadata;
  }

  // 以降は必ず正規化済みの数値文字列のみを使い、生クエリは description / alt に
  // 一切流入させない。これにより metadata 注入の余地を構造的に消す。
  const eraText = eraValue.toFixed(2);
  const ogImageUrl = `${SITE_URL}/api/og/era-card?era=${eraText}`;

  return {
    ...baseMetadata,
    openGraph: {
      title: definition.metaTitle,
      description: `防御率 ${eraText} の計算結果。あなたも BUZZ BASE で防御率を計算してシェアしよう。`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `防御率 ${eraText} の計算結果カード`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: definition.metaTitle,
      description: `防御率（ERA） ${eraText}`,
      images: [ogImageUrl],
    },
  };
}

export default function EraPage() {
  return (
    <CalculatorPageContent
      definition={definition}
      calculatorSlot={<EraCalculator />}
    />
  );
}
