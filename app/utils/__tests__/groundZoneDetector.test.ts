import {
  DIRECTION_LABEL_POSITIONS,
  GROUND_CANVAS_HEIGHT,
  GROUND_CANVAS_WIDTH,
} from "@app/constants/groundCanvas";
import {
  detectClosestDirection,
  roundHitLocation,
} from "@app/utils/groundZoneDetector";

// pixel 座標を正規化座標 (0..1) に変換するヘルパー。
const toNormalized = (pixelX: number, pixelY: number) => ({
  x: pixelX / GROUND_CANVAS_WIDTH,
  y: pixelY / GROUND_CANVAS_HEIGHT,
});

describe("detectClosestDirection", () => {
  it("各方向ラベルの中心位置は、その方向 id を返す", () => {
    for (const [idKey, pos] of Object.entries(DIRECTION_LABEL_POSITIONS)) {
      const point = toNormalized(pos.x, pos.y);
      expect(detectClosestDirection(point)).toBe(Number(idKey));
    }
  });

  it("ラベル中心から少しずれた近傍点も、その方向 id を返す", () => {
    const centerField = DIRECTION_LABEL_POSITIONS[10]; // 中
    const point = toNormalized(centerField.x + 8, centerField.y + 8);
    expect(detectClosestDirection(point)).toBe(10);
  });

  it("捕手側（左下隅付近）は捕(2)を返す", () => {
    const point = toNormalized(210, 339);
    expect(detectClosestDirection(point)).toBe(2);
  });

  it("2ラベルの中点はより近い方（同距離なら先に走査した小さい id）を返す", () => {
    // 左中(9){132,65} と 中(10){210,75} の中点。距離はほぼ同じだが
    // Object.entries の走査順で先に評価される 9 が選ばれる。
    const mid = toNormalized((132 + 210) / 2, (65 + 75) / 2);
    expect(detectClosestDirection(mid)).toBe(9);
  });

  it("正規化範囲外(x>1)でも最寄りの外縁ラベル id を返す（null にしない）", () => {
    const result = detectClosestDirection({ x: 1.5, y: 0.5 });
    expect(result).not.toBeNull();
    expect(Object.keys(DIRECTION_LABEL_POSITIONS)).toContain(String(result));
  });
});

describe("roundHitLocation", () => {
  it("小数3桁に丸める（DB decimal(4,3) に合わせる）", () => {
    expect(roundHitLocation(0.123456)).toBe(0.123);
    expect(roundHitLocation(0.5)).toBe(0.5);
    expect(roundHitLocation(0.9999)).toBe(1);
  });

  it("0 と境界値を保持する", () => {
    expect(roundHitLocation(0)).toBe(0);
    expect(roundHitLocation(1)).toBe(1);
  });
});
