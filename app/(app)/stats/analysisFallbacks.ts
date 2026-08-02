import type {
  CountSituation,
  CountSituations,
  PitcherFaceoff,
  PitcherFaceoffData,
  PitchTypeData,
  PitchTypeRow,
} from "./analysisActions";

/**
 * Pro 限定ブロックの空状態。403 以外の取得失敗時のフォールバックとして返す。
 * 共有インスタンスを配るため freeze して、受け取り側の書き換えが他へ波及しないようにする。
 * analysisActions.ts は "use server" で関数しかエクスポートできないため別モジュールに置く。
 */
const emptySituation = (): CountSituation =>
  Object.freeze({ at_bats: 0, hits: 0, batting_average: 0 });

const NO_PITCH_TYPE_ROWS: PitchTypeRow[] = [];
const NO_PITCHER_FACEOFF_ROWS: PitcherFaceoff[] = [];
Object.freeze(NO_PITCH_TYPE_ROWS);
Object.freeze(NO_PITCHER_FACEOFF_ROWS);

export const EMPTY_COUNT_SITUATIONS: CountSituations = Object.freeze({
  first_pitch: emptySituation(),
  favorable_count: emptySituation(),
  pinch_count: emptySituation(),
  total_target_pa: 0,
});

export const EMPTY_PITCH_TYPES: PitchTypeData = Object.freeze({
  rows: NO_PITCH_TYPE_ROWS,
  total_target_pa: 0,
});

export const EMPTY_PITCHER_FACEOFFS: PitcherFaceoffData = Object.freeze({
  rows: NO_PITCHER_FACEOFF_ROWS,
  min_plate_appearances: 0,
  total_target_pa: 0,
});
