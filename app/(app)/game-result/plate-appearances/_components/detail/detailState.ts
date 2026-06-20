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
  selfAnalysisMemo: string | null;
  pitcherId: number | null;
  appearanceSituationId: number | null;
}

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
  selfAnalysisMemo: null,
  pitcherId: null,
  appearanceSituationId: null,
};
