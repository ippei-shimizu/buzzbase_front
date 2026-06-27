"use client";

import type { ReactNode } from "react";
import { useProUpgradeModal } from "@app/contexts/proUpgradeModalContext";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import { PRO_FEATURES, type Feature, type ProFeature } from "@app/types/pro";

interface ProGateProps {
  feature: Feature;
  children: ReactNode;
  /**
   * Pro 未加入時に children の代わりに表示する静的ノード。
   * renderLockedTrigger と排他で使う想定（同時指定なら renderLockedTrigger を優先）。
   */
  fallback?: ReactNode;
  /**
   * タップで Pro 加入モーダルを開けるロックトリガーをレンダリングする関数。
   * モーダルは ProUpgradeModalProvider 側で常設されているため、ここでは open 関数だけ渡す。
   */
  renderLockedTrigger?: (open: () => void) => ReactNode;
}

// PRO_FEATURES（readonly tuple）に含まれる場合だけ ProFeature として trigger 用に渡せる。
function asProFeatureOrUndefined(feature: Feature): ProFeature | undefined {
  return (PRO_FEATURES as readonly string[]).includes(feature)
    ? (feature as ProFeature)
    : undefined;
}

/**
 * Pro 機能をラップし、entitlement を持つときのみ children を表示する。
 * 未許可時の代替表示は renderLockedTrigger / fallback / なし の3パターン。
 */
export default function ProGate({
  feature,
  children,
  fallback,
  renderLockedTrigger,
}: ProGateProps) {
  const { hasEntitlement } = useEntitlement();
  const { open } = useProUpgradeModal();

  if (hasEntitlement(feature)) return <>{children}</>;

  if (renderLockedTrigger) {
    return (
      <>
        {renderLockedTrigger(() =>
          open({ trigger: asProFeatureOrUndefined(feature) }),
        )}
      </>
    );
  }

  return <>{fallback ?? null}</>;
}
