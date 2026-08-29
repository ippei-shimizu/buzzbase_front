"use client";

import type { MediaViewerContent } from "./MediaViewer";
import type { NoteMediaAttachment } from "@app/interface/mediaAttachmentV2";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { useState } from "react";
import {
  deleteMediaAttachment,
  updateMediaAttachmentMemo,
} from "@app/services/v2/mediaAttachmentService";
import { DELETE_CONFIRM_BODY, DELETE_CONFIRM_TITLE } from "./mediaCopy";
import MediaThumbnail from "./MediaThumbnail";
import MediaViewer from "./MediaViewer";

interface MediaAttachmentListProps {
  attachments: NoteMediaAttachment[];
  noteId: number;
  /** 自分のノートを編集しているときだけ削除・メモ編集を許す。 */
  editable?: boolean;
  /** 削除・メモ更新が成功したときに呼ぶ（一覧の再取得用）。 */
  onChanged?: () => void;
}

const STATUS_LABEL: Record<string, string | undefined> = {
  pending: "処理中…",
  failed: "アップロードに失敗しました",
};

/** ノートに保存済みの画像・動画の一覧。タップで拡大表示とメモ編集。 */
export default function MediaAttachmentList({
  attachments,
  noteId,
  editable = false,
  onChanged,
}: MediaAttachmentListProps) {
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [deletingTargetId, setDeletingTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingMemo, setIsSavingMemo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (attachments.length === 0) return null;

  const viewing = attachments.find((item) => item.id === viewingId) ?? null;
  const viewerContent: MediaViewerContent | null = viewing
    ? {
        key: `${viewing.id}-${viewing.memo ?? ""}`,
        mediaType: viewing.media_type,
        url: viewing.playback_url,
        memo: viewing.memo ?? "",
      }
    : null;

  const handleDelete = async () => {
    if (deletingTargetId === null) return;
    setIsDeleting(true);
    const result = await deleteMediaAttachment(deletingTargetId, noteId);
    setIsDeleting(false);
    setDeletingTargetId(null);
    if (!result.ok) {
      setError(result.errors[0] ?? "削除に失敗しました");
      return;
    }
    setError(null);
    if (viewingId === deletingTargetId) setViewingId(null);
    onChanged?.();
  };

  const handleSaveMemo = async (memo: string) => {
    if (!viewing) return;
    setIsSavingMemo(true);
    const result = await updateMediaAttachmentMemo(
      viewing.id,
      { memo },
      noteId,
    );
    setIsSavingMemo(false);
    if (!result.ok) {
      setError(result.errors[0] ?? "メモの保存に失敗しました");
      return;
    }
    setError(null);
    setViewingId(null);
    onChanged?.();
  };

  return (
    <div className="mt-3">
      <ul className="grid grid-cols-3 gap-3">
        {attachments.map((attachment) => (
          <li key={attachment.id}>
            <MediaThumbnail
              previewUrl={attachment.thumbnail_url ?? attachment.playback_url}
              mediaType={attachment.media_type}
              memo={attachment.memo}
              statusLabel={STATUS_LABEL[attachment.status]}
              onOpen={
                attachment.status === "ready"
                  ? () => setViewingId(attachment.id)
                  : undefined
              }
              onRemove={
                editable ? () => setDeletingTargetId(attachment.id) : undefined
              }
              removeLabel="この添付を削除"
            />
          </li>
        ))}
      </ul>

      {error ? (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {error}
        </p>
      ) : null}

      <MediaViewer
        content={viewerContent}
        onClose={() => setViewingId(null)}
        editableMemo={editable}
        isSavingMemo={isSavingMemo}
        onSaveMemo={(memo) => void handleSaveMemo(memo)}
      />

      <Modal
        isOpen={deletingTargetId !== null}
        onClose={() => setDeletingTargetId(null)}
        size="sm"
        placement="center"
        className="buzz-dark"
      >
        <ModalContent>
          <ModalHeader className="text-base text-white">
            {DELETE_CONFIRM_TITLE}
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-zinc-300">{DELETE_CONFIRM_BODY}</p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              className="text-white"
              onPress={() => setDeletingTargetId(null)}
            >
              キャンセル
            </Button>
            <Button
              color="danger"
              radius="sm"
              isLoading={isDeleting}
              onPress={() => void handleDelete()}
            >
              削除する
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
