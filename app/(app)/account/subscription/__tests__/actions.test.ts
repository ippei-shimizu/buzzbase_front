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

import { captureServerActionError } from "../../../../../lib/sentry-helpers";
import {
  cancelWebSubscription,
  changeProPlan,
  submitCancellationFeedback,
} from "../actions";

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

describe("changeProPlan", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it.each<"monthly" | "yearly">(["monthly", "yearly"])(
    "plan=%s を PATCH /api/v1/pro/subscription のボディで送る",
    async (plan) => {
      setupAuthCookies();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ message: "プラン変更を受け付けました" }),
      });

      await expect(changeProPlan(plan)).resolves.toEqual({ ok: true });
      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v1/pro/subscription",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ plan }),
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "access-token": "test-access-token",
            client: "test-client",
            uid: "test-uid",
          }),
        }),
      );
    },
  );

  it("未認証 cookie のときは fetch せずに unauthorized を返す", async () => {
    mockGet.mockReturnValue(undefined);

    await expect(changeProPlan("yearly")).resolves.toEqual({
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

    await expect(changeProPlan("yearly")).resolves.toEqual({
      ok: false,
      error: "unauthorized",
    });
  });

  it.each([
    { status: 422, error: "no_active_subscription" },
    { status: 422, error: "invalid_plan" },
    { status: 502, error: "stripe_api_error" },
  ])("$status $error を区別して返す", async ({ status, error }) => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status,
      json: async () => ({ error }),
    });

    await expect(changeProPlan("yearly")).resolves.toEqual({
      ok: false,
      error,
    });
  });

  it("想定外のエラーコードは unknown に畳む", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "internal_server_error" }),
    });

    await expect(changeProPlan("yearly")).resolves.toEqual({
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

    await expect(changeProPlan("yearly")).resolves.toEqual({
      ok: false,
      error: "unknown",
    });
  });

  it("fetch が throw したら unknown を返す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("network"));

    await expect(changeProPlan("yearly")).resolves.toEqual({
      ok: false,
      error: "unknown",
    });
  });

  // 呼び出し元が分かる形で記録しないと、解約側の失敗と区別できず調査できない。
  it("例外は changeProPlan として記録する", async () => {
    setupAuthCookies();
    const failure = new Error("network");
    (global.fetch as jest.Mock).mockRejectedValueOnce(failure);

    await changeProPlan("yearly");

    expect(captureServerActionError).toHaveBeenCalledWith(failure, {
      action: "changeProPlan",
    });
  });

  it("タイムアウト用の AbortSignal を渡す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await changeProPlan("yearly");

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });
});

describe("submitCancellationFeedback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("POST /api/v1/pro/cancellation_feedbacks に reason を送る", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: 1 }),
    });

    await expect(
      submitCancellationFeedback({ reason: "expensive" }),
    ).resolves.toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalledWith(
      "http://back:3000/api/v1/pro/cancellation_feedbacks",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ reason: "expensive" }),
        cache: "no-store",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "access-token": "test-access-token",
          client: "test-client",
          uid: "test-uid",
        }),
      }),
    );
  });

  it("note があれば reason と一緒に送る", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: 1 }),
    });

    await submitCancellationFeedback({ reason: "other", note: "使いにくい" });

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.body).toBe(
      JSON.stringify({ reason: "other", note: "使いにくい" }),
    );
  });

  // back は note を allow_blank で受けるが、空文字を送ると意味のない回答が保存される。
  it.each(["", "   "])("note が %p のときはキーごと送らない", async (note) => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: 1 }),
    });

    await submitCancellationFeedback({ reason: "less_usage", note });

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.body).toBe(JSON.stringify({ reason: "less_usage" }));
  });

  it("未認証 cookie のときは fetch せずに unauthorized を返す", async () => {
    mockGet.mockReturnValue(undefined);

    await expect(
      submitCancellationFeedback({ reason: "expensive" }),
    ).resolves.toEqual({ ok: false, error: "unauthorized" });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("401 のとき unauthorized を返す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({}),
    });

    await expect(
      submitCancellationFeedback({ reason: "expensive" }),
    ).resolves.toEqual({ ok: false, error: "unauthorized" });
  });

  // back は Flipper 無効時に head :not_found を返す（本文は空）。
  it("404 は本文が無くても survey_disabled として返す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => {
        throw new Error("no body");
      },
    });

    await expect(
      submitCancellationFeedback({ reason: "expensive" }),
    ).resolves.toEqual({ ok: false, error: "survey_disabled" });
  });

  it.each(["reason_required", "invalid_reason", "note_too_long"])(
    "422 %s を区別して返す",
    async (error) => {
      setupAuthCookies();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({ error }),
      });

      await expect(
        submitCancellationFeedback({ reason: "other" }),
      ).resolves.toEqual({ ok: false, error });
    },
  );

  it("想定外のエラーコードは unknown に畳む", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({ error: "invalid" }),
    });

    await expect(
      submitCancellationFeedback({ reason: "other" }),
    ).resolves.toEqual({ ok: false, error: "unknown" });
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

    await expect(
      submitCancellationFeedback({ reason: "other" }),
    ).resolves.toEqual({ ok: false, error: "unknown" });
  });

  it("fetch が throw したら unknown を返す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("network"));

    await expect(
      submitCancellationFeedback({ reason: "other" }),
    ).resolves.toEqual({ ok: false, error: "unknown" });
  });

  it("例外は submitCancellationFeedback として記録する", async () => {
    setupAuthCookies();
    const failure = new Error("network");
    (global.fetch as jest.Mock).mockRejectedValueOnce(failure);

    await submitCancellationFeedback({ reason: "other" });

    expect(captureServerActionError).toHaveBeenCalledWith(failure, {
      action: "submitCancellationFeedback",
    });
  });

  it("タイムアウト用の AbortSignal を渡す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: 1 }),
    });

    await submitCancellationFeedback({ reason: "other" });

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });
});
