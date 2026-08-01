"use client";
import { Button, useDisclosure } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BackIcon } from "@app/components/icon/BackIcon";
import GameRecordAbortModal, {
  type GameRecordAbortMode,
} from "@app/components/modal/GameRecordAbortModal";
import {
  clearGameRecordStorage,
  isGameRecordEditMode,
  readGameResultId,
} from "@app/utils/gameRecordStorage";

const GAME_RESULT_LIST_PATH = "/game-result/lists";

export default function HeaderResult() {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [abortMode, setAbortMode] = useState<GameRecordAbortMode>("new");

  useEffect(() => {
    // リロード・タブクローズで入力中のフォームが失われることを警告する。
    // 表示される文言はブラウザ側で固定のため指定できない。
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleBackClick = () => {
    window.history.back();
  };

  const handleAbortPress = () => {
    setAbortMode(isGameRecordEditMode() ? "edit" : "new");
    onOpen();
  };

  const handleAbortConfirm = () => {
    // 遷移先の判定に使う ID はクリア前に控えておく。
    const editingGameResultId = readGameResultId();
    clearGameRecordStorage();
    onClose();
    router.push(
      abortMode === "edit" && editingGameResultId !== null
        ? `/game-result/summary/${editingGameResultId}`
        : GAME_RESULT_LIST_PATH,
    );
  };

  return (
    <>
      {/* 背景透過のまま全幅に広げるため、ヘッダー自体はクリックを透過させる。 */}
      <header className="py-2 px-3 fixed top-[var(--smart-banner-height,0px)] w-full bg-transparent z-50 pointer-events-none">
        <div className="flex items-center justify-between max-w-[692px] mx-auto lg:m-[0_auto_0_28%]">
          <button
            type="button"
            aria-label="戻る"
            className="pointer-events-auto"
            onClick={handleBackClick}
          >
            <BackIcon width="24" height="24" fill="" stroke="white" />
          </button>
          <Button
            size="sm"
            radius="full"
            variant="light"
            className="pointer-events-auto text-zinc-300"
            onPress={handleAbortPress}
          >
            中断
          </Button>
        </div>
      </header>
      <GameRecordAbortModal
        isOpen={isOpen}
        mode={abortMode}
        onOpenChange={onOpenChange}
        onConfirm={handleAbortConfirm}
      />
    </>
  );
}
