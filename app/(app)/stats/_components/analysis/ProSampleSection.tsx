"use client";
import type { ProFeature } from "@app/types/pro";
import type { ReactNode } from "react";
import { ProUpsellCard } from "@app/components/pro/ProUpsellCard";
import { SampleDataLabel } from "@app/components/pro/SampleDataLabel";

interface ProSampleSectionProps {
  feature: ProFeature;
  /**
   * サンプルデータを流し込んだ実コンポーネント。暗幕で覆わず操作できる状態のまま置き、
   * 展開や絞り込みといった Pro 機能の操作感を加入前に体験させる。
   */
  children: ReactNode;
}

/** 無料ユーザー向けに、Pro 訴求カード + サンプルデータの実 UI を縦に並べる。 */
export function ProSampleSection({ feature, children }: ProSampleSectionProps) {
  return (
    <div className="flex flex-col gap-y-2">
      <ProUpsellCard feature={feature} />
      <SampleDataLabel />
      {children}
    </div>
  );
}
