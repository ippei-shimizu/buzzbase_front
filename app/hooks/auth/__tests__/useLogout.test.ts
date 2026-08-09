import { act, renderHook } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@app/contexts/useAuthContext";
import { signOut } from "@app/services/authService";
import { resetUser } from "@app/utils/posthog";
import useLogout from "../useLogout";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@app/contexts/useAuthContext", () => ({
  useAuthContext: jest.fn(),
}));

jest.mock("@app/services/authService", () => ({
  signOut: jest.fn(),
}));

jest.mock("@app/utils/posthog", () => ({
  resetUser: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseAuthContext = useAuthContext as jest.MockedFunction<
  typeof useAuthContext
>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
const mockResetUser = resetUser as jest.MockedFunction<typeof resetUser>;

describe("useLogout", () => {
  const mockPush = jest.fn();
  const mockRefresh = jest.fn();
  const mockSetIsLoggedIn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      refresh: mockRefresh,
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    });
    mockUseAuthContext.mockReturnValue({
      isLoggedIn: true,
      setIsLoggedIn: mockSetIsLoggedIn,
      loading: false,
    });
  });

  it("認証状態をクリアしてログイン画面へ遷移する", async () => {
    mockSignOut.mockResolvedValue({} as Awaited<ReturnType<typeof signOut>>);
    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current();
    });

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockResetUser).toHaveBeenCalledTimes(1);
    expect(mockSetIsLoggedIn).toHaveBeenCalledWith(false);
    expect(mockPush).toHaveBeenCalledWith("/signin?logout=success");
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("signOut が失敗しても例外を投げない", async () => {
    mockSignOut.mockRejectedValue(new Error("network error"));
    const { result } = renderHook(() => useLogout());

    await expect(result.current()).resolves.toBeUndefined();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
