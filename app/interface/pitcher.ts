import type {
  ArmAngleMaster,
  Pagination,
  PitcherStyleMaster,
  VelocityZoneMaster,
} from "@app/interface/plateAppearanceMasters";

// 投手の利き手（back の Pitcher#throw_hand enum: right=0 / left=1）。
export type ThrowHand = "right" | "left";

// 投手はユーザー固有マスタ（created_by_user_id でスコープ）。
// GET /api/v2/pitchers の各要素 / PlateAppearanceV2.pitcher のネスト形。
export interface Pitcher {
  id: number;
  name: string;
  throw_hand: ThrowHand | null;
  team_id: number | null;
  memo: string | null;
  arm_angle: ArmAngleMaster | null;
  velocity_zone: VelocityZoneMaster | null;
  pitcher_style: PitcherStyleMaster | null;
}

// POST/PATCH /api/v2/pitchers の body（{ pitcher: PitcherInput }）。
export interface PitcherInput {
  name: string;
  throw_hand?: ThrowHand | null;
  team_id?: number | null;
  arm_angle_id?: number | null;
  velocity_zone_id?: number | null;
  pitcher_style_id?: number | null;
  memo?: string | null;
}

export interface PitcherListResponse {
  data: Pitcher[];
  pagination: Pagination;
}
