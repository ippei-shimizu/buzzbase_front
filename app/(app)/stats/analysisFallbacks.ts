import type {
  CountSituation,
  CountSituations,
  PitchCourseData,
  PitchCoursePitchTypeData,
  PitchCoursePitchTypeRow,
  PitchCourseZone,
  PitchCourseZoneSummary,
  PitcherFaceoff,
  PitcherFaceoffData,
  PitchTypeData,
  PitchTypeRow,
} from "./analysisActions";
import {
  PITCH_COURSES,
  isStrikeZoneCourse,
  pitchCourseCol,
  pitchCourseRow,
} from "@app/constants/pitchCourse";

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

const emptyZoneSummary = (): PitchCourseZoneSummary =>
  Object.freeze({ plate_appearances: 0, at_bats: 0, hits: 0, batting_average: 0 });

// back の zones と同じく必ず 25 要素を持たせ、ヒートマップ描画を安定させる。
const EMPTY_PITCH_COURSE_ZONES: PitchCourseZone[] = PITCH_COURSES.map(
  (course) =>
    Object.freeze({
      course,
      row: pitchCourseRow(course),
      col: pitchCourseCol(course),
      is_strike_zone: isStrikeZoneCourse(course),
      plate_appearances: 0,
      at_bats: 0,
      hits: 0,
      batting_average: 0,
      is_reliable: false,
    }),
);
Object.freeze(EMPTY_PITCH_COURSE_ZONES);

export const EMPTY_PITCH_COURSES: PitchCourseData = Object.freeze({
  zones: EMPTY_PITCH_COURSE_ZONES,
  strike_zone: emptyZoneSummary(),
  ball_zone: emptyZoneSummary(),
  total_target_pa: 0,
  min_at_bats: 3,
});

const NO_PITCH_COURSE_PITCH_TYPE_ROWS: PitchCoursePitchTypeRow[] = [];
Object.freeze(NO_PITCH_COURSE_PITCH_TYPE_ROWS);

export const EMPTY_PITCH_COURSE_PITCH_TYPES: PitchCoursePitchTypeData =
  Object.freeze({
    rows: NO_PITCH_COURSE_PITCH_TYPE_ROWS,
    total_target_pa: 0,
    min_at_bats: 3,
  });
