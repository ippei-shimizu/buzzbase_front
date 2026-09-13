"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useProUpgradeModal } from "@app/contexts/proUpgradeModalContext";
import { trackFreeLimitReached } from "@app/utils/analytics";
import { GROUP_FREE_LIMIT_MESSAGE } from "@app/utils/pro/groupLimit";

/**
 * グループの無料枠上限に当たったときの扱い（計測 + 理由の提示 + Pro 訴求）をまとめたフック。
 *
 * 上限に当たる経路が作成・招待リンク参加・招待の承諾と複数あり、どれか一つで
 * 計測や訴求が抜けると課金ファネルの母数が欠ける。経路ごとに書き写さず、
 * ここ一箇所を呼ばせることで揃える。
 *
 * @returns 上限到達時に呼ぶ関数
 */
export function useGroupLimitPaywall(): () => void {
  const { open: openProUpgradeModal } = useProUpgradeModal();

  return useCallback(() => {
    trackFreeLimitReached("unlimited_groups");
    toast.error(GROUP_FREE_LIMIT_MESSAGE);
    openProUpgradeModal({ trigger: "unlimited_groups" });
  }, [openProUpgradeModal]);
}
