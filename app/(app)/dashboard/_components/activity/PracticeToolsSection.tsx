import ClockIcon from "@heroicons/react/24/outline/ClockIcon";
import Link from "next/link";
import {
  PRACTICE_TOOLS_DESCRIPTION,
  PRACTICE_TOOLS_TITLE,
  SHADOW_SWING_LABEL,
} from "./activityCopy";
import SectionCard from "./SectionCard";

/**
 * 練習中に使うツールへの導線。
 * 主記録導線（練習を記録 / 野球ノート）は最上部の RecordButtonsSection に分けている。
 */
export default function PracticeToolsSection() {
  return (
    <SectionCard
      title={PRACTICE_TOOLS_TITLE}
      description={PRACTICE_TOOLS_DESCRIPTION}
    >
      <Link
        href="/practice/shadow-swing"
        className="flex items-center justify-center gap-2 rounded-lg bg-[#d08000] py-3.5 text-[15px] font-bold text-white"
      >
        <ClockIcon className="h-5 w-5 shrink-0" aria-hidden />
        {SHADOW_SWING_LABEL}
      </Link>
    </SectionCard>
  );
}
