const mockGet = jest.fn();
const mockCookieStore = { get: mockGet };

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => Promise.resolve(mockCookieStore)),
}));

jest.mock("../../../constants/api", () => ({
  RAILS_API_URL: "http://back:3000",
}));

jest.mock("../../../../lib/sentry-helpers", () => ({
  captureServerActionError: jest.fn(),
}));

import { startProCheckout } from "../actions";

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

describe("startProCheckout", () => {
  const originalAppUrl = process.env.APP_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    process.env.APP_URL = "http://localhost:8100";
  });

  afterAll(() => {
    process.env.APP_URL = originalAppUrl;
  });

  it("認証済み + 正常な plan で checkout_url を返し、success_url/cancel_url はサーバー側 APP_URL から構築される", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        checkout_url: "https://checkout.stripe.com/sess_x",
      }),
    });

    const result = await startProCheckout({ plan: "monthly" });

    expect(result).toEqual({
      ok: true,
      checkoutUrl: "https://checkout.stripe.com/sess_x",
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "http://back:3000/api/v1/pro/checkout",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          plan: "monthly",
          success_url:
            "http://localhost:8100/pro/success?session_id={CHECKOUT_SESSION_ID}",
          cancel_url: "http://localhost:8100/pro/cancel",
        }),
      }),
    );
  });

  it("未認証 cookie のとき unauthorized を返す（fetch しない）", async () => {
    mockGet.mockReturnValue(undefined);

    const result = await startProCheckout({ plan: "monthly" });

    expect(result).toEqual({ ok: false, error: "unauthorized" });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("401 のとき unauthorized を返す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({}),
    });

    const result = await startProCheckout({ plan: "monthly" });

    expect(result).toEqual({ ok: false, error: "unauthorized" });
  });

  it("409 のとき already_subscribed を返す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ error: "already_subscribed" }),
    });

    const result = await startProCheckout({ plan: "monthly" });

    expect(result).toEqual({ ok: false, error: "already_subscribed" });
  });

  it("422 invalid_plan のとき invalid_plan を返す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({ error: "invalid_plan" }),
    });

    const result = await startProCheckout({ plan: "monthly" });

    expect(result).toEqual({ ok: false, error: "invalid_plan" });
  });

  it("502 stripe_api_error のとき stripe_api_error を返す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: async () => ({ error: "stripe_api_error" }),
    });

    const result = await startProCheckout({ plan: "monthly" });

    expect(result).toEqual({ ok: false, error: "stripe_api_error" });
  });

  it("fetch が throw したら unknown error を返す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("network"));

    const result = await startProCheckout({ plan: "yearly" });

    expect(result).toEqual({ ok: false, error: "unknown" });
  });

  it("APP_URL が未設定なら http://localhost:8100 をデフォルトとして使う", async () => {
    delete process.env.APP_URL;
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        checkout_url: "https://checkout.stripe.com/sess_y",
      }),
    });

    await startProCheckout({ plan: "yearly" });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://back:3000/api/v1/pro/checkout",
      expect.objectContaining({
        body: expect.stringContaining("http://localhost:8100/pro/success"),
      }),
    );
  });
});
