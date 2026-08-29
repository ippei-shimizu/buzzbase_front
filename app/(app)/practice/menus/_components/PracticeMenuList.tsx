import type { PracticeMenu } from "@app/types/practice";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import {
  PRACTICE_CATEGORIES,
  PRACTICE_CATEGORY_ICONS,
  parseDecimal,
  unitLabel,
} from "@app/constants/practice";
import { EMPTY_MESSAGE } from "./practiceMenuCopy";

interface PracticeMenuListProps {
  menus: PracticeMenu[];
  onEdit: (menu: PracticeMenu) => void;
  onDelete: (menu: PracticeMenu) => void;
}

/**
 * メニュー行に出す補足。「回数 ・ 初期値 200本」のように計測タイプと初期値を並べる。
 * default_value は back から文字列 decimal（"200.0"）で来るため、数値化してから表示する。
 */
function menuSummary(menu: PracticeMenu): string {
  const defaultValue = parseDecimal(menu.default_value);
  const label = unitLabel(menu.unit);
  if (defaultValue === null) return label;
  return `${label} ・ 初期値 ${defaultValue}${menu.unit_label ?? ""}`;
}

/**
 * 練習メニューをカテゴリ別にグルーピングして並べる表示コンポーネント。
 * 並び順は PRACTICE_CATEGORIES（back の CATEGORIES と同順）に従い、
 * メニューが1件も無いカテゴリは見出しごと出さない。
 */
export default function PracticeMenuList({
  menus,
  onEdit,
  onDelete,
}: PracticeMenuListProps) {
  if (menus.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-400">{EMPTY_MESSAGE}</p>
    );
  }

  return (
    <div className="space-y-6">
      {PRACTICE_CATEGORIES.map((category) => {
        const inCategory = menus.filter(
          (menu) => menu.category === category.key,
        );
        if (inCategory.length === 0) return null;
        const CategoryIcon = PRACTICE_CATEGORY_ICONS[category.key];

        return (
          <section
            key={category.key}
            aria-labelledby={`practice-menu-group-${category.key}`}
          >
            <h3
              id={`practice-menu-group-${category.key}`}
              className="flex items-center gap-1.5 text-sm font-bold text-zinc-400"
            >
              <CategoryIcon
                className="h-4 w-4 shrink-0 text-[#d08000]"
                aria-hidden
              />
              {category.label}
            </h3>
            <ul className="mt-2 space-y-2">
              {inCategory.map((menu) => (
                <li
                  key={menu.id}
                  className="flex items-center gap-3 rounded-[10px] bg-sub px-3.5 py-3"
                >
                  <button
                    type="button"
                    onClick={() => onEdit(menu)}
                    aria-label={`${menu.name}を編集`}
                    className="flex-1 text-left"
                  >
                    <span className="block text-sm font-bold text-white">
                      {menu.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-400">
                      {menuSummary(menu)}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(menu)}
                    aria-label={`${menu.name}を削除`}
                    className="shrink-0 rounded-full p-1 text-zinc-400 transition-colors hover:text-danger"
                  >
                    <TrashIcon className="h-5 w-5" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
