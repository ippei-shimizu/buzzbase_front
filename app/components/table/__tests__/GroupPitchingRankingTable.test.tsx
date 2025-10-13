import { render, screen } from "@testing-library/react";
import GroupPitchingRankingTable from "../GroupPitchingRankingTable";

describe("GroupPitchingRankingTable", () => {
  const mockPitchingAggregate = [
    {
      win: 5,
      hold: 2,
      saves: 10,
      strikeouts: 50,
      name: "テスト投手1",
      user_id: "test_pitcher_1",
      image_url: "/pitcher1.jpg",
    },
    {
      win: 3,
      hold: 5,
      saves: 5,
      strikeouts: 40,
      name: "テスト投手2",
      user_id: "test_pitcher_2",
      image_url: "/pitcher2.jpg",
    },
  ];

  const mockPitchingStats = [
    {
      era: 2.5,
      win_percentage: 0.7,
      name: "テスト投手1",
      user_id: "test_pitcher_1",
      image_url: "/pitcher1.jpg",
    },
    {
      era: 3.2,
      win_percentage: 0.6,
      name: "テスト投手2",
      user_id: "test_pitcher_2",
      image_url: "/pitcher2.jpg",
    },
  ];

  it("防御率ランキングが正しくレンダリングされる", () => {
    render(
      <GroupPitchingRankingTable
        pitchingAggregate={mockPitchingAggregate}
        pitchingStats={mockPitchingStats}
      />,
    );

    expect(screen.getByText("防御率")).toBeInTheDocument();
    // 複数のセクションにユーザー名が表示されるのでgetAllByTextを使用
    const userNames = screen.getAllByText("テスト投手1");
    expect(userNames.length).toBeGreaterThan(0);
  });

  it("防御率が低い順（良い順）にソートされている", () => {
    render(
      <GroupPitchingRankingTable
        pitchingAggregate={mockPitchingAggregate}
        pitchingStats={mockPitchingStats}
      />,
    );

    const eraSection = screen.getByLabelText("防御率");
    const userNames = eraSection.querySelectorAll('[class*="justify-start"]');

    // 防御率が低い方が最初（テスト投手1: 2.50）
    expect(userNames[0]).toHaveTextContent("テスト投手1");
  });

  it("勝利数が多い順にソートされている", () => {
    render(
      <GroupPitchingRankingTable
        pitchingAggregate={mockPitchingAggregate}
        pitchingStats={mockPitchingStats}
      />,
    );

    const winSection = screen.getByLabelText("勝利");
    expect(winSection).toBeInTheDocument();

    // 勝利数が多い方が最初（テスト投手1: 5勝）
    const userNames = winSection.querySelectorAll('[class*="justify-start"]');
    expect(userNames[0]).toHaveTextContent("テスト投手1");
  });

  it("セーブ数が多い順にソートされている", () => {
    render(
      <GroupPitchingRankingTable
        pitchingAggregate={mockPitchingAggregate}
        pitchingStats={mockPitchingStats}
      />,
    );

    const savesSection = screen.getByLabelText("セーブ");
    expect(savesSection).toBeInTheDocument();

    // セーブ数が多い方が最初（テスト投手1: 10セーブ）
    const userNames = savesSection.querySelectorAll('[class*="justify-start"]');
    expect(userNames[0]).toHaveTextContent("テスト投手1");
  });

  it("HP（ホールド）が多い順にソートされている", () => {
    render(
      <GroupPitchingRankingTable
        pitchingAggregate={mockPitchingAggregate}
        pitchingStats={mockPitchingStats}
      />,
    );

    const hpSection = screen.getByLabelText("HP");
    expect(hpSection).toBeInTheDocument();

    // ホールドが多い方が最初（テスト投手2: 5ホールド）
    const userNames = hpSection.querySelectorAll('[class*="justify-start"]');
    expect(userNames[0]).toHaveTextContent("テスト投手2");
  });

  it("奪三振が多い順にソートされている", () => {
    render(
      <GroupPitchingRankingTable
        pitchingAggregate={mockPitchingAggregate}
        pitchingStats={mockPitchingStats}
      />,
    );

    const strikeoutsSection = screen.getByLabelText("奪三振");
    expect(strikeoutsSection).toBeInTheDocument();

    // 奪三振が多い方が最初（テスト投手1: 50）
    const userNames = strikeoutsSection.querySelectorAll(
      '[class*="justify-start"]',
    );
    expect(userNames[0]).toHaveTextContent("テスト投手1");
  });

  it("勝率が高い順にソートされている", () => {
    render(
      <GroupPitchingRankingTable
        pitchingAggregate={mockPitchingAggregate}
        pitchingStats={mockPitchingStats}
      />,
    );

    const winPercentageSection = screen.getByLabelText("勝率");
    expect(winPercentageSection).toBeInTheDocument();

    // 勝率が高い方が最初（テスト投手1: 0.700）
    const userNames = winPercentageSection.querySelectorAll(
      '[class*="justify-start"]',
    );
    expect(userNames[0]).toHaveTextContent("テスト投手1");
  });

  it("ユーザーへのリンクが正しく設定されている", () => {
    render(
      <GroupPitchingRankingTable
        pitchingAggregate={mockPitchingAggregate}
        pitchingStats={mockPitchingStats}
      />,
    );

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/mypage/test_pitcher_1");
  });

  it("データがundefinedの場合でもエラーにならない", () => {
    render(
      <GroupPitchingRankingTable
        pitchingAggregate={undefined}
        pitchingStats={undefined}
      />,
    );

    expect(screen.getByText("防御率")).toBeInTheDocument();
    expect(screen.getByText("勝利")).toBeInTheDocument();
  });
});
