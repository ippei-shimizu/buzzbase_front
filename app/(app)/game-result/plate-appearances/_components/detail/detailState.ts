import type { PitchCoursePoint } from "@app/constants/pitchCourse";
import type { RunnersState } from "@app/interface/plateAppearanceV2";
import type { PlateAppearanceDetailFlags } from "@app/utils/analytics";

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
  // コース図のタップ位置。pitchCourse の導出元で、コースだけが記録された既存データでは null。
  pitchCourseLocation: PitchCoursePoint | null;
  selfAnalysisMemo: string | null;
  pitcherId: number | null;
  appearanceSituationId: number | null;
}

/**
 * 任意項目である打席詳細の入力有無を項目別に判定する（メモは空文字を未入力として扱う）。
 * mobile（`buzzbase_mobile/stores/battingRecordStore.ts`）と同じ構成要素で判定する。
 * @param detail ウィザードが保持する打席詳細
 * @return 項目別フラグと、そのいずれかが立っているかを表す `has_detail`
 */
export const toDetailInputFlags = (
  detail: DetailState,
): PlateAppearanceDetailFlags => {
  const itemFlags = {
    has_pitcher: detail.pitcherId !== null,
    has_count:
      detail.finalBalls !== null ||
      detail.finalStrikes !== null ||
      detail.finalOuts !== null,
    has_situation:
      detail.runnersState !== null ||
      detail.inning !== null ||
      detail.appearanceSituationId !== null,
    has_first_pitch_swing: detail.firstPitchSwing !== null,
    has_contact_quality: detail.contactQualityId !== null,
    has_timing: detail.timingId !== null,
    has_pitch_type: detail.pitchTypeId !== null,
    has_pitch_course: detail.pitchCourse !== null,
    has_memo:
      detail.selfAnalysisMemo !== null && detail.selfAnalysisMemo !== "",
  };
  return {
    ...itemFlags,
    // 既存の PostHog データと連続して読むため構成要素を変えない。打球方向は任意の詳細ではないので itemFlags に足さない。
    has_detail: Object.values(itemFlags).some(Boolean),
  };
};

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
  pitchCourseLocation: null,
  selfAnalysisMemo: null,
  pitcherId: null,
  appearanceSituationId: null,
};
