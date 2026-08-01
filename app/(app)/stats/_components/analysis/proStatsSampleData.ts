import type {
  CountSituations,
  HitDirection,
  PitcherFaceoff,
  PitcherFaceoffData,
  PitchTypeData,
  PitchTypeRow,
} from "../../analysisActions";
import { DIRECTION_LABELS } from "@app/constants/groundCanvas";

/**
 * 無料ユーザーに見せる Pro 限定ブロックのサンプルデータ。
 * ダミー UI ではなく実コンポーネントへ流し込むことで、行の展開や方向の選択といった
 * 操作感まで加入前に体験できるようにする。値は実在の記録ではない架空の打者のもの。
 */

export const SAMPLE_COUNT_SITUATIONS: CountSituations = {
  first_pitch: { at_bats: 9, hits: 3, batting_average: 0.333 },
  favorable_count: { at_bats: 14, hits: 4, batting_average: 0.286 },
  pinch_count: { at_bats: 28, hits: 6, batting_average: 0.214 },
  total_target_pa: 62,
};

const SAMPLE_PITCH_TYPE_ROWS: PitchTypeRow[] = [
  {
    id: 1,
    label: "ストレート",
    plate_appearances: 40,
    at_bats: 35,
    hits: 12,
    total_bases: 18,
    base_on_balls: 4,
    hit_by_pitch: 1,
    sacrifice_fly: 0,
    batting_average: 0.342,
    on_base_percentage: 0.425,
    slugging_percentage: 0.514,
    ops: 0.939,
    result_counts: [
      { plate_result_id: 1, plate_result_name: "二塁打", count: 3 },
      { plate_result_id: 2, plate_result_name: "三塁打", count: 0 },
      { plate_result_id: 3, plate_result_name: "本塁打", count: 1 },
      { plate_result_id: 4, plate_result_name: "三振", count: 6 },
    ],
  },
  {
    id: 2,
    label: "スライダー",
    plate_appearances: 28,
    at_bats: 25,
    hits: 6,
    total_bases: 7,
    base_on_balls: 2,
    hit_by_pitch: 0,
    sacrifice_fly: 0,
    batting_average: 0.24,
    on_base_percentage: 0.296,
    slugging_percentage: 0.28,
    ops: 0.576,
    result_counts: [
      { plate_result_id: 1, plate_result_name: "二塁打", count: 1 },
      { plate_result_id: 2, plate_result_name: "三塁打", count: 0 },
      { plate_result_id: 3, plate_result_name: "本塁打", count: 0 },
      { plate_result_id: 4, plate_result_name: "三振", count: 9 },
    ],
  },
  {
    id: 3,
    label: "カーブ",
    plate_appearances: 15,
    at_bats: 14,
    hits: 3,
    total_bases: 3,
    base_on_balls: 1,
    hit_by_pitch: 0,
    sacrifice_fly: 0,
    batting_average: 0.214,
    on_base_percentage: 0.267,
    slugging_percentage: 0.214,
    ops: 0.481,
    result_counts: [
      { plate_result_id: 1, plate_result_name: "二塁打", count: 0 },
      { plate_result_id: 2, plate_result_name: "三塁打", count: 0 },
      { plate_result_id: 3, plate_result_name: "本塁打", count: 0 },
      { plate_result_id: 4, plate_result_name: "三振", count: 5 },
    ],
  },
  {
    id: 4,
    label: "フォーク",
    plate_appearances: 12,
    at_bats: 11,
    hits: 5,
    total_bases: 6,
    base_on_balls: 1,
    hit_by_pitch: 0,
    sacrifice_fly: 0,
    batting_average: 0.455,
    on_base_percentage: 0.5,
    slugging_percentage: 0.545,
    ops: 1.045,
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
    plate_appearances: 8,
    at_bats: 7,
    hits: 1,
    total_bases: 1,
    base_on_balls: 1,
    hit_by_pitch: 0,
    sacrifice_fly: 0,
    batting_average: 0.143,
    on_base_percentage: 0.25,
    slugging_percentage: 0.143,
    ops: 0.393,
    result_counts: [
      { plate_result_id: 1, plate_result_name: "二塁打", count: 0 },
      { plate_result_id: 2, plate_result_name: "三塁打", count: 0 },
      { plate_result_id: 3, plate_result_name: "本塁打", count: 0 },
      { plate_result_id: 4, plate_result_name: "三振", count: 3 },
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
    plate_appearances: 12,
    at_bats: 11,
    hits: 5,
    total_bases: 7,
    base_on_balls: 1,
    hit_by_pitch: 0,
    sacrifice_fly: 0,
    batting_average: 0.455,
    on_base_percentage: 0.5,
    slugging_percentage: 0.636,
    ops: 1.136,
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
    plate_appearances: 10,
    at_bats: 10,
    hits: 3,
    total_bases: 3,
    base_on_balls: 0,
    hit_by_pitch: 0,
    sacrifice_fly: 0,
    batting_average: 0.3,
    on_base_percentage: 0.3,
    slugging_percentage: 0.3,
    ops: 0.6,
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
    plate_appearances: 9,
    at_bats: 9,
    hits: 2,
    total_bases: 2,
    base_on_balls: 0,
    hit_by_pitch: 0,
    sacrifice_fly: 0,
    batting_average: 0.222,
    on_base_percentage: 0.222,
    slugging_percentage: 0.222,
    ops: 0.444,
    top_result: "単打",
    result_counts: [
      { plate_result_id: 1, plate_result_name: "二塁打", count: 0 },
      { plate_result_id: 2, plate_result_name: "三塁打", count: 0 },
      { plate_result_id: 3, plate_result_name: "本塁打", count: 0 },
      { plate_result_id: 4, plate_result_name: "三振", count: 5 },
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

// ヒートマップの色濃度が散るよう、方向ごとに打率の高低を意図的にばらけさせている。
const HIT_DIRECTION_SEEDS: readonly HitDirectionSeed[] = [
  { id: 1, atBats: 8, hits: 2, topCategory: "ゴロ" },
  { id: 2, atBats: 3, hits: 1, topCategory: "ゴロ" },
  { id: 3, atBats: 6, hits: 2, topCategory: "ゴロ" },
  { id: 4, atBats: 7, hits: 1, topCategory: "ゴロ" },
  { id: 5, atBats: 12, hits: 5, twoBaseHit: 1, topCategory: "ゴロ" },
  { id: 6, atBats: 10, hits: 4, topCategory: "ゴロ" },
  { id: 7, atBats: 8, hits: 3, topCategory: "ライナー" },
  {
    id: 8,
    atBats: 14,
    hits: 6,
    twoBaseHit: 2,
    homeRun: 1,
    topCategory: "フライ",
  },
  { id: 9, atBats: 10, hits: 4, threeBaseHit: 1, topCategory: "ライナー" },
  { id: 10, atBats: 11, hits: 4, topCategory: "フライ" },
  { id: 11, atBats: 6, hits: 1, topCategory: "フライ" },
  { id: 12, atBats: 9, hits: 4, twoBaseHit: 1, topCategory: "ライナー" },
  { id: 13, atBats: 6, hits: 2, topCategory: "ゴロ" },
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
