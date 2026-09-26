import type {
  PitchCourseData,
  PitchCoursePitchTypeData,
  PitchCourseZone,
  PitcherFaceoffCourseData,
} from "../../../analysisActions";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PITCH_COURSES,
  isStrikeZoneCourse,
  pitchCourseCol,
  pitchCourseRow,
} from "@app/constants/pitchCourse";
import { PitchCourseCard } from "../PitchCourseCard";

const buildZones = (
  seeds: Record<number, { atBats: number; hits: number }>,
): PitchCourseZone[] =>
  PITCH_COURSES.map((course) => {
    const atBats = seeds[course]?.atBats ?? 0;
    const hits = seeds[course]?.hits ?? 0;
    return {
      course,
      row: pitchCourseRow(course),
      col: pitchCourseCol(course),
      is_strike_zone: isStrikeZoneCourse(course),
      plate_appearances: atBats,
      at_bats: atBats,
      hits,
      batting_average: atBats > 0 ? Number((hits / atBats).toFixed(3)) : 0,
      is_reliable: atBats >= 3,
    };
  });

const COURSE_DATA: PitchCourseData = {
  zones: buildZones({ 13: { atBats: 4, hits: 1 } }),
  strike_zone: {
    plate_appearances: 4,
    at_bats: 4,
    hits: 1,
    batting_average: 0.25,
  },
  ball_zone: { plate_appearances: 0, at_bats: 0, hits: 0, batting_average: 0 },
  total_target_pa: 4,
  min_at_bats: 3,
};

const PITCHER_DATA: PitcherFaceoffCourseData = {
  rows: [
    {
      id: 11,
      label: "エース投手",
      team_name: "相手高校",
      plate_appearances: 5,
      zones: buildZones({ 19: { atBats: 5, hits: 4 } }),
    },
    {
      id: 12,
      label: "控え投手",
      team_name: null,
      plate_appearances: 3,
      zones: buildZones({ 7: { atBats: 3, hits: 0 } }),
    },
  ],
  total_target_pa: 8,
  min_at_bats: 3,
  min_plate_appearances: 3,
};

describe("PitchCourseCard の投手別タブ", () => {
  it("タブを開くまで投手別の集計を取得しない", () => {
    const loadPitcherCross = jest.fn().mockResolvedValue(PITCHER_DATA);
    render(
      <PitchCourseCard
        data={COURSE_DATA}
        loadPitcherCross={loadPitcherCross}
      />,
    );

    expect(screen.getByRole("button", { name: "投手別" })).toBeInTheDocument();
    expect(loadPitcherCross).not.toHaveBeenCalled();
  });

  it("投手を選ぶとその投手のコース別打率に切り替わる", async () => {
    const user = userEvent.setup();
    render(
      <PitchCourseCard
        data={COURSE_DATA}
        loadPitcherCross={async () => PITCHER_DATA}
      />,
    );

    await user.click(screen.getByRole("button", { name: "投手別" }));

    expect(screen.getByRole("button", { name: "投手別" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const selector = await screen.findByRole("combobox", { name: "対戦投手" });
    expect(
      screen.getByRole("option", { name: "エース投手（相手高校） 5打席" }),
    ).toBeInTheDocument();
    expect(screen.getByText(".800")).toBeInTheDocument();

    await user.selectOptions(
      selector,
      screen.getByRole("option", { name: "控え投手 3打席" }),
    );

    expect(screen.getByText(".000")).toBeInTheDocument();
    expect(screen.queryByText(".800")).not.toBeInTheDocument();
  });

  it("しきい値以上の投手がいなければその旨を表示する", async () => {
    const user = userEvent.setup();
    render(
      <PitchCourseCard
        data={COURSE_DATA}
        loadPitcherCross={async () => ({ ...PITCHER_DATA, rows: [] })}
      />,
    );

    await user.click(screen.getByRole("button", { name: "投手別" }));

    expect(
      await screen.findByText(
        "コースを記録した対戦が3打席以上の投手がいません",
      ),
    ).toBeInTheDocument();
  });

  it("取得に失敗しても読み込み中のまま止まらず、押し直すと再取得する", async () => {
    const user = userEvent.setup();
    const loadPitcherCross = jest
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(PITCHER_DATA);
    render(
      <PitchCourseCard
        data={COURSE_DATA}
        loadPitcherCross={loadPitcherCross}
      />,
    );

    await user.click(screen.getByRole("button", { name: "投手別" }));
    expect(
      await screen.findByText("投手別のデータを取得できませんでした"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "コース別" }));
    await user.click(screen.getByRole("button", { name: "投手別" }));

    expect(
      await screen.findByRole("combobox", { name: "対戦投手" }),
    ).toBeInTheDocument();
    expect(loadPitcherCross).toHaveBeenCalledTimes(2);
  });

  it("ローダが無ければタブを出さない", () => {
    render(<PitchCourseCard data={COURSE_DATA} />);

    expect(
      screen.queryByRole("button", { name: "投手別" }),
    ).not.toBeInTheDocument();
  });
});

describe("PitchCourseCard の球種別タブ", () => {
  const PITCH_TYPE_DATA: PitchCoursePitchTypeData = {
    rows: [
      {
        id: 1,
        label: "ストレート系",
        plate_appearances: 0,
        zones: buildZones({}),
      },
      {
        id: 2,
        label: "スライダー系",
        plate_appearances: 4,
        zones: buildZones({ 13: { atBats: 4, hits: 3 } }),
      },
    ],
    total_target_pa: 4,
    min_at_bats: 3,
  };

  it("打席のある先頭の球種を初期選択する", async () => {
    const user = userEvent.setup();
    render(
      <PitchCourseCard
        data={COURSE_DATA}
        loadPitchTypeCross={async () => PITCH_TYPE_DATA}
      />,
    );

    await user.click(screen.getByRole("button", { name: "球種別" }));

    expect(
      await screen.findByRole("button", { name: "スライダー系 (4)" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(".750")).toBeInTheDocument();
  });

  it("タブを往復しても取得は1回だけ", async () => {
    const user = userEvent.setup();
    const loadPitchTypeCross = jest.fn().mockResolvedValue(PITCH_TYPE_DATA);
    const loadPitcherCross = jest.fn().mockResolvedValue(PITCHER_DATA);
    render(
      <PitchCourseCard
        data={COURSE_DATA}
        loadPitchTypeCross={loadPitchTypeCross}
        loadPitcherCross={loadPitcherCross}
      />,
    );

    await user.click(screen.getByRole("button", { name: "球種別" }));
    await screen.findByRole("button", { name: "スライダー系 (4)" });
    await user.click(screen.getByRole("button", { name: "投手別" }));
    await screen.findByRole("combobox", { name: "対戦投手" });
    await user.click(screen.getByRole("button", { name: "球種別" }));
    await user.click(screen.getByRole("button", { name: "投手別" }));

    expect(loadPitchTypeCross).toHaveBeenCalledTimes(1);
    expect(loadPitcherCross).toHaveBeenCalledTimes(1);
  });
});
