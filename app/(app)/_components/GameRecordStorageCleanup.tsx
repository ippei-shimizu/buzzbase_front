"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  clearGameRecordStorage,
  isGameRecordFlowPath,
} from "@app/utils/gameRecordStorage";

/**
 * 記録フローの外へ遷移したタイミングで、フローが残した localStorage を破棄する。
 * ブラウザバックやナビゲーションメニュー経由の離脱も拾えるよう、
 * フロー側ではなくアプリ全体のレイアウトで監視する。
 */
export default function GameRecordStorageCleanup() {
  const pathname = usePathname();

  useEffect(() => {
    if (isGameRecordFlowPath(pathname)) return;
    clearGameRecordStorage();
  }, [pathname]);

  return null;
}
