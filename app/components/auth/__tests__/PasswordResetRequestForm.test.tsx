import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders } from "axios";
import PasswordResetRequestForm from "../PasswordResetRequestForm";

const mockRequestPasswordReset = jest.fn();
jest.mock("@app/services/authService", () => ({
  requestPasswordReset: (...args: unknown[]) =>
    mockRequestPasswordReset(...args),
}));

const responseError = (status: number, data: unknown) =>
  new AxiosError("failed", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    statusText: "Error",
    data,
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  });

const submit = async () => {
  const user = userEvent.setup();
  render(<PasswordResetRequestForm />);
  await user.type(screen.getByLabelText("メールアドレス"), "reset@example.com");
  await user.click(screen.getByText("送信する"));
};

describe("PasswordResetRequestForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("レート制限のときは専用文言を出し、送信完了画面に進まない", async () => {
    mockRequestPasswordReset.mockRejectedValue(
      responseError(429, {
        error: "rate_limit_exceeded",
        message: "試行回数が上限に達しました",
      }),
    );

    await submit();

    expect(
      await screen.findByText("試行回数が上限に達しました"),
    ).toBeInTheDocument();
    expect(screen.getByText("送信する")).toBeInTheDocument();
  });

  it("レート制限以外のエラーはアカウント列挙を防ぐため成功時と同じ文言を出す", async () => {
    mockRequestPasswordReset.mockRejectedValue(
      responseError(404, { errors: ["Unable to find user"] }),
    );

    await submit();

    expect(
      await screen.findByText(/パスワード再設定のご案内をお送りしました/),
    ).toBeInTheDocument();
  });
});
