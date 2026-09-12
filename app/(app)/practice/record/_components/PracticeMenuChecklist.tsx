"use client";

import type { PracticeMenu } from "@app/types/practice";
import { Checkbox, Input } from "@heroui/react";
import {
  PRACTICE_CATEGORIES,
  PRACTICE_CATEGORY_ICONS,
  isWeightReps,
} from "@app/constants/practice";

interface PracticeMenuChecklistProps {
  menus: PracticeMenu[];
  /** 選択中メニューの量（menu_id → 入力文字列）。キーの有無が選択状態を表す。 */
  amounts: Record<number, string>;
  /** 筋トレメニューの重さ（menu_id → 入力文字列）。 */
  weights: Record<number, string>;
  onToggle: (menu: PracticeMenu) => void;
  onAmountChange: (menuId: number, value: string) => void;
  onWeightChange: (menuId: number, value: string) => void;
}

const NUMBER_INPUT_CLASS = "w-24";

/** 量の入力欄のラベル。重さ×回数のメニューだけ「回数」と呼び分ける。 */
function amountLabel(menu: PracticeMenu): string {
  return isWeightReps(menu.unit) ? `${menu.name}の回数` : `${menu.name}の量`;
}

/**
 * 練習メニューをカテゴリ別に並べ、選択と量の入力を受け持つ表示コンポーネント。
 * 並び順は PRACTICE_CATEGORIES（back の CATEGORIES と同順）に従い、
 * メニューが1件も無いカテゴリは見出しごと出さない。
 */
export default function PracticeMenuChecklist({
  menus,
  amounts,
  weights,
  onToggle,
  onAmountChange,
  onWeightChange,
}: PracticeMenuChecklistProps) {
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
            aria-labelledby={`practice-record-group-${category.key}`}
          >
            <h3
              id={`practice-record-group-${category.key}`}
              className="flex items-center gap-1.5 text-sm font-bold text-zinc-400"
            >
              <CategoryIcon
                className="h-4 w-4 shrink-0 text-[#d08000]"
                aria-hidden
              />
              {category.label}
            </h3>
            <ul className="mt-2 space-y-2">
              {inCategory.map((menu) => {
                const isSelected = menu.id in amounts;

                return (
                  <li
                    key={menu.id}
                    className="cursor-pointer rounded-[10px] bg-sub px-3.5 py-3"
                    onClick={() => onToggle(menu)}
                  >
                    {/* Checkbox 自体のクリックは onValueChange 側で処理するため、li への伝播を止めて二重トグルを防ぐ。 */}
                    <div onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        isSelected={isSelected}
                        onValueChange={() => onToggle(menu)}
                        classNames={{
                          label: "text-sm font-bold text-white",
                          // 未選択時の枠線がデフォルトの default カラーだと bg-sub と同化して見えないため明るくする。
                          wrapper: "before:border-zinc-400",
                        }}
                      >
                        {menu.name}
                      </Checkbox>
                    </div>
                    {isSelected ? (
                      <div
                        className="mt-2.5 flex items-center gap-2 pl-8"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {isWeightReps(menu.unit) ? (
                          <>
                            <Input
                              type="number"
                              inputMode="decimal"
                              size="sm"
                              radius="sm"
                              className={NUMBER_INPUT_CLASS}
                              aria-label={`${menu.name}の重さ（kg）`}
                              placeholder="0"
                              value={weights[menu.id] ?? ""}
                              onChange={(event) =>
                                onWeightChange(menu.id, event.target.value)
                              }
                            />
                            <span className="text-sm text-zinc-400">kg ×</span>
                          </>
                        ) : null}
                        <Input
                          type="number"
                          inputMode="decimal"
                          size="sm"
                          radius="sm"
                          className={NUMBER_INPUT_CLASS}
                          aria-label={amountLabel(menu)}
                          placeholder="0"
                          value={amounts[menu.id] ?? ""}
                          onChange={(event) =>
                            onAmountChange(menu.id, event.target.value)
                          }
                        />
                        <span className="text-sm text-zinc-400">
                          {isWeightReps(menu.unit)
                            ? "回"
                            : (menu.unit_label ?? "")}
                        </span>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
