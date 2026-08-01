import type {
  CountSituations,
  PitcherFaceoffData,
  PitchTypeData,
} from "./analysisActions";

/**
 * Pro 限定ブロックの空状態。これらは SSR せずクライアントで取得するため、
 * 初期 state と取得失敗時のフォールバックの両方で同じ値を使う。
 * analysisActions.ts は "use server" で関数しかエクスポートできないため別モジュールに置く。
 */
export const EMPTY_COUNT_SITUATIONS: CountSituations = {
  first_pitch: { at_bats: 0, hits: 0, batting_average: 0 },
  favorable_count: { at_bats: 0, hits: 0, batting_average: 0 },
  pinch_count: { at_bats: 0, hits: 0, batting_average: 0 },
  total_target_pa: 0,
};

export const EMPTY_PITCH_TYPES: PitchTypeData = {
  rows: [],
  total_target_pa: 0,
};

export const EMPTY_PITCHER_FACEOFFS: PitcherFaceoffData = {
  rows: [],
  min_plate_appearances: 0,
  total_target_pa: 0,
};
