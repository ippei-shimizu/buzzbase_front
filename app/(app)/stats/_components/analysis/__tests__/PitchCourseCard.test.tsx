import type {
  PitchCourseData,
  PitchCoursePitchTypeData,
  PitchCourseZone,
  PitcherFaceoffCourseData,
} from "../../../analysisActions";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PITCH_COURSES,
  isStrikeZoneCourse,
  pitchCourseCol,
  pitchCourseRow,
} from "@app/constants/pitchCourse";
import { PitchCourseCard } from "../PitchCourseCard";

interface ZoneSeed {
  atBats: number;
  hits: number;
  plateAppearances?: number;
  totalBases?: number;
  strikeouts?: number;
  swingingStrikeouts?: number;
  lookingStrikeouts?: number;
}

const buildZones = (seeds: Record<number, ZoneSeed>): PitchCourseZone[] =>
  PITCH_COURSES.map((course) => {
    const seed = seeds[course];
    const atBats = seed?.atBats ?? 0;
    const hits = seed?.hits ?? 0;
    return {
      course,
      row: pitchCourseRow(course),
      col: pitchCourseCol(course),
      is_strike_zone: isStrikeZoneCourse(course),
      plate_appearances: seed?.plateAppearances ?? atBats,
      at_bats: atBats,
      hits,
      batting_average: atBats > 0 ? Number((hits / atBats).toFixed(3)) : 0,
      total_bases: seed?.totalBases ?? hits,
      strikeouts: seed?.strikeouts ?? 0,
      swinging_strikeouts: seed?.swingingStrikeouts ?? 0,
      looking_strikeouts: seed?.lookingStrikeouts ?? 0,
      is_reliable: atBats >= 3,
    };
  });

const summarize = (
  zones: PitchCourseZone[],
): PitchCourseData["strike_zone"] => {
  const sumOf = (pick: (zone: PitchCourseZone) => number) =>
    zones.reduce((sum, zone) => sum + pick(zone), 0);
  const atBats = sumOf((zone) => zone.at_bats);
  const hits = sumOf((zone) => zone.hits);
  return {
    plate_appearances: sumOf((zone) => zone.plate_appearances),
    at_bats: atBats,
    hits,
    batting_average: atBats > 0 ? Number((hits / atBats).toFixed(3)) : 0,
    total_bases: sumOf((zone) => zone.total_bases),
    strikeouts: sumOf((zone) => zone.strikeouts),
    swinging_strikeouts: sumOf((zone) => zone.swinging_strikeouts),
    looking_strikeouts: sumOf((zone) => zone.looking_strikeouts),
  };
};

const buildCourseData = (seeds: Record<number, ZoneSeed>): PitchCourseData => {
  const zones = buildZones(seeds);
  const strikeZone = summarize(zones.filter((zone) => zone.is_strike_zone));
  const ballZone = summarize(zones.filter((zone) => !zone.is_strike_zone));
  return {
    zones,
    strike_zone: strikeZone,
    ball_zone: ballZone,
    total_target_pa: strikeZone.plate_appearances + ballZone.plate_appearances,
    min_at_bats: 3,
  };
};

const COURSE_DATA = buildCourseData({ 13: { atBats: 4, hits: 1 } });

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

