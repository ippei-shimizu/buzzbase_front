import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders } from "axios";
import ResetPasswordForm from "../ResetPasswordForm";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const mockResetPassword = jest.fn();
jest.mock("@app/services/authService", () => ({
  resetPassword: (...args: unknown[]) => mockResetPassword(...args),
}));

const responseError = (status: number, data: unknown) =>
  new AxiosError("failed", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    statusText: "Error",
    data,
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  });

const authHeaders = {
  accessToken: "token",
  client: "client",
  uid: "user@example.com",
};

const submitReset = async () => {
  const user = userEvent.setup();
  render(<ResetPasswordForm authHeaders={authHeaders} />);
  await user.type(screen.getByLabelText("新しいパスワード"), "password123");
  await user.type(
    screen.getByLabelText("新しいパスワード（確認用）"),
    "password123",
  );
  await user.click(screen.getByText("パスワードを変更する"));
};

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // back は PUT をスロットル対象にしていないため現状 429 は返らないが、
  // 対象化された際にこの分岐が壊れていないことを担保する。
  it("レート制限のときはバックエンドの文言を表示する", async () => {
    mockResetPassword.mockRejectedValue(
      responseError(429, {
        error: "rate_limit_exceeded",
        message: "試行回数が上限に達しました",
      }),
    );

    await submitReset();

    expect(
      await screen.findByText("試行回数が上限に達しました"),
    ).toBeInTheDocument();
  });

  it("422 のときは従来通り full_messages を表示する", async () => {
    mockResetPassword.mockRejectedValue(
      responseError(422, {
        errors: { full_messages: ["Password is too short"] },
      }),
    );

    await submitReset();

    expect(
      await screen.findByText("Password is too short"),
    ).toBeInTheDocument();
  });
});
