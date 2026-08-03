"use client";

import type { MediaType } from "@app/interface/mediaAttachmentV2";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { buildMediaMemoLabel } from "@app/utils/media/mediaMemoLabel";

interface MediaThumbnailProps {
  previewUrl: string | null;
  mediaType: MediaType;
  memo: string | null;
  /** サムネイルの代わりに出す状態ラベル（処理中・失敗など）。指定時は開けない。 */
  statusLabel?: string;
  onOpen?: () => void;
  onRemove?: () => void;
  removeLabel: string;
  isRemoving?: boolean;
}

/** 添付・ステージ済みメディアで共通のサムネイルタイル。 */
export default function MediaThumbnail({
  previewUrl,
  mediaType,
  memo,
  statusLabel,
  onOpen,
  onRemove,
  removeLabel,
  isRemoving = false,
}: MediaThumbnailProps) {
  // 動画のサムネイルは PUT に失敗しても本体は再生できるため、画像の読み込み失敗は
  // 添付そのものの失敗として扱わずプレースホルダに落とす。
  const [hasImageError, setHasImageError] = useState(false);
  const showsImage = previewUrl !== null && !hasImageError && !statusLabel;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onOpen}
        disabled={statusLabel !== undefined || onOpen === undefined}
        aria-label={`${mediaType === "video" ? "動画" : "画像"}を開く`}
        className="block w-full overflow-hidden rounded-[10px] bg-sub disabled:cursor-default"
      >
        <span className="flex aspect-square w-full items-center justify-center">
          {showsImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt=""
              onError={() => setHasImageError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="px-2 text-center text-xs text-zinc-400">
              {statusLabel ?? (mediaType === "video" ? "動画" : "画像")}
            </span>
          )}
        </span>
        {statusLabel ? null : (
          <span className="absolute inset-x-0 bottom-0 truncate rounded-b-[10px] bg-black/60 px-2 py-1.5 text-left text-xs font-bold text-white">
            {buildMediaMemoLabel(mediaType, memo)}
          </span>
        )}
      </button>
      {mediaType === "video" && !statusLabel ? (
        <span
          aria-hidden
          className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white"
        >
          ▶
        </span>
      ) : null}
      {onRemove ? (
        <button
          type="button"
          aria-label={removeLabel}
          disabled={isRemoving}
          onClick={onRemove}
          className="absolute -right-2 -top-2 rounded-full bg-zinc-900 p-1 text-white disabled:opacity-50"
        >
          <XMarkIcon className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
