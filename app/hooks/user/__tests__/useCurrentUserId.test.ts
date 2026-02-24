/**
 * useCurrentUserId hook のリグレッションテスト
 * Next.js 15 / React 19 バージョンアップ前のベースライン
 */
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { SWRConfig } from "swr";
import useCurrentUserId from "../useCurrentUserId";

// axiosInstance をモック
jest.mock("@app/utils/axiosInstance", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    create: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

import axiosInstance from "@app/utils/axiosInstance";

// SWR のキャッシュを無効化し、リトライしないラッパー
function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(
    SWRConfig,
    {
      value: {
        dedupingInterval: 0,
        provider: () => new Map(),
        shouldRetryOnError: false,
      },
    },
    children,
  );
}

describe("useCurrentUserId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("現在のユーザーIDを取得する", async () => {
    const mockUserId = { id: 42 };

    (axiosInstance.get as jest.Mock).mockResolvedValueOnce({
      data: mockUserId,
    });

    const { result } = renderHook(() => useCurrentUserId(), { wrapper });

    // 初期状態はローディング
    expect(result.current.isLoadingCurrentUserId).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoadingCurrentUserId).toBe(false);
    });

    expect(result.current.currentUserId).toEqual(mockUserId);
    expect(result.current.isErrorCurrentUserId).toBeUndefined();
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/users/current");
  });

  it("API がエラーを返した場合、エラー状態になる", async () => {
    (axiosInstance.get as jest.Mock).mockRejectedValueOnce(
      new Error("Unauthorized"),
    );

    const { result } = renderHook(() => useCurrentUserId(), { wrapper });

    await waitFor(() => {
      expect(result.current.isErrorCurrentUserId).toBeDefined();
    });

    expect(result.current.currentUserId).toBeUndefined();
  });
});
