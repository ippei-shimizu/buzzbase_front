import {
  DIRECTION_LABEL_POSITIONS,
  GROUND_CANVAS_HEIGHT,
  GROUND_CANVAS_WIDTH,
  HIT_LOCATION_PRECISION,
} from "@app/constants/groundCanvas";

export interface Point {
  x: number;
  y: number;
}

/**
 * クリック位置（正規化座標）に最も近い DIRECTION_LABEL_POSITIONS のラベル ID を返す。
 * 画面上のラベル位置と pixel 距離で比較するだけなので、表示ラベルと完全に連動する。
 *
 * @param point クリック位置の正規化座標 (x: 0..1, y: 0..1)
 * @returns 最寄りラベルの id。DIRECTION_LABEL_POSITIONS が空のときのみ null
 */
export function detectClosestDirection(point: Point): number | null {
  const pixelX = point.x * GROUND_CANVAS_WIDTH;
  const pixelY = point.y * GROUND_CANVAS_HEIGHT;
  let closestId: number | null = null;
  let closestDistSq = Infinity;
  for (const [idKey, pos] of Object.entries(DIRECTION_LABEL_POSITIONS)) {
    const dx = pos.x - pixelX;
    const dy = pos.y - pixelY;
    const distSq = dx * dx + dy * dy;
    if (distSq < closestDistSq) {
      closestDistSq = distSq;
      closestId = Number(idKey);
    }
  }
  return closestId;
}

/**
 * 正規化座標を DB の hit_location_x/y の精度（小数3桁）に丸める。
 * 送信ペイロード生成時に使用する。
 */
export function roundHitLocation(value: number): number {
  return Number(value.toFixed(HIT_LOCATION_PRECISION));
}
