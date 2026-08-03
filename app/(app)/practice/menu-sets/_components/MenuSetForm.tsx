"use client";

import type { MenuSet, MenuSetInput } from "@app/types/menuSet";
import type { PracticeMenu } from "@app/types/practice";
import { Button, Input, Textarea } from "@heroui/react";
import Link from "next/link";
import { useState } from "react";
import { MENU_SET_NAME_MAX_LENGTH } from "@app/constants/menuSet";
import { parseDecimal } from "@app/constants/practice";
import { buildMenuSetInput, validateMenuSetInput } from "../_utils/menuSetForm";
import {
  CANCEL_LABEL,
  ITEMS_REPLACED_NOTICE,
  MENUS_EMPTY,
  MENUS_EMPTY_LINK_LABEL,
  MENU_LABEL,
  NAME_LABEL,
  NAME_PLACEHOLDER,
  NOTE_LABEL,
  NOTE_PLACEHOLDER,
  SAVE_LABEL,
  UPDATE_LABEL,
} from "./menuSetCopy";

interface MenuSetFormProps {
  /** 編集対象。null なら新規作成。 */
  menuSet: MenuSet | null;
  menus: PracticeMenu[];
  isSaving: boolean;
  /** 保存に失敗したときに出すサーバー由来のメッセージ。 */
  serverErrors: string[];
  onSubmit: (input: MenuSetInput) => void;
  onCancel: () => void;
}

/** 目標量の表示用文字列。decimal は文字列で届きうるため数値化してから入力欄へ流す。 */
function toAmountText(value: number | string | null | undefined): string {
  const parsed = parseDecimal(value);
  return parsed === null ? "" : String(parsed);
}

/** 編集時の初期選択。既存 items の目標量をそのまま入力欄の初期値にする。 */
function initialMenuAmounts(menuSet: MenuSet | null): Record<number, string> {
  const amounts: Record<number, string> = {};
  menuSet?.items.forEach((item) => {
    amounts[item.practice_menu_id] = toAmountText(item.target_value);
  });
  return amounts;
}

/**
 * メニューセットの作成・編集フォーム。
 *
 * 入力値の保持とクライアント側バリデーションだけを担い、
 * API 呼び出しと画面遷移は呼び出し元（Container）に委ねる。
 * 初期値は props からマウント時に一度だけ組み立てる（useEffect での同期はしない）。
 */
export default function MenuSetForm({
  menuSet,
  menus,
  isSaving,
  serverErrors,
  onSubmit,
  onCancel,
}: MenuSetFormProps) {
  const [name, setName] = useState(menuSet?.name ?? "");
  const [note, setNote] = useState(menuSet?.note ?? "");
  const [menuAmounts, setMenuAmounts] = useState<Record<number, string>>(() =>
    initialMenuAmounts(menuSet),
  );
  const [errors, setErrors] = useState<string[]>([]);

  const toggleMenu = (menu: PracticeMenu) =>
    setMenuAmounts((prev) => {
      if (menu.id in prev) {
        const next = { ...prev };
        delete next[menu.id];
        return next;
      }
      // 初期値は練習メニューの default_value から引き、毎回打ち直さずに済むようにする。
      return { ...prev, [menu.id]: toAmountText(menu.default_value) };
    });

  const changeMenuAmount = (menuId: number, amount: string) =>
    setMenuAmounts((prev) => ({ ...prev, [menuId]: amount }));

  const handleSubmit = () => {
    const input = buildMenuSetInput({ name, note, menuAmounts }, menus);
    const validationErrors = validateMenuSetInput(input);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors([]);
    onSubmit(input);
  };

  const messages = errors.length > 0 ? errors : serverErrors;

  return (
    <div className="flex flex-col gap-6">
      <Input
        type="text"
        variant="bordered"
        label={NAME_LABEL}
        labelPlacement="outside"
        isRequired
        maxLength={MENU_SET_NAME_MAX_LENGTH}
        placeholder={NAME_PLACEHOLDER}
        value={name}
        onChange={(event) => setName(event.target.value)}
      />

      <Textarea
        variant="bordered"
        label={NOTE_LABEL}
        labelPlacement="outside"
        minRows={2}
        placeholder={NOTE_PLACEHOLDER}
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />

      <div>
        <p className="mb-1.5 text-sm text-white">{MENU_LABEL}</p>
        {menus.length === 0 ? (
          <div className="rounded-[10px] bg-sub px-3.5 py-3">
            <p className="text-xs text-zinc-400">{MENUS_EMPTY}</p>
            <Link
              href="/practice/menus"
              className="mt-2 inline-block text-xs font-bold text-[#d08000] underline"
            >
              {MENUS_EMPTY_LINK_LABEL}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-2">
              {menus.map((menu) => {
                const isSelected = menu.id in menuAmounts;
                return (
                  <li
                    key={menu.id}
                    className="rounded-[10px] bg-sub px-3.5 py-3"
                  >
                    <label className="flex items-center gap-2.5 text-sm text-white">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleMenu(menu)}
                        className="h-4 w-4 accent-[#d08000]"
                      />
                      <span>{menu.name}</span>
                    </label>
                    {isSelected ? (
                      <div className="mt-2.5 flex items-center gap-2 pl-6">
                        <input
                          type="number"
                          aria-label={`${menu.name}の目標量`}
                          value={menuAmounts[menu.id] ?? ""}
                          onChange={(event) =>
                            changeMenuAmount(menu.id, event.target.value)
                          }
                          className="w-28 rounded-lg bg-main px-3 py-2 text-sm font-bold text-white"
                        />
                        <span className="text-sm text-zinc-400">
                          {menu.unit_label ?? ""}
                        </span>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs text-zinc-400">
              {ITEMS_REPLACED_NOTICE}
            </p>
          </>
        )}
      </div>

      {messages.length > 0 ? (
        <ul role="alert" className="space-y-1 text-sm text-danger">
          {messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      ) : null}

      <div className="flex gap-3">
        <Button
          variant="flat"
          radius="sm"
          className="flex-1"
          onPress={onCancel}
          isDisabled={isSaving}
        >
          {CANCEL_LABEL}
        </Button>
        <Button
          color="primary"
          radius="sm"
          className="flex-1 font-bold"
          onPress={handleSubmit}
          isDisabled={isSaving}
          isLoading={isSaving}
        >
          {menuSet ? UPDATE_LABEL : SAVE_LABEL}
        </Button>
      </div>
    </div>
  );
}
