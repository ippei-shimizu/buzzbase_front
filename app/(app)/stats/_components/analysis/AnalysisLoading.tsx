"use client";
import { Spinner } from "@heroui/react";

/** 分析セクションのストリーミング中に出すインラインローディング。 */
export function AnalysisLoading() {
  return (
    <div className="flex justify-center py-16">
      <Spinner color="primary" labelColor="primary" label="Loading" />
    </div>
  );
}
