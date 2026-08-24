import {
  PITCH_COURSES,
  STRIKE_ZONE_COURSES,
  isStrikeZoneCourse,
  pitchCourseCol,
  pitchCourseLabel,
  pitchCourseRow,
} from "@app/constants/pitchCourse";

describe("pitchCourse", () => {
  it("コースは 1〜25 の 25 マス", () => {
    expect(PITCH_COURSES).toHaveLength(25);
    expect(PITCH_COURSES[0]).toBe(1);
    expect(PITCH_COURSES[24]).toBe(25);
  });

  it("全 25 コースの row / col / ストライク判定が定義どおり", () => {
    const expected: Array<[number, number, number, boolean]> = [
      [1, 1, 1, false],
      [2, 1, 2, false],
      [3, 1, 3, false],
      [4, 1, 4, false],
      [5, 1, 5, false],
      [6, 2, 1, false],
      [7, 2, 2, true],
      [8, 2, 3, true],
      [9, 2, 4, true],
      [10, 2, 5, false],
      [11, 3, 1, false],
      [12, 3, 2, true],
      [13, 3, 3, true],
      [14, 3, 4, true],
      [15, 3, 5, false],
      [16, 4, 1, false],
      [17, 4, 2, true],
      [18, 4, 3, true],
      [19, 4, 4, true],
      [20, 4, 5, false],
      [21, 5, 1, false],
      [22, 5, 2, false],
      [23, 5, 3, false],
      [24, 5, 4, false],
      [25, 5, 5, false],
    ];
    expected.forEach(([course, row, col, strike]) => {
      expect(pitchCourseRow(course)).toBe(row);
      expect(pitchCourseCol(course)).toBe(col);
      expect(isStrikeZoneCourse(course)).toBe(strike);
    });
  });

  it("ストライクゾーン集合が back の定義と一致する", () => {
    expect(STRIKE_ZONE_COURSES).toEqual([7, 8, 9, 12, 13, 14, 17, 18, 19]);
    expect(PITCH_COURSES.filter(isStrikeZoneCourse)).toEqual([
      ...STRIKE_ZONE_COURSES,
    ]);
  });

  describe("pitchCourseLabel", () => {
    it("打席未設定は三塁側/一塁側でフォールバックする", () => {
      expect(pitchCourseLabel(1)).toBe("高め・三塁側寄り（ボール）");
      expect(pitchCourseLabel(13)).toBe("真ん中（ストライク）");
      expect(pitchCourseLabel(25)).toBe("低め・一塁側寄り（ボール）");
    });

    it("右打ちは三塁側が内角になる", () => {
      expect(pitchCourseLabel(12, "right")).toBe(
        "真ん中・内角寄り（ストライク）",
      );
      expect(pitchCourseLabel(14, "right")).toBe(
        "真ん中・外角寄り（ストライク）",
      );
    });

    it("左打ちは一塁側が内角になる", () => {
      expect(pitchCourseLabel(12, "left")).toBe(
        "真ん中・外角寄り（ストライク）",
      );
      expect(pitchCourseLabel(14, "left")).toBe(
        "真ん中・内角寄り（ストライク）",
      );
    });

    it("両打ちは位置ベースの表記に倒す", () => {
      expect(pitchCourseLabel(12, "both")).toBe(
        "真ん中・三塁側寄り（ストライク）",
      );
    });
  });
});
