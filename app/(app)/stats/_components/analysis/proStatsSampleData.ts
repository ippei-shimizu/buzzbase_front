import type {
  CountSituations,
  HitDirection,
  PitchCourseData,
  PitchCourseZone,
  PitcherFaceoff,
  PitcherFaceoffData,
  PitchTypeData,
  PitchTypeRow,
} from "../../analysisActions";
import { DIRECTION_LABELS } from "@app/constants/groundCanvas";
import {
  PITCH_COURSES,
  isStrikeZoneCourse,
  pitchCourseCol,
  pitchCourseRow,
} from "@app/constants/pitchCourse";

/**
 * 無料ユーザーに見せる Pro 限定ブロックのサンプルデータ。
 * ダミー UI ではなく実コンポーネントへ流し込むことで、行の展開や方向の選択といった
 * 操作感まで加入前に体験できるようにする。値は実在の記録ではない架空の打者のもの。
 *
 * 4ブロックが同一画面に並ぶため、すべて次の1人の打者から導出する。値を変えるときは
 * この前提を崩さないこと。
 *   新仕様で記録した打席 120（= 打数 108 + 四球 9 + 死球 1 + 犠飛 2）
 *   安打 32 / 二塁打 5 / 三塁打 0 / 本塁打 1 / 三振 22
 * 方向別は三振を除いた打球 86 打数、対戦投手別は 5 打席以上の 4 投手ぶん 44 打席。
 */

export const SAMPLE_COUNT_SITUATIONS: CountSituations = {
  first_pitch: { at_bats: 18, hits: 6, batting_average: 0.333 },
  favorable_count: { at_bats: 25, hits: 9, batting_average: 0.36 },
  pinch_count: { at_bats: 46, hits: 11, batting_average: 0.239 },
  total_target_pa: 120,
};

const SAMPLE_PITCH_TYPE_ROWS: PitchTypeRow[] = [
  {
    id: 1,
    label: "ストレート",
    plate_appearances: 52,
    at_bats: 47,
    hits: 16,
    total_bases: 22,
    base_on_balls: 4,
    hit_by_pitch: 1,
    sacrifice_fly: 0,
    batting_average: 0.34,
    on_base_percentage: 0.404,
    slugging_percentage: 0.468,
    ops: 0.872,
    result_counts: [
      { plate_result_id: 1, plate_result_name: "二塁打", count: 3 },
      { plate_result_id: 2, plate_result_name: "三塁打", count: 0 },
      { plate_result_id: 3, plate_result_name: "本塁打", count: 1 },
      { plate_result_id: 4, plate_result_name: "三振", count: 8 },
    ],
  },
  {
    id: 2,
    label: "スライダー",
    plate_appearances: 30,
    at_bats: 27,
    hits: 7,
    total_bases: 8,
    base_on_balls: 2,
    hit_by_pitch: 0,
    sacrifice_fly: 1,
    batting_average: 0.259,
    on_base_percentage: 0.3,
    slugging_percentage: 0.296,
    ops: 0.596,
    result_counts: [
      { plate_result_id: 1, plate_result_name: "二塁打", count: 1 },
      { plate_result_id: 2, plate_result_name: "三塁打", count: 0 },
      { plate_result_id: 3, plate_result_name: "本塁打", count: 0 },
      { plate_result_id: 4, plate_result_name: "三振", count: 7 },
    ],
  },
  {
    id: 3,
    label: "カーブ",
    plate_appearances: 16,
    at_bats: 15,
    hits: 3,
    total_bases: 3,
    base_on_balls: 1,
    hit_by_pitch: 0,
    sacrifice_fly: 0,
    batting_average: 0.2,
    on_base_percentage: 0.25,
    slugging_percentage: 0.2,
    ops: 0.45,
    result_counts: [
      { plate_result_id: 1, plate_result_name: "二塁打", count: 0 },
      { plate_result_id: 2, plate_result_name: "三塁打", count: 0 },
      { plate_result_id: 3, plate_result_name: "本塁打", count: 0 },
      { plate_result_id: 4, plate_result_name: "三振", count: 4 },
    ],
  },
  {
    id: 4,
    label: "フォーク",
    plate_appearances: 13,
    at_bats: 12,
    hits: 4,
    total_bases: 5,
    base_on_balls: 1,
    hit_by_pitch: 0,
    sacrifice_fly: 0,
    batting_average: 0.333,
    on_base_percentage: 0.385,
    slugging_percentage: 0.417,
    ops: 0.802,
    result_counts: [
      { plate_result_id: 1, plate_result_name: "二塁打", count: 1 },
      { plate_result_id: 2, plate_result_name: "三塁打", count: 0 },
      { plate_result_id: 3, plate_result_name: "本塁打", count: 0 },
      { plate_result_id: 4, plate_result_name: "三振", count: 2 },
    ],
  },
  {
    id: 5,
    label: "チェンジアップ",
    plate_appearances: 9,
    at_bats: 7,
    hits: 2,
    total_bases: 2,
    base_on_balls: 1,
    hit_by_pitch: 0,
    sacrifice_fly: 1,
    batting_average: 0.286,
    on_base_percentage: 0.333,
    slugging_percentage: 0.286,
    ops: 0.619,
    result_counts: [
      { plate_result_id: 1, plate_result_name: "二塁打", count: 0 },
      { plate_result_id: 2, plate_result_name: "三塁打", count: 0 },
      { plate_result_id: 3, plate_result_name: "本塁打", count: 0 },
      { plate_result_id: 4, plate_result_name: "三振", count: 1 },
    ],
  },
];

