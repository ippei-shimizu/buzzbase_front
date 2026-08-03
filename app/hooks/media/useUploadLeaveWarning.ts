"use client";

import { useEffect } from "react";
import { LEAVE_WARNING_MESSAGE } from "@app/components/note/media/mediaCopy";

/**
 * アップロード中のタブ離脱・リロードを確認ダイアログで引き止める。
 *
 * 中断すると R2 への PUT が途中で切れ、back には pending のまま残る。
 * `isUploading` が false に戻ったら必ずリスナーを外す。完了後も警告し続けると
 * 「保存できたのに離れられない」誤解を与えるため。
 */
export function useUploadLeaveWarning(isUploading: boolean): void {
  useEffect(() => {
    if (!isUploading) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // 旧仕様のブラウザ向け。現行ブラウザは既定文言に置き換えるため表示はされない。
      event.returnValue = LEAVE_WARNING_MESSAGE;
      return LEAVE_WARNING_MESSAGE;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isUploading]);
}
