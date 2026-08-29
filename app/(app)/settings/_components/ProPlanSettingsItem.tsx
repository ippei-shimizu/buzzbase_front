"use client";

import { CrownIcon } from "@app/components/icon/CrownIcon";
import { useProUpgradeModal } from "@app/contexts/proUpgradeModalContext";
import SettingsItemContent from "./SettingsItemContent";

/**
 * front には mobile の `/pro` に相当する常設ページが無く、Pro訴求は
 * ProUpgradeModal に一本化されているため、Linkではなくモーダルを開くボタンにする。
 */
export default function ProPlanSettingsItem() {
  const { open } = useProUpgradeModal();

  return (
    <li>
      <button
        type="button"
        onClick={() => open()}
        className="flex w-full items-center gap-3 px-4 py-3.5"
      >
        <SettingsItemContent
          icon={<CrownIcon fill="#d08000" width="20" height="20" />}
          title="Proプランを見る"
          description="全機能が使い放題になるProプランの詳細を確認"
        />
      </button>
    </li>
  );
}
