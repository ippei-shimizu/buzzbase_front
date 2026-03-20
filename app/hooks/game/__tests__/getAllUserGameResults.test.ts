/**
 * useAllUserGameResults hook のリグレッションテスト
 * Next.js 15 / React 19 バージョンアップ前のベースライン
 */
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { SWRConfig } from "swr";
import axiosInstance from "@app/utils/axiosInstance";
import useAllUserGameResults from "../getAllUserGameResults";

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

describe("useAllUserGameResults", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("全ユーザーの試合結果を取得する", async () => {
    const mockData = [
      { id: 1, date: "2024-05-01", opponent_team_name: "相手チームA" },
      { id: 2, date: "2024-05-08", opponent_team_name: "相手チームB" },
    ];

    (axiosInstance.get as jest.Mock).mockResolvedValueOnce({
      data: mockData,
    });

    const { result } = renderHook(() => useAllUserGameResults(), { wrapper });

    // 初期状態はローディング
    expect(result.current.isLoading).toBe(true);
    expect(result.current.allUserGameResults).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.allUserGameResults).toEqual(mockData);
    expect(result.current.isError).toBeUndefined();
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v2/game_results/all");
  });

  it("試合結果が空の場合、空配列を返す", async () => {
    (axiosInstance.get as jest.Mock).mockResolvedValueOnce({
      data: [],
    });

    const { result } = renderHook(() => useAllUserGameResults(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.allUserGameResults).toEqual([]);
  });

  it("API がエラーを返した場合、isError がセットされる", async () => {
    const mockError = new Error("API Error");
    (axiosInstance.get as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useAllUserGameResults(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBeDefined();
    });

    expect(result.current.allUserGameResults).toBeUndefined();
  });
});
