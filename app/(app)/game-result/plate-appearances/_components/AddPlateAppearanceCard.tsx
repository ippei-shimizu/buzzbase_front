"use client";
import { Button } from "@heroui/react";

interface AddPlateAppearanceCardProps {
  batterBoxNumber: number;
  onAdd: () => void;
}

/** 打席リスト末尾の「結果を入力」プレースホルダ。次の打席番号を表示する。 */
export function AddPlateAppearanceCard({
  batterBoxNumber,
  onAdd,
}: AddPlateAppearanceCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-dashed border-zinc-600 px-4 py-3">
      <span className="text-xs text-zinc-400">第{batterBoxNumber}打席</span>
      <Button
        color="primary"
        radius="full"
        size="sm"
        className="font-bold"
        onPress={onAdd}
      >
        結果を入力
      </Button>
    </div>
  );
}
