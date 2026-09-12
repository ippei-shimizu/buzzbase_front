"use client";
import { PlusIcon } from "@heroicons/react/24/solid";
import { Button } from "@heroui/react";
import { useState } from "react";

interface AddPlateAppearanceCardProps {
  batterBoxNumber: number;
  onAdd: () => void;
}

/** 打席リスト末尾の「結果を入力」プレースホルダ。次の打席番号を表示する。 */
export function AddPlateAppearanceCard({
  batterBoxNumber,
  onAdd,
}: AddPlateAppearanceCardProps) {
  // クリック後、遷移するまでの間ボタンを無効化して多重クリックを防ぐ。
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <div className="flex items-center justify-between rounded-xl border border-dashed border-zinc-600 px-4 py-3">
      <span className="text-base font-medium text-zinc-300">
        第{batterBoxNumber}打席
      </span>
      <Button
        color="primary"
        radius="full"
        size="sm"
        className="font-bold"
        startContent={<PlusIcon className="h-4 w-4" />}
        isDisabled={isNavigating}
        onPress={() => {
          setIsNavigating(true);
          onAdd();
        }}
      >
        結果を入力
      </Button>
    </div>
  );
}
