/**
 * useRequireAuth hook のリグレッションテスト
 * Next.js 15 / React 19 バージョンアップ前のベースライン
 */
import { renderHook } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@app/contexts/useAuthContext";
import useRequireAuth from "../useRequireAuth";

// next/navigation をモック
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// useAuthContext をモック
jest.mock("@app/contexts/useAuthContext", () => ({
  useAuthContext: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseAuthContext = useAuthContext as jest.MockedFunction<
  typeof useAuthContext
>;

describe("useRequireAuth", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    });
  });

  it("ログイン済みの場合、リダイレクトしない", () => {
    mockUseAuthContext.mockReturnValue({ isLoggedIn: true });

    renderHook(() => useRequireAuth());

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("未ログインの場合、サインアップページにリダイレクトする", async () => {
    mockUseAuthContext.mockReturnValue({ isLoggedIn: false });

    renderHook(() => useRequireAuth());

    // useEffect は非同期で実行される
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockPush).toHaveBeenCalledWith("/signup?auth_required=true");
  });

  it("isLoggedIn が undefined（未確定）の場合、リダイレクトしない", async () => {
    mockUseAuthContext.mockReturnValue({ isLoggedIn: undefined });

    renderHook(() => useRequireAuth());

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("isLoggedIn の値を返す", () => {
    mockUseAuthContext.mockReturnValue({ isLoggedIn: true });

    const { result } = renderHook(() => useRequireAuth());

    expect(result.current).toBe(true);
  });

  it("isLoggedIn が false の場合、false を返す", () => {
    mockUseAuthContext.mockReturnValue({ isLoggedIn: false });

    const { result } = renderHook(() => useRequireAuth());

    expect(result.current).toBe(false);
  });
});
