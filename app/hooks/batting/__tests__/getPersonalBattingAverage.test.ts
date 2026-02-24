/**
 * usePersonalBattingAverage hook のリグレッションテスト
 * Next.js 15 / React 19 バージョンアップ前のベースライン
 */
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { SWRConfig } from "swr";
import { usePersonalBattingAverage } from "../getPersonalBattingAverage";

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

describe("usePersonalBattingAverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("userId が指定された場合、データを取得する", async () => {
    const mockData = [
      { game_id: 1, average: 0.333 },
      { game_id: 2, average: 0.25 },
    ];

    (axiosInstance.get as jest.Mock).mockResolvedValueOnce({
      data: mockData,
    });

    const { result } = renderHook(() => usePersonalBattingAverage(1), {
      wrapper,
    });

    // 初期状態はローディング
    expect(result.current.isLoadingBA).toBe(true);
    expect(result.current.personalBattingAverages).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isLoadingBA).toBe(false);
    });

    expect(result.current.personalBattingAverages).toEqual(mockData);
    expect(result.current.isError).toBeUndefined();
    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/v1/batting_averages/personal_batting_average?user_id=1",
    );
  });

  it("userId が 0（falsy）の場合、データ取得しない", () => {
    const { result } = renderHook(() => usePersonalBattingAverage(0), {
      wrapper,
    });

    // SWR の key が null なのでフェッチしない
    expect(axiosInstance.get).not.toHaveBeenCalled();
    expect(result.current.personalBattingAverages).toBeUndefined();
  });

  it("API がエラーを返した場合、isError がセットされる", async () => {
    const mockError = new Error("API Error");
    (axiosInstance.get as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => usePersonalBattingAverage(1), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBeDefined();
    });

    expect(result.current.personalBattingAverages).toBeUndefined();
  });
});
