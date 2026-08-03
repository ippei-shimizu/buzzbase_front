/**
 * ホームの2面（練習・活動 / ダッシュボード）の切り替え。
 *
 * mobile のホームタブは1つのタブの中をセグメントで2面に分けており、front も
 * 新しいルートを足さずに `/dashboard` の中で切り替えて同じ導線数に揃える。
 * 表示中の面は `?tab=` だけで決まる（状態を持たない）ので、リンク共有・戻る操作でも同じ面が開く。
 */
export type HomeTab = "activity" | "dashboard";

/**
 * 既定の面。mobile のセグメント初期値と同じく「練習・活動」にする。
 * 毎日の継続ループ（記録 → 今日やる → 積み上げ → 振り返り）の起点になる面のため。
 */
export const DEFAULT_HOME_TAB: HomeTab = "activity";

export const HOME_TABS: ReadonlyArray<{
  key: HomeTab;
  label: string;
  href: string;
}> = [
  { key: "activity", label: "練習・活動", href: "/dashboard" },
  {
    key: "dashboard",
    label: "ダッシュボード",
    href: "/dashboard?tab=dashboard",
  },
];

/**
 * `?tab=` の値を面へ解決する。
 * 未指定・不正値は既定の面へ倒し、URL の打ち間違いで空白の画面を出さない。
 */
export function parseHomeTab(value: string | undefined): HomeTab {
  return value === "dashboard" ? "dashboard" : DEFAULT_HOME_TAB;
}
