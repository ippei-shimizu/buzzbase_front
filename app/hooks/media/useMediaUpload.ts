"use client";

import type { PrepareMediaResult } from "@app/utils/media/prepareMedia";
import type { UploadPhase } from "@app/utils/media/uploadPhase";
import type {
  MediaUploadResult,
  PreparedMedia,
} from "@app/utils/media/uploadPipeline";
import { useCallback, useRef, useState } from "react";
import { useUploadLeaveWarning } from "@app/hooks/media/useUploadLeaveWarning";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import { prepareMediaFile } from "@app/utils/media/prepareMedia";
import { uploadPreparedMedia } from "@app/utils/media/uploadPipeline";

export interface MediaUploadProgress {
  completed: number;
  total: number;
}

interface UseMediaUploadReturn {
  phase: UploadPhase;
  progress: MediaUploadProgress;
  isBusy: boolean;
  /** 上限の表示を出し分けるための entitlement 判定。可否の判断には使わない。 */
  hasUnlimitedUploads: boolean;
  /** 選択直後の圧縮・サムネイル生成・上限チェック。 */
  prepare: (file: File) => Promise<PrepareMediaResult>;
  /** 1件アップロードする。 */
  upload: (
    prepared: PreparedMedia,
    baseballNoteId: number,
  ) => Promise<MediaUploadResult>;
  /** 複数件を順にアップロードする。中断されたら残りも中断として返す。 */
  uploadAll: (
    items: PreparedMedia[],
    baseballNoteId: number,
  ) => Promise<MediaUploadResult[]>;
  cancel: () => void;
  reset: () => void;
}

const BUSY_PHASES: UploadPhase[] = ["compressing", "uploading", "finalizing"];

/**
 * 画像・動画のアップロード進行（圧縮 → アップロード → 仕上げ）を1箇所で持つフック。
 *
 * 進捗はバイト単位では出さない。fetch の PUT は送信バイト数を通知しないため、
 * フェーズと「何件目か」で進行を表す。
 * アップロード中はページ離脱の警告を張り、終わったら必ず外す。
 */
export function useMediaUpload(): UseMediaUploadReturn {
  const { hasEntitlement } = useEntitlement();
  const isPro = hasEntitlement("unlimited_media_uploads");
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [progress, setProgress] = useState<MediaUploadProgress>({
    completed: 0,
    total: 0,
  });
  const abortRef = useRef<AbortController | null>(null);

  const isBusy = BUSY_PHASES.includes(phase);
  useUploadLeaveWarning(isBusy);

  const prepare = useCallback(
    async (file: File): Promise<PrepareMediaResult> => {
      // 圧縮中に cancel() が押されたら実際に中断できるよう、uploadAll と同様に
      // abortRef へ積む（動画リサイズは mediabunny の Conversion#cancel() に橋渡しする）。
      const controller = new AbortController();
      abortRef.current = controller;
      setPhase("compressing");
      const result = await prepareMediaFile(file, isPro, {
        signal: controller.signal,
      });
      abortRef.current = null;
      setPhase(result.ok ? "idle" : "error");
      return result;
    },
    [isPro],
  );

  const uploadAll = useCallback(
    async (
      items: PreparedMedia[],
      baseballNoteId: number,
    ): Promise<MediaUploadResult[]> => {
      const controller = new AbortController();
      abortRef.current = controller;
      setProgress({ completed: 0, total: items.length });
      // pipeline からのフェーズ通知を待たずに「実行中」にする。
      // 待つと通知が来るまでの間だけ離脱警告が外れてしまう。
      setPhase("uploading");

      const results: MediaUploadResult[] = [];
      for (const item of items) {
        const result = await uploadPreparedMedia(item, baseballNoteId, {
          signal: controller.signal,
          onPhase: setPhase,
        });
        results.push(result);
        setProgress((prev) => ({ ...prev, completed: prev.completed + 1 }));

        if (!result.ok && result.reason === "canceled") {
          // 中断は「残り全部やめる」意思表示として扱う。1件ずつ聞き直さない。
          while (results.length < items.length) {
            results.push({ ok: false, reason: "canceled" });
          }
          break;
        }
      }

      abortRef.current = null;
      setPhase(results.every((result) => result.ok) ? "done" : "error");
      return results;
    },
    [],
  );

  const upload = useCallback(
    async (prepared: PreparedMedia, baseballNoteId: number) => {
      const [result] = await uploadAll([prepared], baseballNoteId);
      return result;
    },
    [uploadAll],
  );

  const cancel = useCallback(() => abortRef.current?.abort(), []);

  const reset = useCallback(() => {
    setPhase("idle");
    setProgress({ completed: 0, total: 0 });
  }, []);

  return {
    phase,
    progress,
    isBusy,
    hasUnlimitedUploads: isPro,
    prepare,
    upload,
    uploadAll,
    cancel,
    reset,
  };
}
