"use client";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";

export type GameRecordAbortMode = "new" | "edit";

// 編集中断は保存済みデータが残るため、新規記録とは異なる文言で誤解を防ぐ。
const ABORT_COPY: Record<
  GameRecordAbortMode,
  { title: string; description: string }
> = {
  new: {
    title: "入力を中断しますか？",
    description: "入力中のデータは破棄されます。",
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
