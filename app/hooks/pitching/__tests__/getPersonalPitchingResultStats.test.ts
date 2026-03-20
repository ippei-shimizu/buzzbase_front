/**
 * usePersonalPitchingResultStats hook のリグレッションテスト
 * Next.js 15 / React 19 バージョンアップ前のベースライン
 */
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { SWRConfig } from "swr";
import axiosInstance from "@app/utils/axiosInstance";
import { usePersonalPitchingResultStats } from "../getPersonalPitchingResultStats";

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

describe("usePersonalPitchingResultStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("userId が指定された場合、投球成績統計を取得する", async () => {
    const mockData = {
      era: 2.5,
      win: 5,
      loss: 3,
      strikeouts: 60,
      innings_pitched: 50,
    };

    (axiosInstance.get as jest.Mock).mockResolvedValueOnce({
      data: mockData,
    });

    const { result } = renderHook(() => usePersonalPitchingResultStats(1), {
      wrapper,
    });

    // 初期状態はローディング
    expect(result.current.isLoadingPS).toBe(true);
    expect(result.current.personalPitchingStatus).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isLoadingPS).toBe(false);
    });

    expect(result.current.personalPitchingStatus).toEqual(mockData);
    expect(result.current.isError).toBeUndefined();
    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/v1/pitching_results/personal_pitching_stats?user_id=1",
    );
  });

  it("seasonId を指定した場合、クエリパラメータに反映される", async () => {
    (axiosInstance.get as jest.Mock).mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() => usePersonalPitchingResultStats(1, 3), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoadingPS).toBe(false);
    });

    expect(axiosInstance.get).toHaveBeenCalledWith(
      expect.stringContaining("season_id=3"),
    );
  });

  it("year を指定した場合、クエリパラメータに反映される", async () => {
    (axiosInstance.get as jest.Mock).mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(
      () => usePersonalPitchingResultStats(1, undefined, "2024"),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isLoadingPS).toBe(false);
    });

    expect(axiosInstance.get).toHaveBeenCalledWith(
      expect.stringContaining("year=2024"),
    );
  });

  it("matchType を指定した場合、クエリパラメータに反映される", async () => {
    (axiosInstance.get as jest.Mock).mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(
      () => usePersonalPitchingResultStats(1, undefined, undefined, "friendly"),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isLoadingPS).toBe(false);
    });

    expect(axiosInstance.get).toHaveBeenCalledWith(
      expect.stringContaining("match_type=friendly"),
    );
  });

  it("userId が 0（falsy）の場合、データ取得しない", () => {
    const { result } = renderHook(() => usePersonalPitchingResultStats(0), {
      wrapper,
    });

    // SWR の key が null なのでフェッチしない
    expect(axiosInstance.get).not.toHaveBeenCalled();
    expect(result.current.personalPitchingStatus).toBeUndefined();
  });

  it("API がエラーを返した場合、isError がセットされる", async () => {
    const mockError = new Error("API Error");
    (axiosInstance.get as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => usePersonalPitchingResultStats(1), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBeDefined();
    });

    expect(result.current.personalPitchingStatus).toBeUndefined();
  });
});
