"use client";

import { useSyncExternalStore } from "react";

/** Tailwind の md ブレークポイント未満を「狭い画面（SP）」とみなす。 */
const NARROW_VIEWPORT_QUERY = "(max-width: 767px)";

const mediaQueryList = (): MediaQueryList | null => {
  if (typeof window === "undefined") return null;
  if (typeof window.matchMedia !== "function") return null;
  return window.matchMedia(NARROW_VIEWPORT_QUERY);
};

function subscribe(onStoreChange: () => void): () => void {
  const list = mediaQueryList();
  if (!list?.addEventListener) return () => {};
  list.addEventListener("change", onStoreChange);
  return () => list.removeEventListener("change", onStoreChange);
}

const getSnapshot = (): boolean => mediaQueryList()?.matches ?? false;

// サーバーには画面幅が無い。広い画面として描画しておき、ハイドレーション後に
// 実際の幅で再評価する（狭い側を既定にすると、デスクトップで一瞬 SP 用 UI が見える）。
const getServerSnapshot = (): boolean => false;

/**
 * 画面幅が SP 相当かを購読する。
 * 連続的な px 幅ではなく導出済みの boolean を購読するため、リサイズのたびに
 * 再レンダリングされるのはブレークポイントをまたいだ瞬間だけになる。
 */
export function useIsNarrowViewport(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