describe("PitchCourseCard の指標・粒度切替", () => {
  const pitcherDataWith = (
    seeds: Record<number, ZoneSeed>,
  ): PitcherFaceoffCourseData => {
    const zones = buildZones(seeds);
    const plateAppearances = zones.reduce(
      (sum, zone) => sum + zone.plate_appearances,
      0,
    );
    return {
      rows: [
        {
          id: 21,
          label: "対戦投手",
          team_name: null,
          plate_appearances: plateAppearances,
          zones,
        },
      ],
      total_target_pa: plateAppearances,
      min_at_bats: 3,
      min_plate_appearances: 3,
    };
  };

  const openPitcherTab = async (
    user: ReturnType<typeof userEvent.setup>,
    pitcherData: PitcherFaceoffCourseData,
  ) => {
    render(
      <PitchCourseCard
        data={COURSE_DATA}
        loadPitcherCross={async () => pitcherData}
      />,
    );
    await user.click(screen.getByRole("button", { name: "投手別" }));
    await screen.findByRole("combobox", { name: "対戦投手" });
  };

  it("見出しはコース別分析で、既定は打率・5x5", () => {
    render(<PitchCourseCard data={COURSE_DATA} />);

    expect(
      screen.getByRole("heading", { name: "コース別分析" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "打率" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "5x5" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("長打率に切り替えると塁打から計算した値を打数と併記する", async () => {
    const user = userEvent.setup();
    await openPitcherTab(
      user,
      pitcherDataWith({ 19: { atBats: 5, hits: 4, totalBases: 7 } }),
    );
    expect(screen.getByText(".800")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "長打率" }));

    expect(screen.getByText("1.400")).toBeInTheDocument();
    expect(screen.getByText("5打数")).toBeInTheDocument();
    expect(screen.queryByText(".800")).not.toBeInTheDocument();
  });

  it("三振率は打席を分母に%で表示し、三振の内訳を出す", async () => {
    const user = userEvent.setup();
    await openPitcherTab(
      user,
      pitcherDataWith({
        19: {
          atBats: 5,
          hits: 1,
          plateAppearances: 6,
          strikeouts: 2,
          swingingStrikeouts: 1,
        },
      }),
    );

    await user.click(screen.getByRole("button", { name: "三振率" }));

    expect(screen.getByText("33%")).toBeInTheDocument();
    expect(screen.getByText("6打席")).toBeInTheDocument();
    expect(
      screen.getByText("三振 2（空振り 1・見逃し 0・未入力 1）"),
    ).toBeInTheDocument();
  });

  it("3x3 では隣接コースの打数・安打を合算してから打率を出す", async () => {
    const user = userEvent.setup();
    await openPitcherTab(
      user,
      pitcherDataWith({
        1: { atBats: 2, hits: 2 },
        7: { atBats: 4, hits: 0 },
      }),
    );
    expect(screen.getByText("1.000")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "3x3" }));

    const highThirdBase = screen.getByRole("group", { name: "高め・三塁側" });
    expect(within(highThirdBase).getByText(".333")).toBeInTheDocument();
    expect(within(highThirdBase).getByText("6打数")).toBeInTheDocument();
    expect(screen.queryByText("1.000")).not.toBeInTheDocument();
  });

  it("最低母数未満のセルは半透明にし、畳んで母数が揃えば通常表示にする", async () => {
    const user = userEvent.setup();
    await openPitcherTab(
      user,
      pitcherDataWith({
        1: { atBats: 2, hits: 1 },
        2: { atBats: 2, hits: 0 },
      }),
    );
    expect(screen.getByText(".500").parentElement).toHaveStyle({
      opacity: "0.5",
    });

    await user.click(screen.getByRole("button", { name: "3x3" }));

    expect(screen.getByText(".250").parentElement).toHaveStyle({
      opacity: "1",
    });
  });

  it("高低・内外では1打席を高低と内外の両方に数える", async () => {
    const user = userEvent.setup();
    await openPitcherTab(
      user,
      pitcherDataWith({
        1: { atBats: 2, hits: 1 },
        13: { atBats: 2, hits: 0 },
      }),
    );

    await user.click(screen.getByRole("button", { name: "打席分布" }));
    await user.click(screen.getByRole("button", { name: "高低・内外" }));

    expect(screen.getByText("高め")).toBeInTheDocument();
    expect(screen.getByText("三塁側")).toBeInTheDocument();
    expect(screen.getAllByText("2打席")).toHaveLength(2);
    expect(screen.getAllByText("50%")).toHaveLength(2);
    expect(
      screen.getByText("真ん中の1行・1列はどちらにも含めていません"),
    ).toBeInTheDocument();
  });

  it("ゾーン別サマリーは打率なら (打数-安打)、他の指標では分母を添える", async () => {
    const user = userEvent.setup();
    render(
      <PitchCourseCard
        data={buildCourseData({
          13: { atBats: 4, hits: 1 },
          1: { atBats: 2, hits: 2 },
        })}
      />,
    );

    expect(screen.getByText("(4-1)")).toBeInTheDocument();
    expect(screen.getByText("(2-2)")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "長打率" }));

    expect(screen.queryByText("(4-1)")).not.toBeInTheDocument();
    expect(screen.getAllByText("4打数")).toHaveLength(2);
  });

  it("ゾーン別サマリーも最低母数未満なら半透明にする", () => {
    render(
      <PitchCourseCard
        data={buildCourseData({
          13: { atBats: 4, hits: 1 },
          1: { atBats: 2, hits: 2 },
        })}
      />,
    );

    expect(screen.getByText("ボールゾーン").parentElement).toHaveStyle({
      opacity: "0.5",
    });
    expect(screen.getByText("ストライクゾーン").parentElement).toHaveStyle({
      opacity: "1",
    });
  });

  it("コース別タブのゾーン内外ではゾーン別サマリーを重ねて出さない", async () => {
    const user = userEvent.setup();
    render(
      <PitchCourseCard
        data={buildCourseData({
          13: { atBats: 4, hits: 1 },
          1: { atBats: 2, hits: 2 },
        })}
      />,
    );
    expect(screen.getByText("ボールゾーン")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "ゾーン内外" }));

    expect(screen.getByText("ストライクゾーン")).toBeInTheDocument();
    expect(screen.getByText(".250")).toBeInTheDocument();
    expect(screen.getByText("1.000")).toBeInTheDocument();
  });

  it("指標と粒度はタブを切り替えても保持する", async () => {
    const user = userEvent.setup();
    render(
      <PitchCourseCard
        data={COURSE_DATA}
        loadPitcherCross={async () =>
          pitcherDataWith({
            7: { atBats: 3, hits: 1, plateAppearances: 4, strikeouts: 1 },
          })
        }
      />,
    );

    await user.click(screen.getByRole("button", { name: "三振率" }));
    await user.click(screen.getByRole("button", { name: "3x3" }));
    await user.click(screen.getByRole("button", { name: "投手別" }));
    await screen.findByRole("combobox", { name: "対戦投手" });

    expect(screen.getByRole("button", { name: "三振率" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "3x3" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("25%")).toBeInTheDocument();
  });
});
