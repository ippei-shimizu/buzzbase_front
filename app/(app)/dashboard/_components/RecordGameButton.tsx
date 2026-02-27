"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlusIcon } from "@app/components/icon/PlusIcon";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import { createGameResult } from "@app/services/gameResultsService";

export default function RecordGameButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleNewRecord = async () => {
    setIsSubmitting(true);
    try {
      const newGameResult = await createGameResult();
      localStorage.setItem("gameResultId", JSON.stringify(newGameResult.id));
      router.push("/game-result/record");
    } catch (error) {
      console.error("試合記録の作成に失敗しました", error);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isSubmitting && <LoadingSpinner />}
      <Button
        color="primary"
        variant="solid"
        radius="full"
        fullWidth
        endContent={<PlusIcon width="22" height="22" fill="#F4F4F4" />}
        onPress={handleNewRecord}
        isDisabled={isSubmitting}
        className="font-bold text-base"
      >
        試合を記録する
      </Button>
    </>
  );
}
