import type { ReactNode } from "react";
import { DetailLinkArrowIcon } from "@app/components/icon/DetailLinkArrowIcon";

interface SettingsItemContentProps {
  icon: ReactNode;
  title: string;
  description?: string;
}

/**
 * 設定項目の行の中身（アイコン・タイトル・説明・右端の矢印）。
 * Link版（SettingsItem）とbutton版（ProPlanSettingsItem等）の両方から共有する。
 */
export default function SettingsItemContent({
  icon,
  title,
  description,
}: SettingsItemContentProps) {
  return (
    <>
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 text-left">
        <span className="block text-sm font-bold text-white">{title}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-zinc-400">
            {description}
          </span>
        ) : null}
      </span>
      <DetailLinkArrowIcon stroke="#71717A" width="18" height="18" />
    </>
  );
}
