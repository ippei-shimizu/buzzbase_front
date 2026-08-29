import type { FeatureAvailability } from "./proFeatureCatalog";
import { APP_ONLY_LABEL } from "./proFeatureCatalog";

/**
 * Web では未提供でアプリ版でのみ使える機能に添えるバッジ。
 * web_and_app の機能では何も描画しないので、呼び出し側は分岐を持たずに置ける。
 */
export default function AvailabilityBadge({
  availability,
}: {
  availability: FeatureAvailability;
}) {
  if (availability === "web_and_app") return null;

  return (
    <span className="shrink-0 rounded-full border border-gray-500 px-1.5 py-px text-[10px] font-bold leading-4 text-gray-400">
      {APP_ONLY_LABEL}
    </span>
  );
}
