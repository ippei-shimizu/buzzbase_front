"use client";

import type { MediaViewerContent } from "./MediaViewer";
import type { StagedMediaAsset } from "@app/interface/mediaAttachmentV2";
import { useState } from "react";
import { STAGED_HEADING } from "./mediaCopy";
import MediaThumbnail from "./MediaThumbnail";
import MediaViewer from "./MediaViewer";

interface StagedMediaListProps {
  assets: StagedMediaAsset[];
  onRemove: (localId: string) => void;
  onUpdateMemo: (localId: string, memo: string) => void;
}

/**
 * ノート新規作成中に選択済みで、まだアップロードしていないメディアの一覧。
 * メモはローカルに保持し、保存後のアップロードで完了通知と一緒に送る。
 */
export default function StagedMediaList({
  assets,
  onRemove,
  onUpdateMemo,
}: StagedMediaListProps) {
  const [viewingId, setViewingId] = useState<string | null>(null);

  if (assets.length === 0) return null;

  const viewing = assets.find((asset) => asset.localId === viewingId) ?? null;
  const viewerContent: MediaViewerContent | null = viewing
    ? {
        key: `${viewing.localId}-${viewing.memo}`,
        mediaType: viewing.mediaType,
        // 動画は再生用 URL を渡す。previewUrl はサムネイル画像なので video 要素では再生できない。
        url: viewing.playbackUrl ?? viewing.previewUrl,
        memo: viewing.memo,
      }
    : null;

  return (
    <div className="mt-3">
      <p className="text-xs text-zinc-400">{STAGED_HEADING}</p>
      <ul className="mt-2 grid grid-cols-3 gap-3">
        {assets.map((asset) => (
          <li key={asset.localId}>
            <MediaThumbnail
              previewUrl={asset.previewUrl}
              mediaType={asset.mediaType}
              memo={asset.memo}
              onOpen={() => setViewingId(asset.localId)}
              onRemove={() => onRemove(asset.localId)}
              removeLabel="選択した画像・動画を取り消す"
            />
          </li>
        ))}
      </ul>

      <MediaViewer
        content={viewerContent}
        onClose={() => setViewingId(null)}
        editableMemo
        onSaveMemo={(memo) => {
          if (!viewing) return;
          onUpdateMemo(viewing.localId, memo);
          setViewingId(null);
        }}
      />
    </div>
  );
}
