"use client";

import type { StagedMediaAsset } from "@app/interface/mediaAttachmentV2";
import type { PreparedMedia } from "@app/utils/media/uploadPipeline";
import { Button } from "@heroui/react";
import { useRef, useState } from "react";
import { ProUpsellCard } from "@app/components/pro/ProUpsellCard";
import { useMediaUpload } from "@app/hooks/media/useMediaUpload";
import {
  MEDIA_ACCEPT_ATTRIBUTE,
  buildStagedLocalId,
} from "@app/utils/media/mediaFile";
import { UPLOAD_PHASE_LABEL } from "@app/utils/media/uploadPhase";
import {
  ADD_BUTTON_LABEL,
  CANCEL_UPLOAD_LABEL,
  FREE_LIMIT_DESCRIPTION,
  FREE_LIMIT_NOTICE,
  FREE_LIMIT_TITLE,
  pickerHint,
} from "./mediaCopy";

interface MediaPickerProps {
  /**
   * 保存済みノートの ID。渡された場合は選択直後にアップロードする。
   * 未指定（新規作成中）は `onStage` へ渡すだけにとどめ、ノート保存後にまとめて送る。
   */
  baseballNoteId?: number;
  onStage?: (asset: StagedMediaAsset) => void;
  onUploaded?: () => void;
}

/** 動画のサムネイル生成に失敗した場合はプレビューを諦める（選択自体は継続させる）。 */
function buildPreviewUrl(prepared: PreparedMedia): string | null {
  if (prepared.thumbnail) return URL.createObjectURL(prepared.thumbnail);
  if (prepared.mediaType === "image") return URL.createObjectURL(prepared.file);
  return null;
}

/** ノートに画像・動画を添付するためのファイル選択。 */
export default function MediaPicker({
  baseballNoteId,
  onStage,
  onUploaded,
}: MediaPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    phase,
    progress,
    isBusy,
    hasUnlimitedUploads,
    prepare,
    upload,
    cancel,
    reset,
  } = useMediaUpload();
  const [error, setError] = useState<string | null>(null);
  const [isLimitReached, setIsLimitReached] = useState(false);

  const handleSelect = async (file: File) => {
    setError(null);
    const prepared = await prepare(file);
    if (!prepared.ok) {
      setError(prepared.message);
      reset();
      return;
    }

    if (baseballNoteId === undefined) {
      onStage?.({
        localId: buildStagedLocalId(),
        file: prepared.prepared.file,
        fileName: file.name,
        mediaType: prepared.prepared.mediaType,
        contentType: prepared.prepared.contentType,
        thumbnail: prepared.prepared.thumbnail,
        previewUrl: buildPreviewUrl(prepared.prepared),
        durationSeconds: prepared.prepared.durationSeconds,
        width: prepared.prepared.width,
        height: prepared.prepared.height,
        memo: "",
      });
      reset();
      return;
    }

    const result = await upload(prepared.prepared, baseballNoteId);
    if (result.ok) {
      reset();
      onUploaded?.();
      return;
    }
    if (result.reason === "limit_reached") {
      setIsLimitReached(true);
      setError(FREE_LIMIT_NOTICE);
    } else if (result.reason !== "canceled") {
      setError(result.message);
    }
    reset();
  };

  const phaseLabel = UPLOAD_PHASE_LABEL[phase];

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={MEDIA_ACCEPT_ATTRIBUTE}
        aria-label={ADD_BUTTON_LABEL}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          // 同じファイルを選び直しても change が発火するよう毎回クリアする。
          event.target.value = "";
          if (file) void handleSelect(file);
        }}
      />
      <Button
        radius="sm"
        variant="bordered"
        className="text-white"
        isDisabled={isBusy}
        onPress={() => inputRef.current?.click()}
      >
        {ADD_BUTTON_LABEL}
      </Button>
      <p className="mt-1.5 text-xs text-zinc-400">
        {pickerHint(hasUnlimitedUploads)}
      </p>

      {isBusy && phaseLabel ? (
        <div className="mt-2 flex items-center gap-3">
          <p role="status" className="text-xs text-zinc-300">
            {phaseLabel}
            {progress.total > 1
              ? `（${progress.completed + 1}/${progress.total}）`
              : ""}
          </p>
          <button
            type="button"
            onClick={cancel}
            className="text-xs font-bold text-zinc-400 underline"
          >
            {CANCEL_UPLOAD_LABEL}
          </button>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {error}
        </p>
      ) : null}

      {isLimitReached ? (
        <ProUpsellCard
          feature="unlimited_media_uploads"
          title={FREE_LIMIT_TITLE}
          description={FREE_LIMIT_DESCRIPTION}
          className="mt-3"
        />
      ) : null}
    </div>
  );
}
