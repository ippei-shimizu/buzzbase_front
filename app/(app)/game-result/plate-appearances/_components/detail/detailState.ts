import type { RunnersState } from "@app/interface/plateAppearanceV2";

// 打席詳細データ（すべて任意入力）。ウィザードが保持し PA ペイロードへ流す。
export interface DetailState {
  finalBalls: number | null;
  finalStrikes: number | null;
  finalOuts: number | null;
  firstPitchSwing: boolean | null;
  runnersState: RunnersState | null;
  inning: number | null;
  contactQualityId: number | null;
  timingId: number | null;
  pitchTypeId: number | null;
  pitchCourse: number | null;
  selfAnalysisMemo: string | null;
  pitcherId: number | null;
  appearanceSituationId: number | null;
}

/**
 * 任意項目である打席詳細が 1 つでも入力されているか。
 * 詳細入力の利用率を計測するために使う（メモは空文字を未入力として扱う）。
 */
export const hasDetailInput = (detail: DetailState): boolean =>
  detail.finalBalls !== null ||
  detail.finalStrikes !== null ||
  detail.finalOuts !== null ||
  detail.firstPitchSwing !== null ||
  detail.runnersState !== null ||
  detail.inning !== null ||
  detail.contactQualityId !== null ||
  detail.timingId !== null ||
  detail.pitchTypeId !== null ||
  detail.pitchCourse !== null ||
  detail.pitcherId !== null ||
  detail.appearanceSituationId !== null ||
  (detail.selfAnalysisMemo !== null && detail.selfAnalysisMemo !== "");

export const EMPTY_DETAIL: DetailState = {
  finalBalls: null,
  finalStrikes: null,
  finalOuts: null,
  firstPitchSwing: null,
  runnersState: null,
  inning: null,
  contactQualityId: null,
  timingId: null,
  pitchTypeId: null,
  pitchCourse: null,
  selfAnalysisMemo: null,
  pitcherId: null,
  appearanceSituationId: null,
};
