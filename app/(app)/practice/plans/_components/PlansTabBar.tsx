import type { PlanTab } from "../_utils/planTab";
import Link from "next/link";
import { PLAN_TABS } from "../_utils/planTab";

interface PlansTabBarProps {
  active: PlanTab;
}

/**
 * 練習プランの3面の切り替え。
 * 状態ではなくリンクで切り替え、URL（`?tab=`）だけで表示中の面が決まるようにする。
 */
export default function PlansTabBar({ active }: PlansTabBarProps) {
  return (
    <nav className="flex border-b border-zinc-700">
      {PLAN_TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={tab.key === active ? "page" : undefined}
          className={`flex-1 border-b-2 py-3 text-center text-sm font-bold transition-colors ${
            tab.key === active
              ? "border-[#d08000] text-[#d08000]"
              : "border-transparent text-zinc-400"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
