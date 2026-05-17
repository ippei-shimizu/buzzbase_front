"use client";

import type { Feature } from "@app/types/pro";
import { useState, type ReactNode } from "react";
import PaywallModal from "@app/components/pro/PaywallModal";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";

interface ProGateProps {
  feature: Feature;
  children: ReactNode;
  /**
   * Pro 未加入時に children の代わりに表示するノード。
   * 未指定の場合は何も表示せず、locked ハンドラを呼んだタイミングで Paywall が開く想定。
   */
  fallback?: ReactNode;
  /**
   * fallback と Paywall モーダル両方を有効化する場合のラッパー。
   * 「タップ時に Paywall を開く」UX を提供するために使う。
   * 未指定の場合、fallback がそのまま表示されるだけ。
   */
  renderLockedTrigger?: (open: () => void) => ReactNode;
}

/**
 * Pro 機能をラップし、Pro 加入時のみ children を表示する。
 * 未加入時は fallback or 何も表示しない、もしくは renderLockedTrigger 経由で
 * クリックすると PaywallModal が立ち上がる構造を提供する。
 */
export default function ProGate({
  feature,
  children,
  fallback,
  renderLockedTrigger,
}: ProGateProps) {
  const { hasEntitlement } = useEntitlement();
  const [isPaywallOpen, setPaywallOpen] = useState(false);

  if (hasEntitlement(feature)) return <>{children}</>;

  return (
    <>
      {renderLockedTrigger
        ? renderLockedTrigger(() => setPaywallOpen(true))
        : (fallback ?? null)}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setPaywallOpen(false)}
        feature={feature}
      />
    </>
  );
}
