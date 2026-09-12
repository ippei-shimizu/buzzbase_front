"use client";

import type { StagedMediaAsset } from "@app/interface/mediaAttachmentV2";
import { SECTION_HEADING } from "./mediaCopy";
import MediaPicker from "./MediaPicker";
import StagedMediaList from "./StagedMediaList";

interface StagedMediaSectionProps {
  assets: StagedMediaAsset[];
  onStage: (asset: StagedMediaAsset) => void;
  onRemove: (localId: string) => void;
  onUpdateMemo: (localId: string, memo: string) => void;
}

/**
 * ノート新規作成中の添付セクション。
 * この時点では baseball_note_id が無く presign できないため、選択したものは
 * ブラウザ側に留め、ノートの保存が成功してからまとめてアップロードする。
 */
export default function StagedMediaSection({
  assets,
  onStage,
  onRemove,
  onUpdateMemo,
}: StagedMediaSectionProps) {
  return (
    <section aria-labelledby="staged-media-heading" className="mt-8">
      <h3
        id="staged-media-heading"
        className="mb-2 text-sm font-bold text-zinc-400"
      >
        {SECTION_HEADING}
      </h3>
      <MediaPicker onStage={onStage} />
      <StagedMediaList
        assets={assets}
        onRemove={onRemove}
        onUpdateMemo={onUpdateMemo}
      />
    </section>
  );
}
