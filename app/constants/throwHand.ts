import type { ThrowHand } from "@app/interface/pitcher";

// 投手リスト向けのフルラベル。
export const THROW_HAND_FULL_LABELS: Readonly<Record<ThrowHand, string>> = {
  right: "右投げ",
  left: "左投げ",
};

// チップ等の省スペース表示向けの短縮ラベル。
export const THROW_HAND_SHORT_LABELS: Readonly<Record<ThrowHand, string>> = {
  right: "右",
  left: "左",
};
