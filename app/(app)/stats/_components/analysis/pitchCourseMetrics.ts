import type { PitchCourseZone } from "../../analysisActions";
import {
  PITCH_COURSES,
  PITCH_COURSE_HEIGHT_BAND_LABELS,
  PITCH_COURSE_SIDE_BAND_LABELS,
  PITCH_COURSE_TRACK_FRACTIONS,
  isStrikeZoneCourse,
  pitchCourseBand,
  pitchCourseCol,
  pitchCourseRow,
} from "@app/constants/pitchCourse";
import { formatBattingAverage } from "@app/utils/formatStats";

export type PitchCourseMetric =
  | "plate_appearances"
  | "batting_average"
  | "slugging"
  | "strikeout_rate";

export type PitchCourseGranularity = "grid5" | "grid3" | "split4" | "zone";

export const PITCH_COURSE_METRICS: ReadonlyArray<{
  key: PitchCourseMetric;
  label: string;
}> = [
  { key: "plate_appearances", label: "打席分布" },
  { key: "batting_average", label: "打率" },
  { key: "slugging", label: "長打率" },
  { key: "strikeout_rate", label: "三振率" },
];

export const PITCH_COURSE_GRANULARITIES: ReadonlyArray<{
  key: PitchCourseGranularity;
  label: string;
}> = [
  { key: "grid5", label: "5x5" },
  { key: "grid3", label: "3x3" },
  { key: "split4", label: "高低・内外" },
  { key: "zone", label: "ゾーン内外" },
];

export const MIN_STRIKEOUT_RATE_PLATE_APPEARANCES = 5;

/** 畳み込みで合算する生カウント。率は合算後に再計算する。 */
export interface PitchCourseCounts {
  plate_appearances: number;
  at_bats: number;
  hits: number;
  total_bases: number;
  strikeouts: number;
  swinging_strikeouts: number;
  looking_strikeouts: number;
}

export interface FoldedPitchCourseCell {
  key: string;
  label: string;
  counts: PitchCourseCounts;
  /** 畳み込んだ 5x5 のコース数。打席分布の均等配分の基準に使う。 */
  courseCount: number;
}

const EMPTY_COUNTS: PitchCourseCounts = {
  plate_appearances: 0,
  at_bats: 0,
  hits: 0,
  total_bases: 0,
  strikeouts: 0,
  swinging_strikeouts: 0,
  looking_strikeouts: 0,
};

/** 生カウントを単純合算する（率の平均は取らない）。 */
export const sumPitchCourseCounts = (
  zones: ReadonlyArray<PitchCourseCounts>,
): PitchCourseCounts =>
  zones.reduce<PitchCourseCounts>(
    (total, zone) => ({
      plate_appearances: total.plate_appearances + zone.plate_appearances,
      at_bats: total.at_bats + zone.at_bats,
      hits: total.hits + zone.hits,
      total_bases: total.total_bases + zone.total_bases,
      strikeouts: total.strikeouts + zone.strikeouts,
      swinging_strikeouts: total.swinging_strikeouts + zone.swinging_strikeouts,
      looking_strikeouts: total.looking_strikeouts + zone.looking_strikeouts,
    }),
    EMPTY_COUNTS,
  );

/** 3x3 のトラック比。5x5 の外周トラックを隣の内側トラックに合算し、ゾーン図の幾何を揃える。 */
export const PITCH_COURSE_GRID3_TRACK_FRACTIONS: ReadonlyArray<number> = [
  PITCH_COURSE_TRACK_FRACTIONS[0] + PITCH_COURSE_TRACK_FRACTIONS[1],
  PITCH_COURSE_TRACK_FRACTIONS[2],
  PITCH_COURSE_TRACK_FRACTIONS[3] + PITCH_COURSE_TRACK_FRACTIONS[4],
];

const foldCell = (
  key: string,
  label: string,
  zones: ReadonlyArray<PitchCourseZone>,
  includesCourse: (course: number) => boolean,
): FoldedPitchCourseCell => ({
  key,
  label,
  counts: sumPitchCourseCounts(
    zones.filter((zone) => includesCourse(zone.course)),
  ),
  courseCount: PITCH_COURSES.filter(includesCourse).length,
});