export const SAMPLE_PITCH_TYPES: PitchTypeData = {
  rows: SAMPLE_PITCH_TYPE_ROWS,
  total_target_pa: SAMPLE_PITCH_TYPE_ROWS.reduce(
    (sum, row) => sum + row.plate_appearances,
    0,
  ),
};

const SAMPLE_PITCHER_FACEOFF_ROWS: PitcherFaceoff[] = [
  {
    pitcher_id: 1,
    pitcher_name: "投手 A",
    team_name: "〇〇高校",
    throw_hand: "right",
    pitcher_style: "パワーピッチャー",
    velocity_zone: "140km/h台",
    plate_appearances: 14,
    at_bats: 13,
    hits: 5,
    total_bases: 7,
    base_on_balls: 1,
    hit_by_pitch: 0,
    sacrifice_fly: 0,
    batting_average: 0.385,
    on_base_percentage: 0.429,
    slugging_percentage: 0.538,
    ops: 0.967,
    top_result: "単打",
    result_counts: [
      { plate_result_id: 1, plate_result_name: "二塁打", count: 2 },
      { plate_result_id: 2, plate_result_name: "三塁打", count: 0 },
      { plate_result_id: 3, plate_result_name: "本塁打", count: 0 },
      { plate_result_id: 4, plate_result_name: "三振", count: 3 },
    ],
  },
  {
    pitcher_id: 2,
    pitcher_name: "投手 B",
    team_name: "△△高校",
    throw_hand: "left",
    pitcher_style: "技巧派",
    velocity_zone: "120km/h台",
    plate_appearances: 12,
    at_bats: 11,
    hits: 3,
    total_bases: 3,
    base_on_balls: 1,
    hit_by_pitch: 0,
    sacrifice_fly: 0,
    batting_average: 0.273,
    on_base_percentage: 0.333,
    slugging_percentage: 0.273,
    ops: 0.606,
    top_result: "単打",
    result_counts: [
      { plate_result_id: 1, plate_result_name: "二塁打", count: 0 },
      { plate_result_id: 2, plate_result_name: "三塁打", count: 0 },
      { plate_result_id: 3, plate_result_name: "本塁打", count: 0 },
      { plate_result_id: 4, plate_result_name: "三振", count: 4 },
    ],
  },
  {
    pitcher_id: 3,
    pitcher_name: "投手 C",
    team_name: "□□高校",
    throw_hand: "right",
    pitcher_style: "パワーピッチャー",
    velocity_zone: "130km/h台",
    plate_appearances: 10,
    at_bats: 10,
    hits: 2,
    total_bases: 2,
    base_on_balls: 0,
    hit_by_pitch: 0,
    sacrifice_fly: 0,
    batting_average: 0.2,
    on_base_percentage: 0.2,
    slugging_percentage: 0.2,
    ops: 0.4,
    top_result: "単打",
    result_counts: [
      { plate_result_id: 1, plate_result_name: "二塁打", count: 0 },
      { plate_result_id: 2, plate_result_name: "三塁打", count: 0 },
      { plate_result_id: 3, plate_result_name: "本塁打", count: 0 },
      { plate_result_id: 4, plate_result_name: "三振", count: 5 },
    ],
  },
  {
    pitcher_id: 4,
    pitcher_name: "投手 D",
    team_name: "◇◇高校",
    throw_hand: "left",
    pitcher_style: "技巧派",
    velocity_zone: "130km/h台",
    plate_appearances: 8,
    at_bats: 7,
    hits: 3,
    total_bases: 4,
    base_on_balls: 1,
    hit_by_pitch: 0,
    sacrifice_fly: 0,
    batting_average: 0.429,
    on_base_percentage: 0.5,
    slugging_percentage: 0.571,
    ops: 1.071,
    top_result: "単打",
    result_counts: [
      { plate_result_id: 1, plate_result_name: "二塁打", count: 1 },
      { plate_result_id: 2, plate_result_name: "三塁打", count: 0 },
      { plate_result_id: 3, plate_result_name: "本塁打", count: 0 },
      { plate_result_id: 4, plate_result_name: "三振", count: 2 },
    ],
  },
];

