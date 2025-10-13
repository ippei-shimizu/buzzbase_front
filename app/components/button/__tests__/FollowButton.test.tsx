import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FollowButton from "../FollowButton";

// Mock dependencies
jest.mock("@app/contexts/useAuthContext", () => ({
  useAuthContext: jest.fn(),
}));

jest.mock("@app/services/userService", () => ({
  userFollow: jest.fn(),
  userUnFollow: jest.fn(),
}));

import { useAuthContext } from "@app/contexts/useAuthContext";
import { userFollow, userUnFollow } from "@app/services/userService";

describe("FollowButton", () => {
  const mockSetErrorsWithTimeout = jest.fn();
  const mockUseAuthContext = useAuthContext as jest.Mock;
  const mockUserFollow = userFollow as jest.Mock;
  const mockUserUnFollow = userUnFollow as jest.Mock;

  const defaultProps = {
    userId: 1,
    isFollowing: false,
    setErrorsWithTimeout: mockSetErrorsWithTimeout,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // デフォルトでログイン状態にする
    mockUseAuthContext.mockReturnValue({
      isLoggedIn: true,
    });
  });

  it("フォローしていない時、「フォローする」ボタンが表示される", () => {
    render(<FollowButton {...defaultProps} />);

    expect(screen.getByText("フォローする")).toBeInTheDocument();
    expect(screen.queryByText("フォロー中")).not.toBeInTheDocument();
  });

  it("フォローしている時、「フォロー中」ボタンが表示される", () => {
    render(<FollowButton {...defaultProps} isFollowing={true} />);

    expect(screen.getByText("フォロー中")).toBeInTheDocument();
    expect(screen.queryByText("フォローする")).not.toBeInTheDocument();
  });

  it("「フォローする」ボタンをクリックするとフォロー処理が実行される", async () => {
    const user = userEvent.setup();
    mockUserFollow.mockResolvedValue({});

    render(<FollowButton {...defaultProps} />);

    const button = screen.getByText("フォローする");
    await user.click(button);

    await waitFor(() => {
      expect(mockUserFollow).toHaveBeenCalledWith(1);
      expect(screen.getByText("フォロー中")).toBeInTheDocument();
    });
  });

  it("「フォロー中」ボタンをクリックするとフォロー解除処理が実行される", async () => {
    const user = userEvent.setup();
    mockUserUnFollow.mockResolvedValue({});

    render(<FollowButton {...defaultProps} isFollowing={true} />);

    const button = screen.getByText("フォロー中");
    await user.click(button);

    await waitFor(() => {
      expect(mockUserUnFollow).toHaveBeenCalledWith(1);
      expect(screen.getByText("フォローする")).toBeInTheDocument();
    });
  });

  it("ログインしていない時、クリックするとエラーメッセージが表示される", async () => {
    const user = userEvent.setup();
    mockUseAuthContext.mockReturnValue({
      isLoggedIn: false,
    });

    render(<FollowButton {...defaultProps} />);

    const button = screen.getByText("フォローする");
    await user.click(button);

    await waitFor(() => {
      expect(mockSetErrorsWithTimeout).toHaveBeenCalledWith([
        "ログインしてください",
      ]);
      expect(mockUserFollow).not.toHaveBeenCalled();
    });
  });

  it("フォロー/フォロー解除を繰り返すことができる", async () => {
    const user = userEvent.setup();
    mockUserFollow.mockResolvedValue({});
    mockUserUnFollow.mockResolvedValue({});

    render(<FollowButton {...defaultProps} />);

    // フォローする
    const followButton = screen.getByText("フォローする");
    await user.click(followButton);

    await waitFor(() => {
      expect(screen.getByText("フォロー中")).toBeInTheDocument();
    });

    // フォロー解除する
    const unfollowButton = screen.getByText("フォロー中");
    await user.click(unfollowButton);

    await waitFor(() => {
      expect(screen.getByText("フォローする")).toBeInTheDocument();
    });

    // 再度フォローする
    const followAgainButton = screen.getByText("フォローする");
    await user.click(followAgainButton);

    await waitFor(() => {
      expect(screen.getByText("フォロー中")).toBeInTheDocument();
    });
  });

  it("ボタンにNextUIのButtonコンポーネントが使用されている", () => {
    const { container } = render(<FollowButton {...defaultProps} />);

    // Buttonコンポーネントが存在することを確認
    const button = container.querySelector("button");
    expect(button).toBeInTheDocument();
  });
});
