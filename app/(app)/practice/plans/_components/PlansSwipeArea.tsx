"use client";

import type { PlanTab } from "../_utils/planTab";
import { useRouter } from "next/navigation";
import { useHorizontalSwipe } from "@app/hooks/useHorizontalSwipe";
import { PLAN_TABS } from "../_utils/planTab";

interface PlansSwipeAreaProps {
  active: PlanTab;
  children: React.ReactNode;
}

/** 横スワイプで隣のタブへ送る領域。タブバーだけでなく本文の上でも効かせる。 */
export default function PlansSwipeArea({
  active,
  children,
}: PlansSwipeAreaProps) {
  const router = useRouter();
  const activeIndex = PLAN_TABS.findIndex((tab) => tab.key === active);

  const swipeHandlers = useHorizontalSwipe((direction) => {
    const nextIndex =
      direction === "left"
        ? Math.min(activeIndex + 1, PLAN_TABS.length - 1)
        : Math.max(activeIndex - 1, 0);
    if (nextIndex === activeIndex) return;
    router.push(PLAN_TABS[nextIndex].href);
  });

  return <div {...swipeHandlers}>{children}</div>;
}
