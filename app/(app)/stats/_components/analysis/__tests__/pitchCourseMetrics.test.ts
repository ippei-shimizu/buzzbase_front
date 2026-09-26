import type { PitchCourseZone } from "../../../analysisActions";
import {
  PITCH_COURSES,
  isStrikeZoneCourse,
  pitchCourseCol,
  pitchCourseRow,
} from "@app/constants/pitchCourse";
import {
  PITCH_COURSE_GRID3_TRACK_FRACTIONS,
  colorForBattingAverage,
  colorForPlateAppearanceShare,
  colorForSlugging,
  colorForStrikeoutRate,
  foldToGrid3,
  foldToHeightAndSide,
  foldToStrikeAndBallZone,
  formatStrikeoutBreakdown,
  readPitchCourseMetric,
  reliabilityNote,
  sumPitchCourseCounts,
  type PitchCourseCounts,
} from "../pitchCourseMetrics";

const RED = "#d64545";
const ORANGE = "#d98236";
const YELLOW = "#c9a227";
const GREEN = "#4f9e6b";
const BLUE = "#4173b3";

const counts = (overrides: Partial<PitchCourseCounts>): PitchCourseCounts => ({
  plate_appearances: 0,
  at_bats: 0,
  hits: 0,
  total_bases: 0,
  strikeouts: 0,
  swinging_strikeouts: 0,
  looking_strikeouts: 0,
  ...overrides,
});

const buildZones = (
  seeds: Record<number, Partial<PitchCourseCounts>>,
): PitchCourseZone[] =>
  PITCH_COURSES.map((course) => {
    const zoneCounts = counts(seeds[course] ?? {});
    return {
      ...zoneCounts,
      course,
      row: pitchCourseRow(course),
      col: pitchCourseCol(course),
      is_strike_zone: isStrikeZoneCourse(course),
      batting_average: 0,
      is_reliable: false,
    };
  });

const CONTEXT = {
  minAtBats: 3,
  totalPlateAppearances: 100,
  courseCount: 1,
};

describe("sumPitchCourseCounts", () => {
  it("各生カウントを単純合算する", () => {
    expect(
      sumPitchCourseCounts([
        counts({ plate_appearances: 2, at_bats: 2, hits: 1, total_bases: 4 }),
        counts({
          plate_appearances: 3,
          at_bats: 2,
          strikeouts: 2,
          swinging_strikeouts: 1,
          looking_strikeouts: 1,
        }),
      ]),
    ).toEqual(
      counts({
        plate_appearances: 5,
        at_bats: 4,
        hits: 1,
        total_bases: 4,
        strikeouts: 2,
        swinging_strikeouts: 1,
        looking_strikeouts: 1,
      }),
    );
  });
});

describe("foldToGrid3", () => {
  it("行・列を {1,2} / {3} / {4,5} のバンドで 9 セルに畳む", () => {
    const cells = foldToGrid3(
      buildZones({
        1: { at_bats: 2, hits: 2 },
        7: { at_bats: 4, hits: 0 },
        13: { at_bats: 3, hits: 1 },
        25: { at_bats: 1, hits: 1 },
        19: { at_bats: 1, hits: 0 },
      }),
    );

    expect(cells.map((cell) => cell.label)).toEqual([
      "高め・三塁側",
      "高め・真ん中",
      "高め・一塁側",
      "真ん中・三塁側",
      "真ん中",
      "真ん中・一塁側",
      "低め・三塁側",
      "低め・真ん中",
      "低め・一塁側",
    ]);
    expect(cells[0].counts).toMatchObject({ at_bats: 6, hits: 2 });
    expect(cells[4].counts).toMatchObject({ at_bats: 3, hits: 1 });
    expect(cells[8].counts).toMatchObject({ at_bats: 2, hits: 1 });
    expect(cells.map((cell) => cell.courseCount)).toEqual([
      4, 2, 4, 2, 1, 2, 4, 2, 4,
    ]);
  });

  it("率は合算後の生カウントから計算し直す（セルの率を平均しない）", () => {
    const [highThirdBase] = foldToGrid3(
      buildZones({
        1: { at_bats: 2, hits: 2 },
        7: { at_bats: 4, hits: 0 },
      }),
    );

    expect(
      readPitchCourseMetric("batting_average", highThirdBase.counts, CONTEXT)
        .value,
    ).toBe(".333");
  });

  it("トラック比は外周トラックを内側に合算した値", () => {
    expect(PITCH_COURSE_GRID3_TRACK_FRACTIONS).toEqual([1.62, 1, 1.62]);
  });
});

