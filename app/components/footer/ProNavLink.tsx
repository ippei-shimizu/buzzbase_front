"use client";

import Link from "next/link";
import { useFeatureFlag } from "@app/hooks/featureFlags/useFeatureFlag";

/**
 * Pro LP へのナビゲーション導線。
 * pro_features が有効と確定したときだけ描画する。未確定のまま出すと、kill switch が
 * 落ちている環境で一瞬だけ導線が見え、リンク先の /pro からは弾かれることになる。
 */
export default function ProNavLink() {
  const { enabled } = useFeatureFlag("pro_features");

  return enabled ? (
    <li>
      <Link href="/pro" className="text-sm">
        BUZZ BASE Pro
      </Link>
    </li>
  ) : null;
}
