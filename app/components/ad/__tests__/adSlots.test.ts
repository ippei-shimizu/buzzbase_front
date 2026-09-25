import { adSlots } from "../adConfig";

// AdSense 管理画面でユニットを作る前に枠のコードだけ先にマージする運用があるため、
// 未設定を許容するスロットはここに明示する。ID を設定したらこの配列から外す
const PENDING_SLOTS: (keyof typeof adSlots)[] = ["toolsResultRectangle"];

// キーとスロット ID の対応が入れ替わると AdSense のレポートが枠単位で断絶し、
// 数字を見ても気付けない。枠の追加・削除・リネーム時はこの表も更新する
const EXPECTED_SLOT_IDS: Record<keyof typeof adSlots, string> = {
  dashboardInFeed: "8812488929",
  dashboardMiddleInFeed: "9547119544",
  mypageBottomInFeed: "2343416949",
  mypageMatchListInFeed: "8717253604",
  gameResultListInFeed: "6315018792",
  gameResultListMiddleInFeed: "7759395150",
  gameResultSummaryInFeed: "6215780592",
  groupListInFeed: "9020372484",
  groupDetailInFeed: "7771003447",
  toolsListBattingBottom: "3425965724",
  toolsListPitchingBottom: "3672810486",
  toolsListTeamBottom: "2112884050",
  toolsResultRectangle: "",
  toolsDisplay: "6569468966",
  toolsDetailMiddle: "5252651311",
  toolsDetailFooter: "7612055498",
  calcGradesTop: "7196288375",
  calcGradesMiddle: "9799802384",
  calcGradesBottom: "8486720710",
  columnMiddle: "1821345216",
  columnBottom: "6882100207",
  columnFooter: "4770675289",
};

describe("adSlots", () => {
  it("キーとスロット ID の対応が変わっていない", () => {
    expect(adSlots).toEqual(EXPECTED_SLOT_IDS);
  });

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
