import { render, waitFor } from "@testing-library/react";
import { writePendingConfirmationUid } from "@app/utils/pendingConfirmationStorage";
import EmailConfirmationAutoLogin from "../EmailConfirmationAutoLogin";

const mockReplace = jest.fn();
const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, refresh: mockRefresh }),
}));

const mockSetAuthCookiesFromConfirmation = jest.fn();
const mockClearAuthCookies = jest.fn();
jest.mock("@app/services/authService", () => ({
  setAuthCookiesFromConfirmation: (...args: unknown[]) =>
    mockSetAuthCookiesFromConfirmation(...args),
  clearAuthCookies: () => mockClearAuthCookies(),
}));

const mockGetUserData = jest.fn();
jest.mock("@app/services/userService", () => ({
  getUserData: () => mockGetUserData(),
}));

const mockSetIsLoggedIn = jest.fn();
jest.mock("@app/contexts/useAuthContext", () => ({
  useAuthContext: () => ({ setIsLoggedIn: mockSetIsLoggedIn }),
}));

jest.mock("@app/utils/posthog", () => ({ identifyUser: jest.fn() }));

const tokens = {
  accessToken: "token-value",
  client: "client-value",
  uid: "user@example.com",
};

type TokenOverrides = Partial<Record<keyof typeof tokens, string | null>>;

const renderAutoLogin = (props?: TokenOverrides) => {
  const onAutoLoginChange = jest.fn();
  render(
    <EmailConfirmationAutoLogin
      {...tokens}
      {...props}
      onAutoLoginChange={onAutoLoginChange}
    />,
  );
  return onAutoLoginChange;
};

describe("EmailConfirmationAutoLogin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    window.history.replaceState(
      null,
      "",
      "/signin?access-token=token-value&client=client-value&uid=user%40example.com",
    );
  });

  describe("この端末で確認待ちのメールアドレスと一致するとき", () => {
    beforeEach(() => {
      writePendingConfirmationUid("user@example.com");
    });

    it("ユーザーIDが登録済みならマイページへ送る", async () => {
      mockGetUserData.mockResolvedValue({ id: 1, user_id: "buzz" });

      const onAutoLoginChange = renderAutoLogin();

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/mypage/buzz");
      });
      expect(mockSetAuthCookiesFromConfirmation).toHaveBeenCalledWith(tokens);
      expect(mockSetIsLoggedIn).toHaveBeenCalledWith(true);
      expect(mockRefresh).toHaveBeenCalled();
      expect(onAutoLoginChange).toHaveBeenCalledWith(true);
    });

    it("ユーザーID未登録ならユーザー名登録へ送る", async () => {
      mockGetUserData.mockResolvedValue({ id: 1, user_id: null });

      renderAutoLogin();

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/register-username");
      });
    });

    it("トークンを URL から即座に落とす", async () => {
      mockGetUserData.mockResolvedValue({ id: 1, user_id: "buzz" });

      renderAutoLogin();

      await waitFor(() => {
        expect(window.location.search).not.toContain("access-token");
      });
    });

    it("ユーザー情報の取得に失敗したらログイン状態にせず cookie を破棄する", async () => {
      mockGetUserData.mockRejectedValue(new Error("unauthorized"));

      const onAutoLoginChange = renderAutoLogin();

      await waitFor(() => {
        expect(mockClearAuthCookies).toHaveBeenCalled();
      });
      expect(mockSetIsLoggedIn).toHaveBeenCalledWith(false);
      expect(mockReplace).not.toHaveBeenCalled();
      expect(onAutoLoginChange).toHaveBeenLastCalledWith(false);
    });
  });

  it("確認待ちのメールアドレスが無いときは受け入れない", async () => {
    mockGetUserData.mockResolvedValue({ id: 1, user_id: "buzz" });

    renderAutoLogin();

    await waitFor(() => {
      expect(window.location.search).not.toContain("access-token");
    });
    expect(mockSetAuthCookiesFromConfirmation).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockSetIsLoggedIn).not.toHaveBeenCalled();
  });

  it("確認待ちのメールアドレスと uid が違うときは受け入れない", async () => {
    writePendingConfirmationUid("owner@example.com");
    mockGetUserData.mockResolvedValue({ id: 1, user_id: "buzz" });

    renderAutoLogin({ uid: "attacker@example.com" });

    await waitFor(() => {
      expect(window.location.search).not.toContain("access-token");
    });
    expect(mockSetAuthCookiesFromConfirmation).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("トークンが欠けている場合は何もしない", async () => {
    writePendingConfirmationUid("user@example.com");
    mockGetUserData.mockResolvedValue({ id: 1, user_id: "buzz" });

    renderAutoLogin({ client: null });

    // 欠けていない引数で必ず遷移する上のケースと同じ待ち方にして、待ち不足の偽陽性を避ける
    await waitFor(() => {
      expect(mockSetAuthCookiesFromConfirmation).not.toHaveBeenCalled();
    });
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockSetIsLoggedIn).not.toHaveBeenCalled();
  });
});
