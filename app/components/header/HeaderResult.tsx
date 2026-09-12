"use client";
import { Button, useDisclosure } from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";
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
const GAME_INFO_PATH = "/game-result/record";

/**
 * 中断時に実際に失われるものを判定する。
 * 試合情報入力より先のページにいる時点で match_result はサーバに保存済みなので、
 * 「入力中のデータは破棄される」とは言えない。
 */
function resolveAbortMode(
  pathname: string | null,
  isMatchResultSaved: boolean,
): GameRecordAbortMode {
  if (isGameRecordEditMode()) return "edit";
  if (isMatchResultSaved || pathname !== GAME_INFO_PATH) return "recorded";
  return "new";
}

interface HeaderResultProps {
  /**
   * 試合情報入力画面で既存の match_result を読み込んだ場合に true を渡す。
   * 保存後に戻ってきたケースを「未保存」と誤って案内しないために使う。
   */
  isMatchResultSaved?: boolean;
}

export default function HeaderResult({
  isMatchResultSaved = false,
}: HeaderResultProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
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
    setAbortMode(resolveAbortMode(pathname, isMatchResultSaved));
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
      <header className="py-2 px-3 fixed top-[var(--top-banner-offset,0px)] w-full bg-transparent z-50 pointer-events-none">
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
