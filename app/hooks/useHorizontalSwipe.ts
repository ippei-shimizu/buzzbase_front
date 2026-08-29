"use client";

import { useRef } from "react";

/** このピクセル未満の横移動はタップ・縦スクロールの巻き添えとみなして無視する。 */
const SWIPE_THRESHOLD_PX = 48;

interface HorizontalSwipeHandlers {
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
}

/**
 * 横スワイプで前後を送るためのタッチハンドラを返す。
 *
 * @param onSwipe 送る向き。left は次（右から左へ払う操作）、right は前。
 */
export function useHorizontalSwipe(
  onSwipe: (direction: "left" | "right") => void,
): HorizontalSwipeHandlers {
  const touchStartXRef = useRef<number | null>(null);

  return {
    onTouchStart: (event) => {
      touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
    },
    onTouchEnd: (event) => {
      const startX = touchStartXRef.current;
      touchStartXRef.current = null;
      if (startX === null) return;

      const deltaX = (event.changedTouches[0]?.clientX ?? startX) - startX;
      if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;

      onSwipe(deltaX < 0 ? "left" : "right");
    },
  };
}
