/**
 * 練習プランの3面（練習プランセット / 週の練習プラン / カレンダー）の切り替え。
 *
 * mobile は1画面をセグメントで3面に分けているため、front も新しいルートを面ごとに
 * 増やさず `/practice/plans` の中で切り替えて導線数を揃える。
 * 表示中の面は `?tab=` だけで決まる（状態を持たない）ので、リンク共有・戻る操作でも同じ面が開く。
 */
export type PlanTab = "sets" | "week" | "calendar";

/** 既定の面。mobile のセグメント初期値と同じく「練習プランセット」にする。 */
export const DEFAULT_PLAN_TAB: PlanTab = "sets";

export const PLAN_TABS: ReadonlyArray<{
  key: PlanTab;
  label: string;
  href: string;
}> = [
  { key: "sets", label: "練習プランセット", href: "/practice/plans" },
  { key: "week", label: "週の練習プラン", href: "/practice/plans?tab=week" },
  {
    key: "calendar",
    label: "カレンダー",
    href: "/practice/plans?tab=calendar",
  },
];

/**
 * `?tab=` の値を面へ解決する。
 * 未指定・不正値は既定の面へ倒し、URL の打ち間違いで空白の画面を出さない。
 */
export function parsePlanTab(value: string | undefined): PlanTab {
  if (value === "week") return "week";
  if (value === "calendar") return "calendar";
  return DEFAULT_PLAN_TAB;
}
