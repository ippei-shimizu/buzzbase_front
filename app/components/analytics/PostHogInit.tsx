"use client";

import { useEffect } from "react";
import { initPostHog } from "@app/utils/posthog";

/**
 * PostHog をハイドレーション後に 1 度だけ初期化する計装専用コンポーネント。
 * DOM を持たないため、描画やレイアウトには一切影響しない。
 */
export default function PostHogInit() {
  useEffect(() => {
    initPostHog();
  }, []);
  return null;
}
