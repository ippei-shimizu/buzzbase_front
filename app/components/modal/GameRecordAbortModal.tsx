"use client";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";

/**
 * 中断ダイアログの文言バリエーション。
 * - new: 試合情報がまだ保存されていない（試合情報入力画面）
 * - recorded: 試合情報の保存後に打撃・投手・打席を入力している途中
 * - edit: 既存試合の編集としてフローに入っている
 */
export type GameRecordAbortMode = "new" | "recorded" | "edit";

// 保存済みのデータがあるかどうかで実際に失われるものが変わるため、文言を出し分ける。
const ABORT_COPY: Record<
  GameRecordAbortMode,
  { title: string; description: string }
> = {
  new: {
    title: "入力を中断しますか？",
    description: "入力中の試合情報は保存されません。",
  },
  recorded: {
    title: "入力を中断しますか？",
    description:
      "保存済みの試合結果は試合一覧に残ります。入力途中の内容は破棄されます。",
  },
  edit: {
    title: "編集を中断しますか？",
    description: "保存済みの内容は残りますが、編集中の内容は破棄されます。",
  },
};

interface GameRecordAbortModalProps {
  isOpen: boolean;
  mode: GameRecordAbortMode;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
}

export default function GameRecordAbortModal({
  isOpen,
  mode,
  onOpenChange,
  onConfirm,
}: GameRecordAbortModalProps) {
  const copy = ABORT_COPY[mode];

  return (
    <Modal
      size="sm"
      isOpen={isOpen}
      placement="center"
      onOpenChange={onOpenChange}
      className="buzz-dark w-11/12 ml-auto mr-auto"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="pb-0 text-base font-medium">
              {copy.title}
            </ModalHeader>
            <ModalBody>
              <p className="text-sm text-zinc-400">{copy.description}</p>
            </ModalBody>
            <ModalFooter className="pt-3">
              <Button className="text-white" variant="light" onPress={onClose}>
                キャンセル
              </Button>
              <Button color="danger" radius="sm" onPress={onConfirm}>
                中断する
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
