import { adSlots } from "../adConfig";

// AdSense 管理画面でユニットを作る前に枠のコードだけ先にマージする運用があるため、
// 未設定を許容するスロットはここに明示する。ID を設定したらこの配列から外す
const PENDING_SLOTS: (keyof typeof adSlots)[] = [
  "gameResultDetailInFeed",
  "toolsResultRectangle",
];

describe("adSlots", () => {
  it.each(
    Object.entries(adSlots).filter(
      ([name]) => !PENDING_SLOTS.includes(name as keyof typeof adSlots),
    ),
  )("%s にスロット ID が設定されている", (_name, slot) => {
    expect(slot).toMatch(/^\d{10}$/);
  });

  it("未設定スロットの許可リストに、実際は設定済みのものが残っていない", () => {
    for (const name of PENDING_SLOTS) {
      expect(adSlots[name]).toBe("");
    }
  });
});
