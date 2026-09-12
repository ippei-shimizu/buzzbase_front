import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { SWRConfig } from "swr";
import axiosInstance from "@app/utils/axiosInstance";
import useCurrentUserImageId from "../useCurrentUserImageId";

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

describe("useCurrentUserImageId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ログイン中はユーザー情報を取得する", async () => {
    const mockUserData = { user_id: 42, image: { url: "/image.png" } };

    (axiosInstance.get as jest.Mock).mockResolvedValueOnce({
      data: mockUserData,
    });

    const { result } = renderHook(() => useCurrentUserImageId(true), {
      wrapper,
    });

    expect(result.current.isLoadingCurrentUserData).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoadingCurrentUserData).toBe(false);
    });

    expect(result.current.currentUserData).toEqual(mockUserData);
    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/v1/users/show_current_user_details",
      expect.anything(),
    );
  });

  it("未ログイン時はリクエストを送らず、ローディングにもならない", () => {
    const { result } = renderHook(() => useCurrentUserImageId(false), {
      wrapper,
    });

    expect(result.current.isLoadingCurrentUserData).toBe(false);
    expect(result.current.currentUserData).toBeUndefined();
    expect(axiosInstance.get).not.toHaveBeenCalled();
  });

  it("ログイン状態が未確定（undefined）の間はリクエストを送らない", () => {
    const { result } = renderHook(() => useCurrentUserImageId(undefined), {
      wrapper,
    });

    expect(result.current.isLoadingCurrentUserData).toBe(false);
    expect(axiosInstance.get).not.toHaveBeenCalled();
  });
});
