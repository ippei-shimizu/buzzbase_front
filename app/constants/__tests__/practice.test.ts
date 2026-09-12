import { MENU_SET_FREE_LIMIT } from "../menuSet";
import {
  CONDITION_MOODS,
  INJURY_PARTS,
  PRACTICE_CATEGORIES,
  PRACTICE_CATEGORY_ICONS,
  PRACTICE_MENU_FREE_LIMIT,
  PRACTICE_UNITS,
  SHADOW_SWING_ICON,
  categoryLabel,
  formatPracticeValue,
  formatTotalAmount,
  formatVolume,
  isWeightReps,
  parseDecimal,
  practiceIconForLog,
  unitLabel,
} from "../practice";

describe("練習ドメインの定数（back との一致を固定する）", () => {
  it("カテゴリは back の PracticeMenu::CATEGORIES と同じ8種を同順で持つ", () => {
    expect(PRACTICE_CATEGORIES.map((item) => item.key)).toEqual([
      "batting",
      "pitching",
      "defense",
      "baserunning",
      "training",
      "strength",
      "care",
      "other",
    ]);
  });

  it("単位は back の PracticeMenu::UNITS と同じ4種を同順で持つ", () => {
    expect(PRACTICE_UNITS.map((item) => item.key)).toEqual([
      "count",
      "minutes",
      "distance",
      "weight_reps",
    ]);
  });

  it("カテゴリ全種にアイコンが定義されている", () => {
    PRACTICE_CATEGORIES.forEach((item) => {
      expect(PRACTICE_CATEGORY_ICONS[item.key]).toBeDefined();
    });
    expect(Object.keys(PRACTICE_CATEGORY_ICONS)).toHaveLength(8);
  });

  it("気分の選択肢は3種", () => {
    expect(CONDITION_MOODS).toEqual(["好調", "普通", "不調"]);
  });

  it("怪我部位のプリセットは8種", () => {
    expect(INJURY_PARTS).toEqual([
      "肩",
      "肘",
      "手首",
      "腰",
      "股関節",
      "膝",
      "足首",
      "その他",
    ]);
  });

  it("無料プランの上限は back の PlanLimits と一致する", () => {
    expect(PRACTICE_MENU_FREE_LIMIT).toBe(3);
    expect(MENU_SET_FREE_LIMIT).toBe(2);
  });

  it("カテゴリ・単位のラベルを引ける", () => {
    expect(categoryLabel("strength")).toBe("筋トレ");
    expect(unitLabel("weight_reps")).toBe("重さ×回数");
  });

  it("重さ×回数のメニューだけ weight_reps と判定する", () => {
    expect(isWeightReps("weight_reps")).toBe(true);
    expect(isWeightReps("count")).toBe(false);
    expect(isWeightReps("minutes")).toBe(false);
    expect(isWeightReps("distance")).toBe(false);
  });
});

describe("parseDecimal", () => {
  it("back が文字列で返す decimal を数値に変換する", () => {
    expect(parseDecimal("200.0")).toBe(200);
    expect(parseDecimal("7.5")).toBe(7.5);
    expect(parseDecimal(0)).toBe(0);
    expect(parseDecimal(-1.5)).toBe(-1.5);
  });

  it("未入力・数値化できない値は null にして 0 と区別する", () => {
    expect(parseDecimal(null)).toBeNull();
    expect(parseDecimal(undefined)).toBeNull();
    expect(parseDecimal("")).toBeNull();
    expect(parseDecimal("abc")).toBeNull();
  });
});

describe("formatPracticeValue", () => {
  it("重さがある記録は「60kg × 10回」形式にする", () => {
    expect(
      formatPracticeValue({ amount: 10, weight: 60, unit_label: "回" }),
    ).toBe("60kg × 10回");
  });

  it("back が文字列で返す decimal でも小数の余りを出さない", () => {
    expect(
      formatPracticeValue({ amount: "10.0", weight: "60.0", unit_label: "回" }),
    ).toBe("60kg × 10回");
  });

  it("重さがある記録の回数の単位は unit_label に依らず「回」で固定する", () => {
    expect(
      formatPracticeValue({ amount: 8, weight: 70, unit_label: "セット" }),
    ).toBe("70kg × 8回");
  });

  it("重さがあり回数が未入力なら 0回として表示する", () => {
    expect(
      formatPracticeValue({ amount: null, weight: 60, unit_label: "回" }),
    ).toBe("60kg × 0回");
  });

  it("重さが 0 でも重さありとして扱う", () => {
    expect(
      formatPracticeValue({ amount: 10, weight: 0, unit_label: "回" }),
    ).toBe("0kg × 10回");
  });

  it("重さが無い記録は単位ラベルを付けて返す", () => {
    expect(
      formatPracticeValue({ amount: 200, weight: null, unit_label: "本" }),
    ).toBe("200本");
  });

  it("量が 0 でも空文字にはしない", () => {
    expect(
      formatPracticeValue({ amount: 0, weight: null, unit_label: "本" }),
    ).toBe("0本");
  });

  it("単位ラベルが無ければ数値だけ返す", () => {
    expect(
      formatPracticeValue({ amount: 30, weight: null, unit_label: null }),
    ).toBe("30");
  });

  it("量も重さも無い記録は空文字にする", () => {
    expect(
      formatPracticeValue({ amount: null, weight: null, unit_label: "本" }),
    ).toBe("");
  });
});

