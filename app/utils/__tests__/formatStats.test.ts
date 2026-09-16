import { formatHomeRunWithInsideThePark } from "../formatStats";

describe("formatHomeRunWithInsideThePark（本塁打に走本塁打の内数を添える）", () => {
  it("走本塁打があるときは本塁打の総数に内数を添える", () => {
    expect(formatHomeRunWithInsideThePark(4, 1)).toBe("4（走1）");
  });

  it("走本塁打が 0 のときは本塁打の数だけを返す", () => {
    expect(formatHomeRunWithInsideThePark(4, 0)).toBe("4");
  });

  it("古いバックエンドで内数が返らないときも本塁打の数だけを返す", () => {
    expect(formatHomeRunWithInsideThePark(4, undefined)).toBe("4");
  });
});
