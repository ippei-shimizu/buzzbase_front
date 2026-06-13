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

function isValidShareParam(value: string | undefined): value is string {
  if (!value) return false;
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) return false;
  return parsed >= 0 && parsed <= 5;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<OpsSearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const hasShareParams =
    isValidShareParam(sp.ops) &&
    isValidShareParam(sp.obp) &&
    isValidShareParam(sp.slg);

  const baseMetadata: Metadata = {
    title: definition.metaTitle,
    description: definition.metaDescription,
    alternates: {
      canonical: `${SITE_URL}/tools/${definition.slug}`,
    },
  };

  if (!hasShareParams) {
    return baseMetadata;
  }

  const ogImageUrl = `${SITE_URL}/api/og/ops-card?ops=${encodeURIComponent(
    sp.ops!,
  )}&obp=${encodeURIComponent(sp.obp!)}&slg=${encodeURIComponent(sp.slg!)}`;

  return {
    ...baseMetadata,
    openGraph: {
      title: definition.metaTitle,
      description: `OPS ${sp.ops} の計算結果。出塁率 ${sp.obp} / 長打率 ${sp.slg}。あなたも BUZZ BASE で OPS を計算してシェアしよう。`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `OPS ${sp.ops} の計算結果カード`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: definition.metaTitle,
      description: `OPS ${sp.ops}（出塁率 ${sp.obp} / 長打率 ${sp.slg}）`,
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
