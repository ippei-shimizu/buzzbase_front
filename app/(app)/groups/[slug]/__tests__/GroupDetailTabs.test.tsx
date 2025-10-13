import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GroupDetail from "../page";

// サービスをモック
jest.mock("@app/services/groupService", () => ({
  getGroupDetail: jest.fn(() =>
    Promise.resolve({
      accepted_users: [
        {
          id: 1,
          image: { url: "/user1.jpg" },
          name: "ユーザー1",
          user_id: "user_1",
        },
        {
          id: 2,
          image: { url: "/user2.jpg" },
          name: "ユーザー2",
          user_id: "user_2",
        },
      ],
      batting_averages: [
        {
          hit: 10,
          home_run: 2,
          id: 1,
          runs_batted_in: 5,
          stealing_base: 3,
          user_id: 1,
        },
      ],
      batting_stats: [
        {
          batting_average: 0.35,
          on_base_percentage: 0.42,
          user_id: 1,
        },
      ],
      pitching_aggregate: [
        {
          win: 5,
          hold: 2,
          saves: 10,
          strikeouts: 50,
          user_id: 1,
        },
      ],
      pitching_stats: [
        {
          era: 2.5,
          win_percentage: 0.7,
          user_id: 1,
        },
      ],
      group: {
        icon: { url: "/group.jpg" },
        name: "テストグループ",
      },
      id: 1,
    }),
  ),
}));

// コンポーネントをモック
jest.mock("@app/components/header/HeaderBackLink", () => {
  return function HeaderBackLink() {
    return <div data-testid="header-back-link">Header Back Link</div>;
  };
});

