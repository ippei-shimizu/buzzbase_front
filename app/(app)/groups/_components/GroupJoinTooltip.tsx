"use client";

import { useEffect, useState } from "react";
import { useGroupJoinTooltip } from "@app/hooks/onboarding/useGroupJoinTooltip";

/**
 * グループ未参加のユーザーに、招待コードでの参加を初回訪問時だけ案内する。
 * localStorage 依存のためクライアントコンポーネント。
 */
export default function GroupJoinTooltip() {
  const { hasShown, markShown } = useGroupJoinTooltip();
  const [isDismissed, setIsDismissed] = useState(false);

  // 表示した時点で「案内済み」を永続化する。閉じずに離脱しても次回訪問では出さない。
  useEffect(() => {
    if (hasShown === false) markShown();
  }, [hasShown, markShown]);

  if (hasShown !== false || isDismissed) return null;

  return (
    <div className="flex items-center gap-x-2 mt-4 px-4 py-2.5 rounded-lg border border-[#d08000] bg-[#3a2e1a]">
      <p className="flex-1 text-sm leading-5 text-white">
        チームメイトから招待コードをもらって参加しよう
      </p>
      <button
        type="button"
        aria-label="ヒントを閉じる"
        onClick={() => setIsDismissed(true)}
        className="shrink-0 p-1 text-zinc-400 text-sm leading-none"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  );
}
