import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  acceptFollowRequest,
  rejectFollowRequest,
} from "@app/services/userService";
import FollowRequestBanner from "../FollowRequestBanner";

jest.mock("@app/services/userService", () => ({
  acceptFollowRequest: jest.fn(),
  rejectFollowRequest: jest.fn(),
}));

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
}));

describe("FollowRequestBanner", () => {
  const mockAcceptFollowRequest = acceptFollowRequest as jest.Mock;
  const mockRejectFollowRequest = rejectFollowRequest as jest.Mock;
  const mockOnHandled = jest.fn();

  const defaultProps = {
    followRequestId: 42,
    actorName: "テストユーザー",
    onHandled: mockOnHandled,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAcceptFollowRequest.mockResolvedValue({ status: "success" });
    mockRejectFollowRequest.mockResolvedValue({ status: "success" });
  });

  it("リクエスト元の名前と承認/拒否ボタンが表示される", () => {
    render(<FollowRequestBanner {...defaultProps} />);

    expect(
      screen.getByText(
        "テストユーザーさんからフォローリクエストが届いています",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "承認する" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "拒否する" }),
    ).toBeInTheDocument();
  });

  it("承認するとリクエストIDを渡して承認APIが呼ばれ、承認済み表示に変わる", async () => {
    const user = userEvent.setup();
    render(<FollowRequestBanner {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "承認する" }));

    await waitFor(() => {
      expect(mockAcceptFollowRequest).toHaveBeenCalledWith(42);
      expect(
        screen.getByText(
          "テストユーザーさんのフォローリクエストを承認しました",
        ),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("button", { name: "承認する" }),
    ).not.toBeInTheDocument();
    expect(mockRejectFollowRequest).not.toHaveBeenCalled();
  });

  it("承認後にonHandledが呼ばれる", async () => {
    const user = userEvent.setup();
    render(<FollowRequestBanner {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "承認する" }));

    await waitFor(() => {
      expect(mockOnHandled).toHaveBeenCalledTimes(1);
    });
  });

  it("拒否するとリクエストIDを渡して拒否APIが呼ばれ、バナーが消える", async () => {
    const user = userEvent.setup();
    render(<FollowRequestBanner {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "拒否する" }));

    await waitFor(() => {
      expect(mockRejectFollowRequest).toHaveBeenCalledWith(42);
      expect(
        screen.queryByText(
          "テストユーザーさんからフォローリクエストが届いています",
        ),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.queryByRole("button", { name: "拒否する" }),
    ).not.toBeInTheDocument();
    expect(mockAcceptFollowRequest).not.toHaveBeenCalled();
  });

  it("拒否後にonHandledが呼ばれる", async () => {
    const user = userEvent.setup();
    render(<FollowRequestBanner {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "拒否する" }));

    await waitFor(() => {
      expect(mockOnHandled).toHaveBeenCalledTimes(1);
    });
  });

  it("承認に失敗したときはバナーが残り、再操作できる", async () => {
    const user = userEvent.setup();
    mockAcceptFollowRequest.mockRejectedValueOnce(new Error("failed"));

    render(<FollowRequestBanner {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "承認する" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "承認する" })).toBeEnabled();
    });
    expect(mockOnHandled).not.toHaveBeenCalled();
    expect(
      screen.queryByText(
        "テストユーザーさんのフォローリクエストを承認しました",
      ),
    ).not.toBeInTheDocument();
  });

  it("処理中は承認・拒否ボタンが無効になる", async () => {
    const user = userEvent.setup();
    let resolveAccept: (value: unknown) => void = () => {};
    mockAcceptFollowRequest.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveAccept = resolve;
      }),
    );

    render(<FollowRequestBanner {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "承認する" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "拒否する" })).toBeDisabled();
    });
    expect(screen.getByRole("button", { name: "承認する" })).toBeDisabled();

    resolveAccept({ status: "success" });
    await waitFor(() => {
      expect(
        screen.getByText(
          "テストユーザーさんのフォローリクエストを承認しました",
        ),
      ).toBeInTheDocument();
    });
  });
});