export const SAMPLE_PITCHER_FACEOFFS: PitcherFaceoffData = {
  rows: SAMPLE_PITCHER_FACEOFF_ROWS,
  min_plate_appearances: 5,
  total_target_pa: SAMPLE_PITCHER_FACEOFF_ROWS.reduce(
    (sum, row) => sum + row.plate_appearances,
    0,
  ),
};

interface HitDirectionSeed {
  /** hit_direction_id（1=投 〜 13=右線）。 */
  id: number;
  atBats: number;
  hits: number;
  twoBaseHit?: number;
  threeBaseHit?: number;
  homeRun?: number;
  topCategory: string;
}

// ヒートマップの色濃度が散るよう方向ごとに打率の高低をばらけさせ、捕邪飛と右線は
// 0 打数にして凡例が説明する「0打数は『—』」の表示も1度は現れるようにしている。
const HIT_DIRECTION_SEEDS: readonly HitDirectionSeed[] = [
  { id: 1, atBats: 5, hits: 1, topCategory: "ゴロ" },
  { id: 2, atBats: 0, hits: 0, topCategory: "フライ" },
  { id: 3, atBats: 6, hits: 2, topCategory: "ゴロ" },
  { id: 4, atBats: 10, hits: 2, topCategory: "ゴロ" },
  { id: 5, atBats: 7, hits: 2, topCategory: "ゴロ" },
  { id: 6, atBats: 9, hits: 3, topCategory: "ゴロ" },
  { id: 7, atBats: 2, hits: 1, topCategory: "ライナー" },
  { id: 8, atBats: 12, hits: 5, twoBaseHit: 2, topCategory: "フライ" },
  { id: 9, atBats: 6, hits: 3, twoBaseHit: 1, topCategory: "ライナー" },
  {
    id: 10,
    atBats: 14,
    hits: 6,
    twoBaseHit: 1,
    homeRun: 1,
    topCategory: "フライ",
  },
  { id: 11, atBats: 4, hits: 2, topCategory: "フライ" },
  { id: 12, atBats: 11, hits: 5, twoBaseHit: 1, topCategory: "ライナー" },
  { id: 13, atBats: 0, hits: 0, topCategory: "ゴロ" },
];

