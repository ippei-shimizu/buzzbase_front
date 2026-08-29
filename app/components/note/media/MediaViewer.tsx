"use client";

import type { MediaType } from "@app/interface/mediaAttachmentV2";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { useState } from "react";
import { MEMO_PLACEHOLDER } from "./mediaCopy";

export interface MediaViewerContent {
  /** 同じ添付を開き直したときにメモ入力を初期化するためのキー。 */
  key: string;
  mediaType: MediaType;
  /** 保存済みは playback_url、保存前は blob の object URL。 */
  url: string | null;
  memo: string;
}

interface MediaViewerProps {
  content: MediaViewerContent | null;
  onClose: () => void;
  /** 自分のノートを編集しているときだけメモを編集させる。 */
  editableMemo?: boolean;
  isSavingMemo?: boolean;
  onSaveMemo?: (memo: string) => void;
}

interface MemoEditorProps {
  initialMemo: string;
  isSaving: boolean;
  onSave: (memo: string) => void;
}

/**
 * メモ入力。開いている添付が変わったら親が `key` を変えて作り直すため、
 * props と state を useEffect で同期しない。
 */
function MemoEditor({ initialMemo, isSaving, onSave }: MemoEditorProps) {
  const [memo, setMemo] = useState(initialMemo);
  const hasChanges = memo !== initialMemo;

  return (
    <div className="w-full">
      <textarea
        aria-label="メディアのメモ"
        placeholder={MEMO_PLACEHOLDER}
        value={memo}
        onChange={(event) => setMemo(event.target.value)}
        rows={4}
        className="w-full rounded-lg border-2 border-zinc-600 bg-sub p-3 text-sm text-white placeholder:text-zinc-500 focus:border-[#d08000] focus:outline-none"
      />
      <Button
        color="primary"
        radius="sm"
        fullWidth
        className="mt-2 font-bold"
        isDisabled={!hasChanges || isSaving}
        isLoading={isSaving}
        onPress={() => onSave(memo)}
      >
        メモを保存
      </Button>
    </div>
  );
}

/** 添付した画像・動画の拡大表示とメモ編集。 */
export default function MediaViewer({
  content,
  onClose,
  editableMemo = false,
  isSavingMemo = false,
  onSaveMemo,
}: MediaViewerProps) {
  return (
    <Modal
      isOpen={content !== null}
      onClose={onClose}
      size="2xl"
      placement="center"
      scrollBehavior="inside"
      className="buzz-dark"
    >
      <ModalContent>
        <ModalHeader className="text-base text-white">
          {content?.mediaType === "video" ? "動画" : "画像"}
        </ModalHeader>
        <ModalBody className="gap-3">
          {content?.url ? (
            content.mediaType === "video" ? (
              <video
                src={content.url}
                controls
                playsInline
                className="max-h-[60vh] w-full rounded-lg bg-black"
              />
            ) : (
              // R2 の公開ドメインと blob: を混在で扱うため next/image は使わない。
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={content.url}
                alt="添付した画像"
                className="max-h-[60vh] w-full rounded-lg object-contain"
              />
            )
          ) : (
            <p className="text-sm text-zinc-400">
              メディアを表示できませんでした。
            </p>
          )}

          {editableMemo && content ? (
            <MemoEditor
              key={content.key}
              initialMemo={content.memo}
              isSaving={isSavingMemo}
              onSave={(memo) => onSaveMemo?.(memo)}
            />
          ) : content?.memo ? (
            <p className="whitespace-pre-wrap text-sm text-zinc-200">
              {content.memo}
            </p>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" className="text-white" onPress={onClose}>
            閉じる
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
