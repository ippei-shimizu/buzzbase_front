import type { ComponentType, SVGProps } from "react";
import ChevronRightIcon from "@heroicons/react/24/outline/ChevronRightIcon";
import FlagIcon from "@heroicons/react/24/outline/FlagIcon";
import ChartBarIcon from "@heroicons/react/24/outline/ChartBarIcon";
import SparklesIcon from "@heroicons/react/24/outline/SparklesIcon";
import TrophyIcon from "@heroicons/react/24/outline/TrophyIcon";
import Link from "next/link";
import { TOOLS_SECTION_TITLE } from "./activityCopy";
import SectionCard from "./SectionCard";

interface Tool {
  href: string;
  label: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

/**
 * 上達サイクルを回すための機能への導線。
 * mobile と同じ並び（課題 → 目標 → 練習と成績のつながり → 振り返り）にする。
 */
const TOOLS: ReadonlyArray<Tool> = [
  {
    href: "/themes",
    label: "取り組む課題",
    description: "課題を決めて練習を積み重ねる",
    icon: FlagIcon,
  },
  {
    href: "/goals",
    label: "目標を立てる",
    description: "目標を決めて達成状況を追う",
    icon: TrophyIcon,
  },
  {
    href: "/insights",
    label: "練習と成績のつながり",
    description: "やったことと成績の傾向を見る",
    icon: ChartBarIcon,
  },
  {
    href: "/review",
    label: "振り返りレポート",
    description: "週次・月次のまとめ",
    icon: SparklesIcon,
  },
];

/** 上達サイクル機能への導線をまとめたセクション。 */
export default function ImprovementToolsSection() {
  return (
    <SectionCard title={TOOLS_SECTION_TITLE}>
      <ul className="divide-y divide-main">
        {TOOLS.map((tool) => (
          <li key={tool.href}>
            <Link href={tool.href} className="flex items-center gap-3 py-3">
              <tool.icon
                className="h-5 w-5 shrink-0 text-[#d08000]"
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-white">
                  {tool.label}
                </span>
                <span className="mt-0.5 block text-xs text-zinc-400">
                  {tool.description}
                </span>
              </span>
              <ChevronRightIcon
                className="h-4 w-4 shrink-0 text-zinc-400"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
