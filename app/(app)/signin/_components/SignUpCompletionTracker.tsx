"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@app/lib/analytics";

type Props = {
  triggered: boolean;
};

/**
 * メール認証完了で /signin?account_confirmation_success=true に到達した瞬間に
 * GA4 へ `sign_up` イベントを 1 度だけ送信する計装専用コンポーネント。
 * 既存の signin ページ JSX には一切干渉しない（return null）。
 */
export default function SignUpCompletionTracker({ triggered }: Props) {
  const hasFired = useRef(false);
  useEffect(() => {
    if (!triggered || hasFired.current) return;
    hasFired.current = true;
    trackEvent("sign_up", { method: "email" });
  }, [triggered]);
  return null;
}
