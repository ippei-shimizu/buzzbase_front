import type { ConditionLog } from "@app/types/practice";

/**
 * 無料ユーザーに見せる Pro 機能プレビュー用のコンディション。
 * 実データではないため SampleDataLabel と併せて表示する。
 * id / logged_on は表示に使わないダミー値。
 */
export const SAMPLE_CONDITION: ConditionLog = {
  id: 0,
  logged_on: "",
  fatigue_level: 2,
  physical_level: 3,
  sleep_hours: "7.5",
  mood: "普通",
  memo: "後半は集中が切れた。明日は早めに寝る。",
  injuries: [{ part: "肩", memo: "軽い張り" }],
};
