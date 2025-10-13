import { render, screen } from "@testing-library/react";
import GroupBattingRankingTable from "../GroupBattingRankingTable";

describe("GroupBattingRankingTable", () => {
  const mockBattingAverage = [
    {
      hit: 10,
      home_run: 2,
      id: 1,
      runs_batted_in: 5,
      stealing_base: 3,
      name: "テストユーザー1",
      user_id: "test_user_1",
      image_url: "/test1.jpg",
    },
    {
      hit: 8,
      home_run: 3,
      id: 2,
      runs_batted_in: 7,
      stealing_base: 1,
      name: "テストユーザー2",
      user_id: "test_user_2",
      image_url: "/test2.jpg",
    },
  ];

  const mockBattingStats = [
    {
      batting_average: 0.35,
      on_base_percentage: 0.42,
      name: "テストユーザー1",
      user_id: "test_user_1",
      image_url: "/test1.jpg",
    },
    {
      batting_average: 0.28,
      on_base_percentage: 0.35,
      name: "テストユーザー2",
      user_id: "test_user_2",
      image_url: "/test2.jpg",
    },
  ];

  it("打率ランキングが正しくレンダリングされる", () => {
    render(
      <GroupBattingRankingTable
        battingAverage={mockBattingAverage}
        battingStats={mockBattingStats}
      />,
    );

    expect(screen.getByText("打率")).toBeInTheDocument();
    // 複数のセクションにユーザー名が表示されるのでgetAllByTextを使用
    const userNames = screen.getAllByText("テストユーザー1");
    expect(userNames.length).toBeGreaterThan(0);
  });

  it("打率が高い順にソートされている", () => {
    render(
      <GroupBattingRankingTable
        battingAverage={mockBattingAverage}
        battingStats={mockBattingStats}
      />,
    );

    // 打率セクション内のユーザー名を取得
    const battingAverageSection = screen.getByLabelText("打率");
    const userNames = battingAverageSection.querySelectorAll(
      '[class*="justify-start"]',
    );

    // 最初のユーザーは打率が高い方（テストユーザー1: 0.350）
    expect(userNames[0]).toHaveTextContent("テストユーザー1");
  });

  it("本塁打ランキングが多い順にソートされている", () => {
    render(
      <GroupBattingRankingTable
        battingAverage={mockBattingAverage}
        battingStats={mockBattingStats}
      />,
    );

    const homeRunSection = screen.getByLabelText("本塁打");
    expect(homeRunSection).toBeInTheDocument();

    // 本塁打が多い方が最初（テストユーザー2: 3本）
    const userNames = homeRunSection.querySelectorAll(
      '[class*="justify-start"]',
    );
    expect(userNames[0]).toHaveTextContent("テストユーザー2");
  });

  it("打点ランキングが多い順にソートされている", () => {
    render(
      <GroupBattingRankingTable
        battingAverage={mockBattingAverage}
        battingStats={mockBattingStats}
      />,
    );

    const rbiSection = screen.getByLabelText("打点");
    expect(rbiSection).toBeInTheDocument();

    // 打点が多い方が最初（テストユーザー2: 7打点）
    const userNames = rbiSection.querySelectorAll('[class*="justify-start"]');
    expect(userNames[0]).toHaveTextContent("テストユーザー2");
  });

  it("ユーザーへのリンクが正しく設定されている", () => {
    render(
      <GroupBattingRankingTable
        battingAverage={mockBattingAverage}
        battingStats={mockBattingStats}
      />,
    );

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/mypage/test_user_1");
  });

  it("データがundefinedの場合でもエラーにならない", () => {
    render(
      <GroupBattingRankingTable
        battingAverage={undefined}
        battingStats={undefined}
      />,
    );

    expect(screen.getByText("打率")).toBeInTheDocument();
    expect(screen.getByText("本塁打")).toBeInTheDocument();
  });
});
