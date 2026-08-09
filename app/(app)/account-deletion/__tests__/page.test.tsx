import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders } from "axios";
import AccountDeletionPage from "../page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/account-deletion",
}));

const mockClearAuthCookies = jest.fn();
jest.mock("@app/services/authService", () => ({
  clearAuthCookies: () => mockClearAuthCookies(),
}));

const mockResetUser = jest.fn();
jest.mock("@app/utils/posthog", () => ({
  resetUser: () => mockResetUser(),
}));

jest.mock("@app/contexts/useAuthContext", () => ({
  useAuthContext: () => ({ isLoggedIn: true, loading: false }),
}));

jest.mock("@app/components/header/Header", () => ({
  __esModule: true,
  default: () => null,
}));

const mockDeleteUser = jest.fn();
jest.mock("@app/services/userService", () => ({
  getCurrentUserId: () => Promise.resolve(1),
  deleteUser: (...args: unknown[]) => mockDeleteUser(...args),
}));

const responseError = (status: number, data: unknown) =>
  new AxiosError("failed", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    statusText: "Error",
    data,
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  });

const confirmDeletion = async () => {
  const user = userEvent.setup();
  render(<AccountDeletionPage />);
  await user.click(screen.getByText("アカウントを削除する"));
  await user.click(await screen.findByText("削除する"));
};

describe("アカウント削除ページ", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDeleteUser.mockResolvedValue({ success: true });
  });

  it("Pro 加入中で拒否されたら専用文言と解約導線を出す", async () => {
    mockDeleteUser.mockRejectedValue(
      responseError(422, {
        error: "pro_active",
        message: "Pro 加入中のため、先に解約してください",
      }),
    );

    await confirmDeletion();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("先に Pro プランを解約してください");
    expect(screen.getByText("Pro プランの解約手続きへ")).toHaveAttribute(
      "href",
      "/account/subscription",
    );
    expect(mockClearAuthCookies).not.toHaveBeenCalled();
  });

  it("Pro 加入以外の失敗では汎用文言だけを出す", async () => {
    mockDeleteUser.mockRejectedValue(responseError(500, { error: "failed" }));

    await confirmDeletion();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("アカウントの削除に失敗しました");
    expect(screen.queryByText("Pro プランの解約手続きへ")).toBeNull();
  });

  it("削除に成功したら認証cookieとPostHogの識別子を破棄する", async () => {
    await confirmDeletion();

    await waitFor(() => expect(mockClearAuthCookies).toHaveBeenCalled());
    expect(mockResetUser).toHaveBeenCalled();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
