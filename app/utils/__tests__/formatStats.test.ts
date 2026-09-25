import {
  formatHomeRunWithInsideThePark,
  formatRate,
  formatRate2,
} from "../formatStats";

describe("formatRate（小数3桁の率系成績）", () => {
  it("1未満は先頭の0を落とす", () => {
    expect(formatRate(0.3)).toBe(".300");
  });

  it("0 も他の値と桁位置を揃えて .000 と表示する", () => {
    expect(formatRate(0)).toBe(".000");
  });

  it("負の値も先頭の0を落とす", () => {
    expect(formatRate(-0.5)).toBe("-.500");
  });

  it("1以上は整数部を残す", () => {
    expect(formatRate(1)).toBe("1.000");
    expect(formatRate(1.25)).toBe("1.250");
  });

  // 判定は丸め前の値、置換は丸め後の文字列に掛かるため、両者がズレる境界を固定する
  it("丸めで1になる値は整数部を残す", () => {
    expect(formatRate(0.9999)).toBe("1.000");
  });
});

describe("formatRate2（小数2桁の率系成績）", () => {
  it("1未満は先頭の0を落とす", () => {
    expect(formatRate2(0.667)).toBe(".67");
  });

  it("0 も .00 と表示する", () => {
    expect(formatRate2(0)).toBe(".00");
  });

  it("1以上は整数部を残す", () => {
    expect(formatRate2(1)).toBe("1.00");
  });

  it("丸めで1になる値は整数部を残す", () => {
    expect(formatRate2(0.999)).toBe("1.00");
  });
});

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
