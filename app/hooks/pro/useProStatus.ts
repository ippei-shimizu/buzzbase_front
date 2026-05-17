"use client";

import { useContext } from "react";
import { ProStatusContext } from "@app/components/pro/ProStatusProvider";
import { DEFAULT_PRO_STATUS, type ProStatus } from "@app/types/pro";

interface UseProStatusReturn {
  proStatus: ProStatus;
  isPro: boolean;
  isRefreshing: boolean;
  refresh: () => void;
}

/**
 * Pro 状態を取得する。ProStatusProvider 配下では実際の状態を、
 * Provider が無いコンポーネント階層では DEFAULT_PRO_STATUS（無料状態）を返す。
 */
export function useProStatus(): UseProStatusReturn {
  const ctx = useContext(ProStatusContext);

  if (!ctx) {
    return {
      proStatus: DEFAULT_PRO_STATUS,
      isPro: false,
      isRefreshing: false,
      refresh: () => {},
    };
  }

  const { proStatus, isRefreshing, refresh } = ctx;
  const isPro = ["trial", "active", "cancelled", "billing_issue"].includes(
    proStatus.subscription.status,
  );

  return { proStatus, isPro, isRefreshing, refresh };
}
