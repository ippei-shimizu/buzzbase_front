"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  clearStaleGameRecordStorage,
  isGameRecordFlowPath,
} from "@app/utils/gameRecordStorage";

/**
 * 記録フローの外へ遷移したタイミングで、フローが残した localStorage を掃除する。
 * ブラウザバックやナビゲーションメニュー経由の離脱も拾えるよう、
 * フロー側ではなくアプリ全体のレイアウトで監視する。
 *
 * 記録中の試合そのもの（gameResultId）は残す。ボトムナビは記録フロー中も
 * 表示されており、1タップの離脱で記録中の試合を見失うと、戻ってきたときに
 * 空の試合が作り直されて孤児レコードが増えるため。
 */
export default function GameRecordStorageCleanup() {
  const pathname = usePathname();

  useEffect(() => {
    // パス未確定の間はフロー内かどうか判定できないので何もしない。
    if (!pathname) return;
    if (isGameRecordFlowPath(pathname)) return;
    clearStaleGameRecordStorage();
  }, [pathname]);

  return null;
}
