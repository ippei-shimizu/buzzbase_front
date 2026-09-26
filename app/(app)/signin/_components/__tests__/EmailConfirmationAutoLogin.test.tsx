import { render, waitFor } from "@testing-library/react";
import EmailConfirmationAutoLogin from "../EmailConfirmationAutoLogin";

const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

const mockSetAuthCookiesFromConfirmation = jest.fn();
jest.mock("@app/services/authService", () => ({
  setAuthCookiesFromConfirmation: (...args: unknown[]) =>
    mockSetAuthCookiesFromConfirmation(...args),
}));

const mockGetUserData = jest.fn();
jest.mock("@app/services/userService", () => ({
  getUserData: () => mockGetUserData(),
}));

const mockSetIsLoggedIn = jest.fn();
jest.mock("@app/contexts/useAuthContext", () => ({
  useAuthContext: () => ({ setIsLoggedIn: mockSetIsLoggedIn }),
}));

const tokens = {
  accessToken: "token-value",
  client: "client-value",
  uid: "user@example.com",
};

describe("EmailConfirmationAutoLogin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ユーザーIDが登録済みならマイページへ送る", async () => {
    mockGetUserData.mockResolvedValue({ id: 1, user_id: "buzz" });

    render(<EmailConfirmationAutoLogin {...tokens} />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/mypage/buzz");
    });
    expect(mockSetAuthCookiesFromConfirmation).toHaveBeenCalledWith(tokens);
    expect(mockSetIsLoggedIn).toHaveBeenCalledWith(true);
  });

  it("ユーザーID未登録ならユーザー名登録へ送る", async () => {
    mockGetUserData.mockResolvedValue({ id: 1, user_id: null });

    render(<EmailConfirmationAutoLogin {...tokens} />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/register-username");
    });
  });

  it("ユーザー情報の取得に失敗してもユーザー名登録へ送る", async () => {
    mockGetUserData.mockRejectedValue(new Error("failed"));

    render(<EmailConfirmationAutoLogin {...tokens} />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/register-username");
    });
  });

  it("トークンが欠けている場合は何もしない", async () => {
    mockGetUserData.mockResolvedValue({ id: 1, user_id: "buzz" });

    render(
      <EmailConfirmationAutoLogin
        accessToken={tokens.accessToken}
        client={null}
        uid={tokens.uid}
      />,
    );

    // 欠けていない引数で必ず遷移する上のケースと同じ待ち方にして、待ち不足の偽陽性を避ける
    await waitFor(() => {
      expect(mockSetAuthCookiesFromConfirmation).not.toHaveBeenCalled();
    });
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockSetIsLoggedIn).not.toHaveBeenCalled();
  });
});
