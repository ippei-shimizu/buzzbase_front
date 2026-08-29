import Link from "next/link";
import { NOTE_TAB_LABEL, PRACTICE_TAB_LABEL } from "./practiceRecordsCopy";

export type RecordsTab = "practice" | "note";

interface RecordsTabBarProps {
  active: RecordsTab;
}

const TABS: ReadonlyArray<{ key: RecordsTab; label: string; href: string }> = [
  {
    key: "practice",
    label: PRACTICE_TAB_LABEL,
    href: "/practice/records",
  },
  {
    key: "note",
    label: NOTE_TAB_LABEL,
    href: "/practice/records?tab=note",
  },
];

/**
 * 練習記録 / 野球ノートの切り替え。
 * 状態ではなくリンクで切り替え、URL（`?tab=`）だけで表示中のタブが決まるようにする。
 */
export default function RecordsTabBar({ active }: RecordsTabBarProps) {
  return (
    <nav className="flex border-b border-zinc-700">
      {TABS.map((tab) => (
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