/** 25 マスを 高め/真ん中/低め × 三塁側/真ん中/一塁側 の 9 セル（行優先）に畳む。 */
export const foldToGrid3 = (
  zones: ReadonlyArray<PitchCourseZone>,
): FoldedPitchCourseCell[] =>
  PITCH_COURSE_HEIGHT_BAND_LABELS.flatMap((heightLabel, heightBand) =>
    PITCH_COURSE_SIDE_BAND_LABELS.map((sideLabel, sideBand) =>
      foldCell(
        `${heightBand}-${sideBand}`,
        heightBand === 1 && sideBand === 1
          ? "真ん中"
          : `${heightLabel}・${sideLabel}`,
        zones,
        (course) =>
          pitchCourseBand(pitchCourseRow(course)) === heightBand &&
          pitchCourseBand(pitchCourseCol(course)) === sideBand,
      ),
    ),
  );

/**
 * 高低（高め / 低め）と内外（三塁側 / 一塁側）の 2 組に畳む。真ん中の行・列は含めず、
 * 1 打席が高低と内外の両方に入る。
 */
export const foldToHeightAndSide = (
  zones: ReadonlyArray<PitchCourseZone>,
): { height: FoldedPitchCourseCell[]; side: FoldedPitchCourseCell[] } => ({
  height: [
    foldCell(
      "high",
      "高め",
      zones,
      (course) => pitchCourseBand(pitchCourseRow(course)) === 0,
    ),
    foldCell(
      "low",
      "低め",
      zones,
      (course) => pitchCourseBand(pitchCourseRow(course)) === 2,
    ),
  ],
  side: [
    foldCell(
      "third_base",
      "三塁側",
      zones,
      (course) => pitchCourseBand(pitchCourseCol(course)) === 0,
    ),
    foldCell(
      "first_base",
      "一塁側",
      zones,
      (course) => pitchCourseBand(pitchCourseCol(course)) === 2,
    ),
  ],
});

/** ストライクゾーン（中央 3x3）とボールゾーン（外周 16）の 2 セルに畳む。 */
export const foldToStrikeAndBallZone = (
  zones: ReadonlyArray<PitchCourseZone>,
): FoldedPitchCourseCell[] => [
  foldCell("strike", "ストライクゾーン", zones, isStrikeZoneCourse),
  foldCell(
    "ball",
    "ボールゾーン",
    zones,
    (course) => !isStrikeZoneCourse(course),
  ),
];

// 打者にとって良い=暖色、悪い=寒色。フィルタを変えても同じ値が同じ色になるよう固定しきい値にする。
const RATING_COLORS = [
  "#d64545",
  "#d98236",
  "#c9a227",
  "#4f9e6b",
  "#4173b3",
] as const;

const DISTRIBUTION_COLORS = [
  "#d08000",
  "#a96a0b",
  "#835514",
  "#63461c",
  "#4a3d2c",
] as const;

const colorByDescendingThresholds = (
  value: number,
  thresholds: readonly [number, number, number, number],
  colors: readonly string[],
): string => {
  const index = thresholds.findIndex((threshold) => value >= threshold);
  return colors[index === -1 ? thresholds.length : index];
};

export const colorForBattingAverage = (average: number): string =>
  colorByDescendingThresholds(average, [0.45, 0.35, 0.25, 0.15], RATING_COLORS);

export const colorForSlugging = (slugging: number): string =>
  colorByDescendingThresholds(slugging, [0.7, 0.55, 0.4, 0.25], RATING_COLORS);

/** 三振率は低いほど打者にとって良いので、しきい値以下で暖色側に倒す。 */
export const colorForStrikeoutRate = (rate: number): string => {
  const thresholds = [0.1, 0.18, 0.25, 0.35];
  const index = thresholds.findIndex((threshold) => rate <= threshold);
  return RATING_COLORS[index === -1 ? thresholds.length : index];
};

/** 打席割合 ÷ 均等配分の割合 で濃淡を決める。粒度を変えても同じ意味の濃さになる。 */
export const colorForPlateAppearanceShare = (shareRatio: number): string =>
  colorByDescendingThresholds(
    shareRatio,
    [2.0, 1.5, 1.0, 0.5],
    DISTRIBUTION_COLORS,
  );

const formatPercent = (rate: number): string => `${Math.round(rate * 100)}%`;

