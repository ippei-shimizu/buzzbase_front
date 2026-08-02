const mockGet = jest.fn();

jest.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: mockGet }),
}));

jest.mock("../../../../constants/api", () => ({
  RAILS_API_URL: "http://back:3000",
}));

jest.mock("../../../../../lib/sentry-helpers", () => ({
  captureServerActionError: jest.fn(),
}));

import { cancelWebSubscription } from "../actions";

function setupAuthCookies() {
  mockGet.mockImplementation((key: string) => {
    const values: Record<string, { value: string }> = {
      "access-token": { value: "test-access-token" },
      client: { value: "test-client" },
      uid: { value: "test-uid" },
    };
    return values[key];
  });
}

describe("cancelWebSubscription", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("認証済みなら DELETE /api/v1/pro/subscription を叩いて成功を返す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ message: "解約申請を受け付けました" }),
    });

    await expect(cancelWebSubscription()).resolves.toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalledWith(
      "http://back:3000/api/v1/pro/subscription",
      expect.objectContaining({
        method: "DELETE",
        headers: expect.objectContaining({
          "access-token": "test-access-token",
          client: "test-client",
          uid: "test-uid",
        }),
      }),
    );
  });

  it("未認証 cookie のときは fetch せずに unauthorized を返す", async () => {
    mockGet.mockReturnValue(undefined);

    await expect(cancelWebSubscription()).resolves.toEqual({
      ok: false,
      error: "unauthorized",
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("401 のとき unauthorized を返す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({}),
    });

    await expect(cancelWebSubscription()).resolves.toEqual({
      ok: false,
      error: "unauthorized",
    });
  });

  it("422 no_active_subscription を区別して返す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({ error: "no_active_subscription" }),
    });

    await expect(cancelWebSubscription()).resolves.toEqual({
      ok: false,
      error: "no_active_subscription",
    });
  });

  it("502 stripe_api_error を区別して返す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: async () => ({ error: "stripe_api_error" }),
    });

    await expect(cancelWebSubscription()).resolves.toEqual({
      ok: false,
      error: "stripe_api_error",
    });
  });

  it("想定外のエラーコードは unknown に畳む", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "internal_server_error" }),
    });

    await expect(cancelWebSubscription()).resolves.toEqual({
      ok: false,
      error: "unknown",
    });
  });

  it("JSON でないエラーレスポンスでも unknown を返す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("not json");
      },
    });

    await expect(cancelWebSubscription()).resolves.toEqual({
      ok: false,
      error: "unknown",
    });
  });

  it("fetch が throw したら unknown を返す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("network"));

    await expect(cancelWebSubscription()).resolves.toEqual({
      ok: false,
      error: "unknown",
    });
  });

  it("タイムアウト用の AbortSignal を渡す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await cancelWebSubscription();

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });
});
