import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders } from "axios";
import SignIn from "../SignIn";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

const mockSignIn = jest.fn();
jest.mock("@app/services/authService", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
  resendConfirmation: jest.fn(),
}));

jest.mock("@app/services/userService", () => ({
  getUserData: () => Promise.resolve({ id: 1, user_id: "buzz" }),
}));

jest.mock("@app/contexts/useAuthContext", () => ({
  useAuthContext: () => ({ setIsLoggedIn: jest.fn() }),
}));

jest.mock("@app/components/auth/GoogleLoginButton", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@app/lib/analytics", () => ({ trackEvent: jest.fn() }));
jest.mock("@app/utils/analytics", () => ({ trackUserLoggedIn: jest.fn() }));
jest.mock("@app/utils/posthog", () => ({ identifyUser: jest.fn() }));

const responseError = (status: number, data: unknown) =>
  new AxiosError("failed", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    statusText: "Error",
    data,
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  });

const submitLogin = async () => {
  const user = userEvent.setup();
  render(<SignIn />);
  await user.type(screen.getByLabelText("メールアドレス"), "user@example.com");
  await user.type(screen.getByLabelText("パスワード"), "password123");
  await user.click(screen.getByText("ログインする"));
};

describe("SignIn", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("レート制限のときはバックエンドの文言を表示する", async () => {
    mockSignIn.mockRejectedValue(
      responseError(429, {
        error: "rate_limit_exceeded",
        message: "試行回数が上限に達しました",
      }),
    );

    await submitLogin();

    expect(
      await screen.findByText("試行回数が上限に達しました"),
    ).toBeInTheDocument();
  });

  it("認証失敗のときは従来通りサーバーのエラーを表示する", async () => {
    mockSignIn.mockRejectedValue(
      responseError(401, { errors: ["Invalid login credentials"] }),
    );

    await submitLogin();

    expect(
      await screen.findByText("Invalid login credentials"),
    ).toBeInTheDocument();
  });
});
