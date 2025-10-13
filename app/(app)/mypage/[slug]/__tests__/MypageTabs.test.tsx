import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MyPage from "../page";

// Hooksをモック
jest.mock("@app/hooks/user/getUserIdData", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    userData: {
      user: {
        id: 1,
        image: { url: "/test.jpg" },
        name: "テストユーザー",
        user_id: "test_user",
        url: "https://example.com",
        introduction: "テスト自己紹介",
        positions: [{ id: "1", name: "投手" }],
        team_id: 1,
      },
      isFollowing: false,
      followers_count: 10,
      following_count: 5,
    },
    isLoadingUsers: false,
    isErrorUser: false,
  })),
}));

jest.mock("@app/hooks/team/getTeams", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    teamData: {
      name: "テストチーム",
      category_name: "一般",
      prefecture_name: "東京都",
    },
    isLoadingTeams: false,
  })),
}));

jest.mock("@app/hooks/user/getUserAwards", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    userAwards: [
      { id: 1, title: "MVP" },
      { id: 2, title: "首位打者" },
    ],
    isLoadingAwards: false,
  })),
}));

jest.mock("@app/hooks/user/useCurrentUserId", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    currentUserId: { id: 1 },
    isLoadingCurrentUserId: false,
  })),
}));

// コンポーネントをモック
jest.mock("@app/components/header/Header", () => {
  return function Header() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock("@app/components/user/AvatarComponent", () => {
  return function AvatarComponent() {
    return <div data-testid="avatar">Avatar</div>;
  };
});

jest.mock("@app/components/button/FollowButton", () => {
  return function FollowButton() {
    return <button data-testid="follow-button">フォロー</button>;
  };
});

jest.mock("@app/components/share/ProfileShareComponent", () => {
  return function ProfileShareComponent() {
    return <div data-testid="share">Share</div>;
  };
});

jest.mock("@app/components/user/IndividualResultsList", () => {
  return function IndividualResultsList({ userId }: { userId: number }) {
    return (
      <div data-testid="individual-results">
        個人成績コンテンツ (userId: {userId})
      </div>
    );
  };
});

jest.mock("@app/components/user/MatchResultList", () => {
  return function MatchResultList({ userId }: { userId: number }) {
    return (
      <div data-testid="match-results">試合コンテンツ (userId: {userId})</div>
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

describe("MyPage - Tabs Component (NextUI v2.6.11)", () => {
  it("タブが正しくレンダリングされる", () => {
    render(<MyPage />);

    // 「成績」と「試合」の2つのタブが表示される
    expect(screen.getByText("成績")).toBeInTheDocument();
    expect(screen.getByText("試合")).toBeInTheDocument();
  });

  it("初期状態で最初のタブ（成績）のコンテンツが表示される", () => {
    render(<MyPage />);

    // 成績タブのコンテンツが表示される
    expect(screen.getByTestId("individual-results")).toBeInTheDocument();
    expect(screen.getByText(/個人成績コンテンツ/)).toBeInTheDocument();

    // 試合タブのコンテンツは表示されない
    expect(screen.queryByTestId("match-results")).not.toBeInTheDocument();
  });

  it("タブをクリックすると対応するコンテンツが表示される", async () => {
    const user = userEvent.setup();
    render(<MyPage />);

    // 最初は成績タブが表示されている
    expect(screen.getByTestId("individual-results")).toBeInTheDocument();

    // 試合タブをクリック
    const matchTab = screen.getByText("試合");
    await user.click(matchTab);

    // 試合タブのコンテンツが表示される
    await waitFor(() => {
      expect(screen.getByTestId("match-results")).toBeInTheDocument();
      expect(screen.getByText(/試合コンテンツ/)).toBeInTheDocument();
    });

    // 成績タブのコンテンツは表示されない
    expect(screen.queryByTestId("individual-results")).not.toBeInTheDocument();
  });

  it("タブを切り替えて元に戻れる", async () => {
    const user = userEvent.setup();
    render(<MyPage />);

    // 試合タブをクリック
    await user.click(screen.getByText("試合"));
    await waitFor(() => {
      expect(screen.getByTestId("match-results")).toBeInTheDocument();
    });

    // 成績タブに戻る
    await user.click(screen.getByText("成績"));
    await waitFor(() => {
      expect(screen.getByTestId("individual-results")).toBeInTheDocument();
    });

    // 試合タブのコンテンツは表示されない
    expect(screen.queryByTestId("match-results")).not.toBeInTheDocument();
  });

  it("タブがaria-labelを持っている", () => {
    render(<MyPage />);

    // aria-labelが設定されている
    const tabsContainers = screen.getAllByLabelText("Tabs colors");
    expect(tabsContainers.length).toBeGreaterThan(0);
  });

  it("タブの数が正しい", () => {
    render(<MyPage />);

    // roleがtabの要素を取得
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(2);
  });

  it("選択されたタブにaria-selectedが設定される", async () => {
    const user = userEvent.setup();
    render(<MyPage />);

    const tabs = screen.getAllByRole("tab");

    // 最初のタブ（成績）が選択されている
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");

    // 2番目のタブ（試合）をクリック
    await user.click(tabs[1]);

    await waitFor(() => {
      expect(tabs[1]).toHaveAttribute("aria-selected", "true");
      expect(tabs[0]).toHaveAttribute("aria-selected", "false");
    });
  });

  it("各タブのコンテンツに正しいuserIdが渡される", () => {
    render(<MyPage />);

    // 成績タブのコンテンツにuserIdが渡されている
    expect(screen.getByText(/userId: 1/)).toBeInTheDocument();
  });

  it("ページ全体が正しくレンダリングされる", () => {
    render(<MyPage />);

    // ヘッダーが表示される
    expect(screen.getByTestId("header")).toBeInTheDocument();

    // アバターが表示される
    expect(screen.getByTestId("avatar")).toBeInTheDocument();

    // ユーザー情報が表示される
    expect(screen.getByText("テスト自己紹介")).toBeInTheDocument();
    expect(screen.getByText("投手")).toBeInTheDocument();
    expect(screen.getByText(/テストチーム/)).toBeInTheDocument();
    expect(screen.getByText("MVP")).toBeInTheDocument();
    expect(screen.getByText("首位打者")).toBeInTheDocument();

    // フォロー情報が表示される
    expect(screen.getByText("5")).toBeInTheDocument(); // following_count
    expect(screen.getByText("10")).toBeInTheDocument(); // followers_count
  });
});