export interface PitchCourseMetricContext {
  /** 打率・長打率の参考値しきい値（API の min_at_bats）。 */
  minAtBats: number;
  /** 打席分布の割合の分母（表示中の全コースの打席合計）。 */
  totalPlateAppearances: number;
  /** セルが畳んだ 5x5 のコース数。均等に散ったときの割合は courseCount / 25。 */
  courseCount: number;
}

export interface PitchCourseMetricReading {
  /** 主指標の表示文字列。分母 0 のときは "-"。 */
  value: string;
  /** 分母（打率なら "N打数"）。打席分布では全体に占める割合。 */
  detail: string | null;
  /** null は色スケールの対象外（無彩色）。 */
  color: string | null;
  /** false は最低母数未満の参考値（半透明で表示する）。 */
  isReliable: boolean;
}

const NO_DATA_READING: PitchCourseMetricReading = {
  value: "-",
  detail: null,
  color: null,
  isReliable: true,
};

/** 生カウントから指標の表示値・分母・色・参考値判定を求める。 */
export const readPitchCourseMetric = (
  metric: PitchCourseMetric,
  counts: PitchCourseCounts,
  context: PitchCourseMetricContext,
): PitchCourseMetricReading => {
  switch (metric) {
    case "plate_appearances": {
      if (counts.plate_appearances === 0 || context.totalPlateAppearances === 0)
        return NO_DATA_READING;
      const share = counts.plate_appearances / context.totalPlateAppearances;
      return {
        value: `${counts.plate_appearances}打席`,
        detail: formatPercent(share),
        color: colorForPlateAppearanceShare(
          share / (context.courseCount / PITCH_COURSES.length),
        ),
        isReliable: true,
      };
    }
    case "batting_average":
    case "slugging": {
      if (counts.at_bats === 0) return NO_DATA_READING;
      const rate =
        (metric === "slugging" ? counts.total_bases : counts.hits) /
        counts.at_bats;
      // back が塁打・三振を返す前のレスポンスでは undefined になり NaN を表示してしまう。
      if (!Number.isFinite(rate)) return NO_DATA_READING;
      return {
        value: formatBattingAverage(rate, counts.at_bats),
        detail: `${counts.at_bats}打数`,
        color:
          metric === "slugging"
            ? colorForSlugging(rate)
            : colorForBattingAverage(rate),
        isReliable: counts.at_bats >= context.minAtBats,
      };
    }
    case "strikeout_rate": {
      if (counts.plate_appearances === 0) return NO_DATA_READING;
      const rate = counts.strikeouts / counts.plate_appearances;
      if (!Number.isFinite(rate)) return NO_DATA_READING;
      return {
        value: formatPercent(rate),
        detail: `${counts.plate_appearances}打席`,
        color: colorForStrikeoutRate(rate),
        isReliable:
          counts.plate_appearances >= MIN_STRIKEOUT_RATE_PLATE_APPEARANCES,
      };
    }
  }
};

/** 最低母数の注記。打席分布は沈めるセルが無いので null。 */
export const reliabilityNote = (
  metric: PitchCourseMetric,
  minAtBats: number,
): string | null => {
  switch (metric) {
    case "plate_appearances":
      return null;
    case "batting_average":
    case "slugging":
      return `打数が${minAtBats}未満のコースは参考値です`;
    case "strikeout_rate":
      return `打席が${MIN_STRIKEOUT_RATE_PLATE_APPEARANCES}未満のコースは参考値です`;
  }
};

/**
 * 三振の内訳。振り逃げは空振り/見逃しを持たないため、差分を「未入力」として出す。
 * 三振数そのものが無い（back が未対応の）ときは null。
 */
export const formatStrikeoutBreakdown = (
  counts: PitchCourseCounts,
): string | null => {
  if (!Number.isFinite(counts.strikeouts)) return null;
  const countOrZero = (value: number) => (Number.isFinite(value) ? value : 0);
  const swinging = countOrZero(counts.swinging_strikeouts);
  const looking = countOrZero(counts.looking_strikeouts);
  const unrecorded = Math.max(0, counts.strikeouts - swinging - looking);
  return `三振 ${counts.strikeouts}（空振り ${swinging}・見逃し ${looking}・未入力 ${unrecorded}）`;
};
