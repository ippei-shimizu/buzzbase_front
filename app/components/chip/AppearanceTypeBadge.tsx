import type { AppearanceType } from "@app/interface";
import { Chip } from "@heroui/react";
import { getAppearanceTypeBadgeLabel } from "@app/constants/appearanceType";

// 試合一覧・サマリー・詳細で先発以外の出場区分（代打・代走・途中出場）を強調表示するバッジ。
// 強調対象でないとき（先発・未出場・未指定）は何もレンダリングしない。
export default function AppearanceTypeBadge({
  appearanceType,
}: {
  appearanceType?: AppearanceType | null;
}) {
  const label = getAppearanceTypeBadgeLabel(appearanceType);
  if (!label) return null;
  return (
    <Chip
      variant="faded"
      classNames={{
        base: "border-small border-zinc-500 px-2",
        content: "text-blue-300 text-xs",
      }}
    >
      {label}
    </Chip>
  );
}
