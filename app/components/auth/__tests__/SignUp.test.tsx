import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders } from "axios";
import SignUp from "../SignUp";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const mockSignUp = jest.fn();
jest.mock("@app/services/authService", () => ({
  signUp: (...args: unknown[]) => mockSignUp(...args),
  resendConfirmation: jest.fn(),
}));

jest.mock("@app/components/auth/GoogleLoginButton", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@app/lib/analytics", () => ({ trackEvent: jest.fn() }));

const responseError = (status: number, data: unknown) =>
  new AxiosError("failed", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    statusText: "Error",
    data,
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  });

const submitSignUp = async () => {
  const user = userEvent.setup();
  render(<SignUp />);
  await user.type(screen.getByLabelText("メールアドレス"), "new@example.com");
  await user.type(screen.getByLabelText("パスワード"), "password123");
  await user.type(screen.getByLabelText("パスワード（確認用）"), "password123");
  await user.click(screen.getByText("登録する"));
};

describe("SignUp", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("レート制限のときはバックエンドの文言を表示する", async () => {
    mockSignUp.mockRejectedValue(
      responseError(429, {
        error: "rate_limit_exceeded",
        message: "試行回数が上限に達しました",
      }),
    );

    await submitSignUp();

    expect(
      await screen.findByText("試行回数が上限に達しました"),
    ).toBeInTheDocument();
  });

  it("422 のときは従来通りサーバーのエラーを表示する", async () => {
    mockSignUp.mockRejectedValue(
      responseError(422, {
        errors: { full_messages: ["Password is too short"] },
      }),
    );

    await submitSignUp();

    expect(await screen.findByText("Password is too short")).toBeInTheDocument();
  });
});
