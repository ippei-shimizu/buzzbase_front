/**
 * useNotificationCount hook のリグレッションテスト
 * Next.js 15 / React 19 バージョンアップ前のベースライン
 */
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { SWRConfig } from "swr";
import { useNotificationCount } from "../useNotificationCount";

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

describe("useNotificationCount", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("通知件数を取得する", async () => {
    const mockCount = { count: 5 };

    (axiosInstance.get as jest.Mock).mockResolvedValueOnce({
      data: mockCount,
    });

    const { result } = renderHook(() => useNotificationCount(), { wrapper });

    // 初期状態はローディング
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.notificationCount).toEqual(mockCount);
    expect(result.current.isError).toBeUndefined();
    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/v1/notifications/count",
    );
  });

  it("通知件数が0の場合も正しく取得する", async () => {
    const mockCount = { count: 0 };

    (axiosInstance.get as jest.Mock).mockResolvedValueOnce({
      data: mockCount,
    });

    const { result } = renderHook(() => useNotificationCount(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.notificationCount).toEqual(mockCount);
  });

  it("API がエラーを返した場合、エラー状態になる", async () => {
    (axiosInstance.get as jest.Mock).mockRejectedValueOnce(
      new Error("Server Error"),
    );

    const { result } = renderHook(() => useNotificationCount(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBeDefined();
    });

    expect(result.current.notificationCount).toBeUndefined();
  });
});