jest.mock("@app/components/spinner/LoadingSpinner", () => {
  return function LoadingSpinner() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

jest.mock("@app/components/table/GroupBattingRankingTable", () => {
  return function GroupBattingRankingTable({
    battingAverage,
    battingStats,
  }: any) {
    return (
      <div data-testid="batting-ranking-table">
        打撃成績ランキングテーブル
        <div>打撃データ数: {battingAverage?.length || 0}</div>
        <div>打撃統計数: {battingStats?.length || 0}</div>
      </div>
    );
  };
});

jest.mock("@app/components/table/GroupPitchingRankingTable", () => {
  return function GroupPitchingRankingTable({
    pitchingAggregate,
    pitchingStats,
  }: any) {
    return (
      <div data-testid="pitching-ranking-table">
        投手成績ランキングテーブル
        <div>投手データ数: {pitchingAggregate?.length || 0}</div>
        <div>投手統計数: {pitchingStats?.length || 0}</div>
      </div>
    );
  };
});

jest.mock("@app/contexts/useAuthContext", () => ({
  useAuthContext: jest.fn(() => ({
    isLoggedIn: true,
  })),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// react-anchor-link-smooth-scrollをモック
jest.mock("react-anchor-link-smooth-scroll", () => {
  return function AnchorLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

describe("GroupDetail - Tabs Component (NextUI v2.6.11)", () => {
  const mockParams = { params: { slug: 1 } };

  it("タブが正しくレンダリングされる", async () => {
    render(<GroupDetail {...mockParams} />);

    // データ取得を待つ
    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    // 「打撃成績」と「投手成績」の2つのタブが表示される
    expect(screen.getByText("打撃成績")).toBeInTheDocument();
    expect(screen.getByText("投手成績")).toBeInTheDocument();
  });

  it("初期状態で最初のタブ（打撃成績）のコンテンツが表示される", async () => {
    render(<GroupDetail {...mockParams} />);

    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    // 打撃成績タブのナビゲーションボタンが表示される
    expect(screen.getByText("打率")).toBeInTheDocument();
    expect(screen.getByText("本塁打")).toBeInTheDocument();
    expect(screen.getByText("打点")).toBeInTheDocument();

    // 打撃成績ランキングテーブルが表示される
    expect(screen.getByTestId("batting-ranking-table")).toBeInTheDocument();

    // 投手成績のナビゲーションボタンは表示されない
    expect(screen.queryByText("防御率")).not.toBeInTheDocument();
    expect(screen.queryByText("勝利")).not.toBeInTheDocument();
  });

  it("タブをクリックすると対応するコンテンツが表示される", async () => {
    const user = userEvent.setup();
    render(<GroupDetail {...mockParams} />);

    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    // 最初は打撃成績が表示されている
    expect(screen.getByTestId("batting-ranking-table")).toBeInTheDocument();

    // 投手成績タブをクリック
    const pitchingTab = screen.getByText("投手成績");
    await user.click(pitchingTab);

    // 投手成績のコンテンツが表示される
    await waitFor(() => {
      expect(screen.getByTestId("pitching-ranking-table")).toBeInTheDocument();
    });

    // 投手成績のナビゲーションボタンが表示される
    await waitFor(() => {
      expect(screen.getByText("防御率")).toBeInTheDocument();
      expect(screen.getByText("勝利")).toBeInTheDocument();
      expect(screen.getByText("セーブ")).toBeInTheDocument();
    });

    // 打撃成績のナビゲーションボタンは表示されない
    expect(screen.queryByText("打率")).not.toBeInTheDocument();
  });

  it("タブを切り替えるとナビゲーションボタンが変わる", async () => {
    const user = userEvent.setup();
    render(<GroupDetail {...mockParams} />);

    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    // 打撃成績タブのナビゲーションボタンが表示されている
    expect(screen.getByText("打率")).toBeInTheDocument();

    // 投手成績タブをクリック
    await user.click(screen.getByText("投手成績"));

    // 投手成績タブのナビゲーションボタンが表示される
    await waitFor(() => {
      expect(screen.getByText("防御率")).toBeInTheDocument();
    });

    // 打撃成績タブのナビゲーションボタンは表示されない
    expect(screen.queryByText("打率")).not.toBeInTheDocument();

    // 打撃成績タブに戻る
    await user.click(screen.getByText("打撃成績"));

    // 打撃成績タブのナビゲーションボタンが再度表示される
    await waitFor(() => {
      expect(screen.getByText("打率")).toBeInTheDocument();
    });
  });

  it("タブがaria-labelを持っている", async () => {
    render(<GroupDetail {...mockParams} />);

    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    // aria-labelが設定されている
    const tabsContainers = screen.getAllByLabelText("成績種類");
    expect(tabsContainers.length).toBeGreaterThan(0);
  });

  it("タブの数が正しい", async () => {
    render(<GroupDetail {...mockParams} />);

    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    // roleがtabの要素を取得
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(2);
  });

  it("選択されたタブにaria-selectedが設定される", async () => {
    const user = userEvent.setup();
    render(<GroupDetail {...mockParams} />);

    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    const tabs = screen.getAllByRole("tab");

    // 最初のタブ（打撃成績）が選択されている
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");

    // 2番目のタブ（投手成績）をクリック
    await user.click(tabs[1]);

    await waitFor(() => {
      expect(tabs[1]).toHaveAttribute("aria-selected", "true");
      expect(tabs[0]).toHaveAttribute("aria-selected", "false");
    });
  });

  it("各タブにナビゲーションボタンが表示される", async () => {
    const user = userEvent.setup();
    render(<GroupDetail {...mockParams} />);

    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    // 打撃成績タブのナビゲーションボタン
    expect(screen.getByText("打率")).toBeInTheDocument();
    expect(screen.getByText("本塁打")).toBeInTheDocument();
    expect(screen.getByText("打点")).toBeInTheDocument();
    expect(screen.getByText("安打")).toBeInTheDocument();
    expect(screen.getByText("盗塁")).toBeInTheDocument();
    expect(screen.getByText("出塁率")).toBeInTheDocument();

    // 投手成績タブに切り替え
    await user.click(screen.getByText("投手成績"));

    // 投手成績タブのナビゲーションボタン
    await waitFor(() => {
      expect(screen.getByText("防御率")).toBeInTheDocument();
      expect(screen.getByText("勝利")).toBeInTheDocument();
      expect(screen.getByText("セーブ")).toBeInTheDocument();
      expect(screen.getByText("HP")).toBeInTheDocument();
      expect(screen.getByText("奪三振")).toBeInTheDocument();
      expect(screen.getByText("勝率")).toBeInTheDocument();
    });
  });

  it("ページ全体が正しくレンダリングされる", async () => {
    render(<GroupDetail {...mockParams} />);

    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    // ヘッダーが表示される
    expect(screen.getByTestId("header-back-link")).toBeInTheDocument();

    // タイトルが表示される
    expect(screen.getByText("個人成績ランキング")).toBeInTheDocument();

    // 複数のボタンが表示される（タブボタン、ナビゲーションボタン、メニューボタン）
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("データが正しくランキングテーブルに渡される", async () => {
    render(<GroupDetail {...mockParams} />);

    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    // 打撃データが正しく渡されている
    expect(screen.getByText("打撃データ数: 1")).toBeInTheDocument();
    expect(screen.getByText("打撃統計数: 1")).toBeInTheDocument();
  });
});
