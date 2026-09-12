import type { MenuSet, MenuSetItem } from "@app/types/menuSet";
import { formatPracticeValue } from "@app/constants/practice";
import { UNKNOWN_MENU_NAME } from "../menu-sets/_components/menuSetCopy";

/** セット内メニューの表示名。メニューが削除されていると serializer が null を返す。 */
function itemName(item: MenuSetItem): string {
  return item.name ?? UNKNOWN_MENU_NAME;
}

/**
 * 一覧でセットの中身を一行に要約する。
 * 目標量まで並べると行が読めなくなるため、名前だけを「/」で連ねる。
 *
 * @returns 「素振り / ティー / ランニング」形式。メニュー未設定なら空文字。
 */
export function menuNamesText(menuSet: MenuSet): string {
  return menuSet.items.map(itemName).join(" / ");
}

/**
 * 詳細でセット内メニューを1行に整形する。
 *
 * @returns 「素振り 200本」形式。目標量が未設定ならメニュー名のみ。
 */
export function formatMenuSetItem(item: MenuSetItem): string {
  // target_value は float カラムだが、back の decimal 同様に文字列で届く可能性があるため
  // formatPracticeValue（内部で parseDecimal）を通して数値化してから表示する。
  const value = formatPracticeValue({
    amount: item.target_value,
    weight: null,
    unit_label: item.unit_label,
  });
  const name = itemName(item);
  return value === "" ? name : `${name} ${value}`;
}
