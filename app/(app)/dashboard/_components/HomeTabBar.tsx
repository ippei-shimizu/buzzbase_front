import type { HomeTab } from "../_utils/homeTab";
import Link from "next/link";
import { HOME_TABS } from "../_utils/homeTab";

interface HomeTabBarProps {
  active: HomeTab;
}

/**
 * ホームの2面（練習・活動 / ダッシュボード）の切り替え。
 * 状態ではなくリンクで切り替え、URL（`?tab=`）だけで表示中の面が決まるようにする。
 */
export default function HomeTabBar({ active }: HomeTabBarProps) {
  return (
    <nav className="flex border-b border-zinc-700">
      {HOME_TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={tab.key === active ? "page" : undefined}
          className={`flex-1 border-b-2 pb-2.5 text-center text-sm font-bold transition-colors ${
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