describe("formatTotalAmount", () => {
  it("3桁区切りで単位ラベルを付ける", () => {
    expect(formatTotalAmount(12400, "本")).toBe("12,400本");
  });

  it("3桁区切りの境目", () => {
    expect(formatTotalAmount(999, "本")).toBe("999本");
    expect(formatTotalAmount(1000, "本")).toBe("1,000本");
  });

  it("0 と負値も区切って返す", () => {
    expect(formatTotalAmount(0, "本")).toBe("0本");
    expect(formatTotalAmount(-1234, "本")).toBe("-1,234本");
  });

  it("小数は小数第3位まで残す", () => {
    expect(formatTotalAmount(1234.5, "km")).toBe("1,234.5km");
    expect(formatTotalAmount(1234.5678, "km")).toBe("1,234.568km");
  });

  it("巨大値も区切って返す", () => {
    expect(formatTotalAmount(123456789, "本")).toBe("123,456,789本");
  });

  it("単位ラベルが無ければ数値だけ返す", () => {
    expect(formatTotalAmount(500, null)).toBe("500");
  });

  it("未入力は 0 として扱う", () => {
    expect(formatTotalAmount(null, "本")).toBe("0本");
    expect(formatTotalAmount(undefined, "本")).toBe("0本");
  });
});

describe("formatVolume", () => {
  it("1000kg 未満は kg 表記のまま", () => {
    expect(formatVolume(0)).toBe("0kg");
    expect(formatVolume(640)).toBe("640kg");
    expect(formatVolume(999)).toBe("999kg");
    expect(formatVolume(999.9)).toBe("999.9kg");
  });

  it("1000kg ちょうどから t 表記に切り替わる", () => {
    expect(formatVolume(999.999)).toBe("999.999kg");
    expect(formatVolume(1000)).toBe("1t");
  });

  it("t 表記は小数第1位まで（四捨五入）", () => {
    expect(formatVolume(1049)).toBe("1t");
    expect(formatVolume(1050)).toBe("1.1t");
    expect(formatVolume(8200)).toBe("8.2t");
    expect(formatVolume(8250)).toBe("8.3t");
  });

  it("巨大値は t 表記のまま3桁区切りにする", () => {
    expect(formatVolume(1234567)).toBe("1,234.6t");
  });

  it("負値は t に切り替えず kg 表記のまま", () => {
    expect(formatVolume(-500)).toBe("-500kg");
    expect(formatVolume(-1000)).toBe("-1,000kg");
  });

  it("back が文字列で返す decimal も扱える", () => {
    expect(formatVolume("1200.0")).toBe("1.2t");
  });

  it("未入力は 0kg として扱う", () => {
    expect(formatVolume(null)).toBe("0kg");
  });
});

describe("practiceIconForLog", () => {
  it("素振りのログはカテゴリに依らず専用アイコンにする", () => {
    expect(practiceIconForLog("shadow_swing", "care")).toBe(SHADOW_SWING_ICON);
    expect(SHADOW_SWING_ICON).not.toBe(PRACTICE_CATEGORY_ICONS.batting);
  });

  it("手入力のログはカテゴリのアイコンを使う", () => {
    expect(practiceIconForLog("manual", "strength")).toBe(
      PRACTICE_CATEGORY_ICONS.strength,
    );
  });

  it("カテゴリ不明（メニュー削除済み）は「その他」にフォールバックする", () => {
    expect(practiceIconForLog("manual", undefined)).toBe(
      PRACTICE_CATEGORY_ICONS.other,
    );
  });
});