describe("foldToHeightAndSide", () => {
  it("真ん中の行・列を除き、1 打席を高低と内外の両方に数える", () => {
    const { height, side } = foldToHeightAndSide(
      buildZones({
        1: { plate_appearances: 2 },
        13: { plate_appearances: 5 },
        24: { plate_appearances: 3 },
      }),
    );

    expect(
      height.map((cell) => [cell.label, cell.counts.plate_appearances]),
    ).toEqual([
      ["高め", 2],
      ["低め", 3],
    ]);
    expect(
      side.map((cell) => [cell.label, cell.counts.plate_appearances]),
    ).toEqual([
      ["三塁側", 2],
      ["一塁側", 3],
    ]);
    expect([...height, ...side].map((cell) => cell.courseCount)).toEqual([
      10, 10, 10, 10,
    ]);
  });
});

describe("foldToStrikeAndBallZone", () => {
  it("中央 3x3 とそれ以外に分けて合算する", () => {
    const [strike, ball] = foldToStrikeAndBallZone(
      buildZones({
        7: { plate_appearances: 1 },
        19: { plate_appearances: 2 },
        1: { plate_appearances: 4 },
        25: { plate_appearances: 8 },
      }),
    );

    expect(strike.counts.plate_appearances).toBe(3);
    expect(ball.counts.plate_appearances).toBe(12);
    expect([strike.courseCount, ball.courseCount]).toEqual([9, 16]);
  });
});

describe("色スケール", () => {
  it("打率は .45/.35/.25/.15 で高いほど暖色", () => {
    expect(colorForBattingAverage(0.45)).toBe(RED);
    expect(colorForBattingAverage(0.449)).toBe(ORANGE);
    expect(colorForBattingAverage(0.25)).toBe(YELLOW);
    expect(colorForBattingAverage(0.15)).toBe(GREEN);
    expect(colorForBattingAverage(0.149)).toBe(BLUE);
  });

  it("長打率は .700/.550/.400/.250 で高いほど暖色", () => {
    expect(colorForSlugging(1.2)).toBe(RED);
    expect(colorForSlugging(0.7)).toBe(RED);
    expect(colorForSlugging(0.699)).toBe(ORANGE);
    expect(colorForSlugging(0.4)).toBe(YELLOW);
    expect(colorForSlugging(0.25)).toBe(GREEN);
    expect(colorForSlugging(0.249)).toBe(BLUE);
  });

  it("三振率は低いほど打者に良いので暖色側に倒す", () => {
    expect(colorForStrikeoutRate(0)).toBe(RED);
    expect(colorForStrikeoutRate(0.1)).toBe(RED);
    expect(colorForStrikeoutRate(0.11)).toBe(ORANGE);
    expect(colorForStrikeoutRate(0.25)).toBe(YELLOW);
    expect(colorForStrikeoutRate(0.35)).toBe(GREEN);
    expect(colorForStrikeoutRate(0.36)).toBe(BLUE);
  });

  it("打席分布は均等配分比 2.0/1.5/1.0/0.5 で primary の濃淡にする", () => {
    expect(colorForPlateAppearanceShare(2.0)).toBe("#d08000");
    expect(colorForPlateAppearanceShare(1.99)).not.toBe("#d08000");
    expect(colorForPlateAppearanceShare(0.49)).toBe(
      colorForPlateAppearanceShare(0),
    );
    expect(colorForPlateAppearanceShare(0.5)).not.toBe(
      colorForPlateAppearanceShare(0.49),
    );
  });
});

