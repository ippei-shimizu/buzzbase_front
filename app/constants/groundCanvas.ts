// グラウンドイラスト（打席記録の打球方向選択用）のキャンバスサイズ。
// クリック座標は pixel / canvas で 0.0〜1.0 の正規化座標に変換し、
// plate_appearances.hit_location_x / hit_location_y で保存する。
// 同じ座標系を打席記録 UI と stats の打球分布図（SprayChart）で共有する。

export const GROUND_CANVAS_WIDTH = 420;
export const GROUND_CANVAS_HEIGHT = 340;

// 球場形状の pixel 座標（GROUND_CANVAS_WIDTH/HEIGHT 基準）。
export const GROUND_HOME = { x: 210, y: 315 } as const;
export const GROUND_FIRST = { x: 285, y: 240 } as const;
export const GROUND_SECOND = { x: 210, y: 165 } as const;
export const GROUND_THIRD = { x: 135, y: 240 } as const;
export const GROUND_OUTFIELD_RX = 235;
export const GROUND_OUTFIELD_RY = 295;

// HOME を通る ±45° のファウルライン上で外野楕円と交わる点までの距離。
// (x-cx)² / rx² + (y-cy)² / ry² = 1 を傾き1の直線で解いて求める。
const FOUL_LINE_DIST = Math.sqrt(
  (GROUND_OUTFIELD_RX ** 2 * GROUND_OUTFIELD_RY ** 2) /
    (GROUND_OUTFIELD_RX ** 2 + GROUND_OUTFIELD_RY ** 2),
);

// ファウルライン端点（外野楕円とファウルラインの交点）。
export const GROUND_LEFT_END = {
  x: GROUND_HOME.x - FOUL_LINE_DIST,
  y: GROUND_HOME.y - FOUL_LINE_DIST,
} as const;
export const GROUND_RIGHT_END = {
  x: GROUND_HOME.x + FOUL_LINE_DIST,
  y: GROUND_HOME.y - FOUL_LINE_DIST,
} as const;

// 正規化座標の DB 保存精度。back の hit_location_x/y は decimal(4,3) のため
// 小数 3 桁。送信前に Number(value.toFixed(HIT_LOCATION_PRECISION)) で丸める。
export const HIT_LOCATION_PRECISION = 3;

// グラウンド上の打球方向ラベル表示位置（pixel 座標）。
// key (1〜13) は plate_appearances.hit_direction_id と一致させる（1=投 〜 13=右線）。
export const DIRECTION_LABEL_POSITIONS: Record<
  number,
  { x: number; y: number }
> = {
  1: { x: 210, y: 258 },
  2: { x: 210, y: 332 },
  3: { x: 285, y: 240 },
  4: { x: 255, y: 180 },
  5: { x: 135, y: 240 },
  6: { x: 165, y: 180 },
  7: { x: 50, y: 160 },
  8: { x: 100, y: 120 },
  9: { x: 132, y: 65 },
  10: { x: 210, y: 75 },
  11: { x: 280, y: 65 },
  12: { x: 315, y: 115 },
  13: { x: 360, y: 160 },
};

// hit_direction_id (1〜13) → 日本語短縮ラベル。
export const DIRECTION_LABELS: Record<number, string> = {
  1: "投",
  2: "捕",
  3: "一",
  4: "二",
  5: "三",
  6: "遊",
  7: "左線",
  8: "左",
  9: "左中",
  10: "中",
  11: "右中",
  12: "右",
  13: "右線",
};
