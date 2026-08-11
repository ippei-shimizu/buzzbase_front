import type { MenuSet } from "@app/types/menuSet";
import ChevronRightIcon from "@heroicons/react/24/outline/ChevronRightIcon";
import Link from "next/link";
import { menuNamesText } from "../../_utils/menuSetDisplay";
import { EMPTY_MESSAGE, ITEMS_EMPTY } from "./menuSetCopy";

interface MenuSetListProps {
  menuSets: MenuSet[];
}

/**
 * メニューセットを一覧表示する。
 * 中身は名前だけを「/」で連ねて 1 行に収め、詳細で目標量まで確認させる。
 */
export default function MenuSetList({ menuSets }: MenuSetListProps) {
  if (menuSets.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-400">{EMPTY_MESSAGE}</p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {menuSets.map((menuSet) => {
        const names = menuNamesText(menuSet);
        return (
          <li key={menuSet.id}>
            <Link
              href={`/practice/menu-sets/${menuSet.id}`}
              className="flex items-center gap-3 rounded-[10px] bg-sub px-3.5 py-3 transition-opacity hover:opacity-80"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-white">
                  {menuSet.name}
                </span>
                <span className="mt-0.5 block truncate text-xs text-zinc-400">
                  {names === "" ? ITEMS_EMPTY : names}
                </span>
              </span>
              <ChevronRightIcon
                className="h-4 w-4 shrink-0 text-zinc-400"
                aria-hidden
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