export const SAMPLE_HIT_DIRECTIONS: HitDirection[] = HIT_DIRECTION_SEEDS.map(
  (seed) => {
    const twoBaseHit = seed.twoBaseHit ?? 0;
    const threeBaseHit = seed.threeBaseHit ?? 0;
    const homeRun = seed.homeRun ?? 0;
    const singles = seed.hits - twoBaseHit - threeBaseHit - homeRun;
    return {
      id: seed.id,
      label: DIRECTION_LABELS[seed.id] ?? "",
      // back の count は本塁打を除いた打球数。
      count: seed.atBats - homeRun,
      top_category: seed.topCategory,
      at_bats: seed.atBats,
      hits: seed.hits,
      two_base_hit: twoBaseHit,
      three_base_hit: threeBaseHit,
      home_run: homeRun,
      total_bases: singles + twoBaseHit * 2 + threeBaseHit * 3 + homeRun * 4,
    };
  },
);

// コース別サンプル。真ん中〜内寄りが得意、外角低めが苦手という分かりやすい傾向を作る。
// [course, at_bats, hits] のみ持ち、残りは幾何から導出する。
const SAMPLE_PITCH_COURSE_SEEDS: ReadonlyArray<[number, number, number]> = [
  [7, 6, 2],
  [8, 8, 3],
  [9, 5, 1],
  [12, 10, 4],
  [13, 14, 6],
  [14, 8, 2],
  [17, 9, 3],
  [18, 12, 4],
  [19, 7, 1],
  [2, 3, 1],
  [10, 2, 0],
  [16, 4, 1],
  [22, 2, 0],
  [24, 1, 0],
];

const SAMPLE_PITCH_COURSE_ZONES: PitchCourseZone[] = PITCH_COURSES.map(
  (course) => {
    const seed = SAMPLE_PITCH_COURSE_SEEDS.find(([c]) => c === course);
    const atBats = seed?.[1] ?? 0;
    const hits = seed?.[2] ?? 0;
    return {
      course,
      row: pitchCourseRow(course),
      col: pitchCourseCol(course),
      is_strike_zone: isStrikeZoneCourse(course),
      plate_appearances: atBats,
      at_bats: atBats,
      hits,
      batting_average: atBats > 0 ? Number((hits / atBats).toFixed(3)) : 0,
      is_reliable: atBats >= 3,
    };
  },
);

const sumZones = (zones: PitchCourseZone[]) => ({
  plate_appearances: zones.reduce((sum, z) => sum + z.plate_appearances, 0),
  at_bats: zones.reduce((sum, z) => sum + z.at_bats, 0),
  hits: zones.reduce((sum, z) => sum + z.hits, 0),
});

const sampleStrike = sumZones(
  SAMPLE_PITCH_COURSE_ZONES.filter((z) => z.is_strike_zone),
);
const sampleBall = sumZones(
  SAMPLE_PITCH_COURSE_ZONES.filter((z) => !z.is_strike_zone),
);

export const SAMPLE_PITCH_COURSES: PitchCourseData = {
  zones: SAMPLE_PITCH_COURSE_ZONES,
  strike_zone: {
    ...sampleStrike,
    batting_average: Number(
      (sampleStrike.hits / sampleStrike.at_bats).toFixed(3),
    ),
  },
  ball_zone: {
    ...sampleBall,
    batting_average: Number((sampleBall.hits / sampleBall.at_bats).toFixed(3)),
  },
  total_target_pa: sampleStrike.plate_appearances + sampleBall.plate_appearances,
  min_at_bats: 3,
};
