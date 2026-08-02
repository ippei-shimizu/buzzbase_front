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
  const mockOnFailed = jest.fn();
  const mockSetErrorsWithTimeout = jest.fn();

  const defaultProps = {
    followRequestId: 42,
    actorName: "テストユーザー",
    onHandled: mockOnHandled,
    onFailed: mockOnFailed,
    setErrorsWithTimeout: mockSetErrorsWithTimeout,
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
    expect(mockOnFailed).not.toHaveBeenCalled();
  });

  it("拒否するとリクエストIDを渡して拒否APIが呼ばれ、拒否済み表示に変わる", async () => {
    const user = userEvent.setup();
    render(<FollowRequestBanner {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "拒否する" }));

    await waitFor(() => {
      expect(mockRejectFollowRequest).toHaveBeenCalledWith(42);
      expect(
        screen.getByText(
          "テストユーザーさんのフォローリクエストを拒否しました",
        ),
      ).toBeInTheDocument();
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
    expect(mockOnFailed).not.toHaveBeenCalled();
  });

  it("完了メッセージはライブリージョンに描画される", async () => {
    const user = userEvent.setup();
    render(<FollowRequestBanner {...defaultProps} />);

    const liveRegion = screen.getByRole("status");
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
    expect(liveRegion).toBeEmptyDOMElement();

    await user.click(screen.getByRole("button", { name: "承認する" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "テストユーザーさんのフォローリクエストを承認しました",
      );
    });
  });

  it("承認に失敗したときはエラーを表示しバナーを残して再操作できる", async () => {
    const user = userEvent.setup();
    mockAcceptFollowRequest.mockRejectedValueOnce(new Error("failed"));

    render(<FollowRequestBanner {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "承認する" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "承認する" })).toBeEnabled();
    });
    expect(mockSetErrorsWithTimeout).toHaveBeenCalledWith([
      "フォローリクエストの承認に失敗しました",
    ]);
    expect(mockOnHandled).not.toHaveBeenCalled();
    expect(
      screen.queryByText(
        "テストユーザーさんのフォローリクエストを承認しました",
      ),
    ).not.toBeInTheDocument();
  });

  it("拒否に失敗したときはエラーを表示しバナーを残して再操作できる", async () => {
    const user = userEvent.setup();
    mockRejectFollowRequest.mockRejectedValueOnce(new Error("failed"));

    render(<FollowRequestBanner {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "拒否する" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "拒否する" })).toBeEnabled();
    });
    expect(mockSetErrorsWithTimeout).toHaveBeenCalledWith([
      "フォローリクエストの拒否に失敗しました",
    ]);
    expect(mockOnHandled).not.toHaveBeenCalled();
  });

  it("失敗時は再検証してもらうためonFailedが呼ばれる", async () => {
    const user = userEvent.setup();
    mockAcceptFollowRequest.mockRejectedValueOnce(new Error("not found"));

    render(<FollowRequestBanner {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "承認する" }));

    await waitFor(() => {
      expect(mockOnFailed).toHaveBeenCalledTimes(1);
    });
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
    const acceptButton = screen.getByRole("button", { name: "承認する" });
    expect(acceptButton).toBeDisabled();
    expect(acceptButton).toHaveAttribute("aria-busy", "true");
    expect(acceptButton).toHaveAttribute("data-loading", "true");
    expect(
      screen.getByRole("button", { name: "拒否する" }),
    ).not.toHaveAttribute("data-loading", "true");

    resolveAccept({ status: "success" });
    await waitFor(() => {
      expect(
        screen.getByText(
          "テストユーザーさんのフォローリクエストを承認しました",
        ),
      ).toBeInTheDocument();
    });
  });

  it("処理中に連打しても承認APIは1回しか呼ばれない", async () => {
    const user = userEvent.setup();
    let resolveAccept: (value: unknown) => void = () => {};
    mockAcceptFollowRequest.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveAccept = resolve;
      }),
    );

    render(<FollowRequestBanner {...defaultProps} />);

    const acceptButton = screen.getByRole("button", { name: "承認する" });
    await user.click(acceptButton);
    await user.click(acceptButton);
    await user.click(acceptButton);

    expect(mockAcceptFollowRequest).toHaveBeenCalledTimes(1);

    resolveAccept({ status: "success" });
    await waitFor(() => {
      expect(mockOnHandled).toHaveBeenCalledTimes(1);
    });
  });
});
