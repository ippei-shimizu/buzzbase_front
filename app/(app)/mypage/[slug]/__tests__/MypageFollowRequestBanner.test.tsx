import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAuthContext } from "@app/contexts/useAuthContext";
import getUserIdData from "@app/hooks/user/getUserIdData";
import useCurrentUserId from "@app/hooks/user/useCurrentUserId";
import {
  acceptFollowRequest,
  rejectFollowRequest,
} from "@app/services/userService";
import MyPage from "../page";

jest.mock("@app/hooks/user/getUserIdData", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@app/hooks/user/useCurrentUserId", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@app/hooks/team/getTeams", () => ({
  __esModule: true,
  default: jest.fn(() => ({ teamData: null, isLoadingTeams: false })),
}));

jest.mock("@app/hooks/user/getUserAwards", () => ({
  __esModule: true,
  default: jest.fn(() => ({ userAwards: [], isLoadingAwards: false })),
}));

jest.mock("@app/contexts/useAuthContext", () => ({
  useAuthContext: jest.fn(),
}));

jest.mock("@app/services/userService", () => ({
  acceptFollowRequest: jest.fn(),
  rejectFollowRequest: jest.fn(),
  userFollow: jest.fn(),
  userUnFollow: jest.fn(),
}));

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
}));

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

jest.mock("@app/components/share/StatsShareComponent", () => {
  return function StatsShareComponent() {
    return <div data-testid="share">Share</div>;
  };
});

jest.mock("@app/components/user/IndividualResultsList", () => {
  return function IndividualResultsList() {
    return <div data-testid="individual-results">個人成績</div>;
  };
});

jest.mock("@app/components/user/MatchResultList", () => {
  return function MatchResultList() {
    return <div data-testid="match-results">試合</div>;
  };
});

jest.mock("@app/components/ad/AdInFeed", () => {
  return function AdInFeed() {
    return <div data-testid="ad" />;
  };
});

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

const BANNER_TEXT =
  "リクエストユーザーさんからフォローリクエストが届いています";

const mockGetUserIdData = getUserIdData as jest.Mock;
const mockUseCurrentUserId = useCurrentUserId as jest.Mock;
const mockUseAuthContext = useAuthContext as jest.Mock;
const mockAcceptFollowRequest = acceptFollowRequest as jest.Mock;
const mockRejectFollowRequest = rejectFollowRequest as jest.Mock;
const mockMutateUserData = jest.fn();

type UserDataOverrides = {
  incoming_follow_request_id?: number | null;
  follow_status?: string;
  is_private?: boolean;
  userId?: number;
};

const setUserData = ({
  incoming_follow_request_id = null,
  follow_status = "none",
  is_private = false,
  userId = 2,
}: UserDataOverrides = {}) => {
  mockGetUserIdData.mockReturnValue({
    userData: {
      user: {
        id: userId,
        image: { url: "/test.jpg" },
        name: "リクエストユーザー",
        user_id: "request_user",
        url: "https://example.com",
        introduction: "",
        positions: [],
        team_id: 1,
      },
      isFollowing: false,
      follow_status,
      is_private,
      followers_count: 3,
      following_count: 4,
      incoming_follow_request_id,
    },
    isLoadingUsers: false,
    isErrorUser: false,
    mutateUserData: mockMutateUserData,
  });
};

describe("MyPage - フォローリクエストバナー", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthContext.mockReturnValue({ isLoggedIn: true, loading: false });
    mockUseCurrentUserId.mockReturnValue({
      currentUserId: { id: 1 },
      isLoadingCurrentUserId: false,
    });
    mockAcceptFollowRequest.mockResolvedValue({ status: "success" });
    mockRejectFollowRequest.mockResolvedValue({ status: "success" });
  });

  it("フォローリクエストが届いているときバナーが表示される", () => {
    setUserData({ incoming_follow_request_id: 42 });

    render(<MyPage />);

    expect(screen.getByText(BANNER_TEXT)).toBeInTheDocument();
  });

  it("フォローリクエストが届いていないときバナーは表示されない", () => {
    setUserData({ incoming_follow_request_id: null });

    render(<MyPage />);

    expect(screen.queryByText(BANNER_TEXT)).not.toBeInTheDocument();
  });

  it("自分のプロフィールではバナーを表示しない", () => {
    setUserData({ incoming_follow_request_id: 42, userId: 1 });

    render(<MyPage />);

    expect(screen.queryByText(BANNER_TEXT)).not.toBeInTheDocument();
  });

  it("未ログインのときバナーを表示しない", () => {
    mockUseAuthContext.mockReturnValue({ isLoggedIn: false, loading: false });
    setUserData({ incoming_follow_request_id: 42 });

    render(<MyPage />);

    expect(screen.queryByText(BANNER_TEXT)).not.toBeInTheDocument();
  });

  it("非公開アカウントで成績が閲覧できない場合でもバナーは表示される", () => {
    setUserData({
      incoming_follow_request_id: 42,
      is_private: true,
      follow_status: "none",
    });

    render(<MyPage />);

    expect(screen.getByText(BANNER_TEXT)).toBeInTheDocument();
    expect(screen.getByText("このアカウントは非公開です")).toBeInTheDocument();
  });

  it("承認するとプロフィールが再検証され、フォローボタンの表示が最新の状態に追従する", async () => {
    const user = userEvent.setup();
    setUserData({ incoming_follow_request_id: 42, follow_status: "none" });

    const { rerender } = render(<MyPage />);
    expect(
      screen.getByRole("button", { name: "フォローする" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "承認する" }));

    await waitFor(() => {
      expect(mockAcceptFollowRequest).toHaveBeenCalledWith(42);
      expect(mockMutateUserData).toHaveBeenCalled();
    });

    setUserData({
      incoming_follow_request_id: null,
      follow_status: "following",
    });
    rerender(<MyPage />);

    expect(
      screen.getByRole("button", { name: "フォロー中" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(BANNER_TEXT)).not.toBeInTheDocument();
  });

  it("拒否するとバナーが消える", async () => {
    const user = userEvent.setup();
    setUserData({ incoming_follow_request_id: 42 });

    render(<MyPage />);

    await user.click(screen.getByRole("button", { name: "拒否する" }));

    await waitFor(() => {
      expect(mockRejectFollowRequest).toHaveBeenCalledWith(42);
      expect(screen.queryByText(BANNER_TEXT)).not.toBeInTheDocument();
    });
    expect(mockMutateUserData).toHaveBeenCalled();
  });
});
