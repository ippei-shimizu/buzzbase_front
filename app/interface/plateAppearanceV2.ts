import type { Pitcher } from "@app/interface/pitcher";
import type {
  AppearanceSituationMaster,
  ContactQualityMaster,
  PitchTypeMaster,
  TimingMaster,
} from "@app/interface/plateAppearanceMasters";

// back の PlateAppearance enum 群（v2 で露出するカラム）。
export type OutType =
  | "ground_ball"
  | "fly_ball"
  | "line_drive"
  | "double_play"
  | "foul_fly";
export type HitType = "single" | "double" | "triple" | "home_run";
export type SwingType = "swinging" | "looking";
export type RunnersState =
  | "no_runner"
  | "first"
  | "second"
  | "third"
  | "first_second"
  | "first_third"
  | "second_third"
  | "bases_loaded";

// GET /api/v2/plate_appearances/by_game の各要素（V2::PlateAppearanceSerializer）。
// hit_location_x/y は DB decimal(4,3) のため文字列で返る（例 "0.500"）。
export interface PlateAppearanceV2 {
  id: number;
  game_result_id: number;
  user_id: number;
  batter_box_number: number;
  batting_result: string;
  plate_result_id: number;
  hit_direction_id: number | null;
  batting_position_id: number | null;
  out_type: OutType | null;
  hit_type: HitType | null;
  swing_type: SwingType | null;
  hit_location_x: string | null;
  hit_location_y: string | null;
  rbi: number | null;
  run_scored: number | null;
  stolen_bases: number | null;
  caught_stealing: number | null;
  final_balls: number | null;
  final_strikes: number | null;
  final_outs: number | null;
  first_pitch_swing: boolean | null;
  runners_state: RunnersState | null;
  inning: number | null;
  self_analysis_memo: string | null;
  opponent_memo: string | null;
  is_new_format: boolean;
  has_detail_data: boolean;
  created_at: string;
  updated_at: string;
  contact_quality: ContactQualityMaster | null;
  timing: TimingMaster | null;
  pitch_type: PitchTypeMaster | null;
  pitcher: Pitcher | null;
  appearance_situation: AppearanceSituationMaster | null;
}

// POST/PATCH /api/v2/plate_appearances で送る属性。
// 送信時の hit_location_x/y は数値（送信前に小数3桁へ丸める）。
// opponent_memo は意図的に含めない。対戦相手メモは打席単位ではなく投手単位
// （pitcher.memo）へ移行したため、打席記録からは送信しない。レスポンス型
// PlateAppearanceV2.opponent_memo は既存データ読み出しのため残している。
export interface PlateAppearanceV2Input {
  game_result_id: number;
  batter_box_number: number;
  plate_result_id: number;
  hit_direction_id?: number | null;
  batting_position_id?: number | null;
  out_type?: OutType | null;
  hit_type?: HitType | null;
  swing_type?: SwingType | null;
  hit_location_x?: number | null;
  hit_location_y?: number | null;
  rbi?: number | null;
  run_scored?: number | null;
  stolen_bases?: number | null;
  caught_stealing?: number | null;
  final_balls?: number | null;
  final_strikes?: number | null;
  final_outs?: number | null;
  first_pitch_swing?: boolean | null;
  runners_state?: RunnersState | null;
  inning?: number | null;
  contact_quality_id?: number | null;
  timing_id?: number | null;
  pitch_type_id?: number | null;
  self_analysis_memo?: string | null;
  pitcher_id?: number | null;
  appearance_situation_id?: number | null;
}

export interface PlateAppearanceV2Payload {
  plate_appearance: PlateAppearanceV2Input;
}

export interface PlateAppearanceListResponse {
  plate_appearances: PlateAppearanceV2[];
}
