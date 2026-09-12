// v2 打席記録の詳細データで使うマスタ系の型。
// back の各マスタ API（GET /api/v2/{contact_qualities,timings,...}）が返す
// `{ id, name, display_order }` 形と一致させる。display_order 昇順で返る。

export interface MasterItem {
  id: number;
  name: string;
  display_order: number;
}

export type ContactQualityMaster = MasterItem;
export type TimingMaster = MasterItem;
export type PitchTypeMaster = MasterItem;
export type ArmAngleMaster = MasterItem;
export type VelocityZoneMaster = MasterItem;
export type PitcherStyleMaster = MasterItem;
export type AppearanceSituationMaster = MasterItem;

// stadiums / pitchers の index が返すページネーション情報。
export interface Pagination {
  current_page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
}