describe("readPitchCourseMetric", () => {
  it("打率・長打率は打数を分母に併記し、min_at_bats 未満を参考値にする", () => {
    const zoneCounts = counts({ at_bats: 2, hits: 1, total_bases: 3 });

    expect(
      readPitchCourseMetric("batting_average", zoneCounts, CONTEXT),
    ).toEqual({
      value: ".500",
      detail: "2打数",
      color: RED,
      isReliable: false,
    });
    expect(readPitchCourseMetric("slugging", zoneCounts, CONTEXT)).toEqual({
      value: "1.500",
      detail: "2打数",
      color: RED,
      isReliable: false,
    });
    expect(
      readPitchCourseMetric(
        "batting_average",
        counts({ at_bats: 3, hits: 1 }),
        CONTEXT,
      ).isReliable,
    ).toBe(true);
  });

  it("三振率は打席を分母に % で表示し、5 打席未満を参考値にする", () => {
    expect(
      readPitchCourseMetric(
        "strikeout_rate",
        counts({ plate_appearances: 4, at_bats: 4, strikeouts: 1 }),
        CONTEXT,
      ),
    ).toEqual({
      value: "25%",
      detail: "4打席",
      color: YELLOW,
      isReliable: false,
    });
    expect(
      readPitchCourseMetric(
        "strikeout_rate",
        counts({ plate_appearances: 5, at_bats: 5 }),
        CONTEXT,
      ).isReliable,
    ).toBe(true);
  });

  it("打席分布は割合を「畳んだコース数 / 25」の均等配分で割った比で色を決める", () => {
    const zoneCounts = counts({ plate_appearances: 8 });

    expect(
      readPitchCourseMetric("plate_appearances", zoneCounts, CONTEXT),
    ).toMatchObject({
      value: "8打席",
      detail: "8%",
      color: colorForPlateAppearanceShare(2.0),
      isReliable: true,
    });
    expect(
      readPitchCourseMetric("plate_appearances", zoneCounts, {
        ...CONTEXT,
        courseCount: 4,
      }).color,
    ).toBe(colorForPlateAppearanceShare(0.5));
  });

  it("25 コースに均等に散った打席は、どの粒度でも全セルが同じ濃さになる", () => {
    const zones = buildZones(
      Object.fromEntries(
        PITCH_COURSES.map((course) => [course, { plate_appearances: 4 }]),
      ),
    );
    const { height, side } = foldToHeightAndSide(zones);
    const colorOf = (zoneCounts: PitchCourseCounts, courseCount: number) =>
      readPitchCourseMetric("plate_appearances", zoneCounts, {
        ...CONTEXT,
        courseCount,
      }).color;
    const colors = [
      ...zones.map((zone) => colorOf(zone, 1)),
      ...[
        ...foldToGrid3(zones),
        ...height,
        ...side,
        ...foldToStrikeAndBallZone(zones),
      ].map((cell) => colorOf(cell.counts, cell.courseCount)),
    ];

    expect(new Set(colors)).toEqual(new Set([colorForPlateAppearanceShare(1)]));
  });

  it("分母が 0 なら無彩色の '-' にする", () => {
    const empty = counts({});
    for (const metric of [
      "plate_appearances",
      "batting_average",
      "slugging",
      "strikeout_rate",
    ] as const) {
      expect(readPitchCourseMetric(metric, empty, CONTEXT)).toMatchObject({
        value: "-",
        color: null,
      });
    }
  });
});

describe("reliabilityNote", () => {
  it("指標ごとの最低母数を案内し、打席分布では出さない", () => {
    expect(reliabilityNote("batting_average", 3)).toBe(
      "打数が3未満のコースは参考値です",
    );
    expect(reliabilityNote("slugging", 3)).toBe(
      "打数が3未満のコースは参考値です",
    );
    expect(reliabilityNote("strikeout_rate", 3)).toBe(
      "打席が5未満のコースは参考値です",
    );
    expect(reliabilityNote("plate_appearances", 3)).toBeNull();
  });
});

describe("formatStrikeoutBreakdown", () => {
  it("空振り・見逃しに入らない三振（振り逃げ等）を未入力として出す", () => {
    expect(
      formatStrikeoutBreakdown(
        counts({
          strikeouts: 5,
          swinging_strikeouts: 2,
          looking_strikeouts: 1,
        }),
      ),
    ).toBe("三振 5（空振り 2・見逃し 1・未入力 2）");
  });
});
