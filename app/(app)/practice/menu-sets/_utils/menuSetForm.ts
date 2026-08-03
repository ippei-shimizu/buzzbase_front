import type { MenuSetInput } from "@app/types/menuSet";
import type { PracticeMenu } from "@app/types/practice";
import { MENU_SET_NAME_MAX_LENGTH } from "@app/constants/menuSet";

export interface MenuSetFormValues {
  name: string;
  note: string;
  /** practice_menu_id → 目標量の入力文字列。キーの存在が「選択中」を意味する。 */
  menuAmounts: Record<number, string>;
}

export const NAME_REQUIRED_ERROR = "セット名を入力してください";
export const NAME_TOO_LONG_ERROR = `セット名は${MENU_SET_NAME_MAX_LENGTH}文字以内で入力してください`;

/** 入力欄の文字列を送信値へ変換する。空文字・非数は null（目標量なし）として送る。 */
function toNumberOrNull(value: string | undefined): number | null {
  if (value === undefined || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * 送信用のパラメータを組み立てる。
 *
 * items は差分ではなく毎回すべて送る。back の assign_items が既存の menu_set_items を
 * destroy_all してから作り直すため、部分的に送ると送らなかったメニューが消える。
 * 並び順（back 側の sort_order）は menus の表示順に合わせ、保存のたびに入れ替わらないようにする。
 *
 * @param values フォームの入力値
 * @param menus 選択肢として表示している練習メニュー（この順序が items の並びになる）
 */
export function buildMenuSetInput(
  values: MenuSetFormValues,
  menus: PracticeMenu[],
): MenuSetInput {
  return {
    name: values.name.trim(),
    note: values.note.trim() === "" ? null : values.note.trim(),
    items: menus
      .filter((menu) => menu.id in values.menuAmounts)
      .map((menu) => ({
        practice_menu_id: menu.id,
        target_value: toNumberOrNull(values.menuAmounts[menu.id]),
      })),
  };
}

/** 送信前のクライアント側チェック。back の MenuSet バリデーションと同じ条件を先出しする。 */
export function validateMenuSetInput(input: MenuSetInput): string[] {
  const errors: string[] = [];
  if (input.name === "") errors.push(NAME_REQUIRED_ERROR);
  if (input.name.length > MENU_SET_NAME_MAX_LENGTH) {
    errors.push(NAME_TOO_LONG_ERROR);
  }
  return errors;
}
