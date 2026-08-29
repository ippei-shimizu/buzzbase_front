const mockGet = jest.fn();

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => Promise.resolve({ get: mockGet })),
}));

jest.mock("@app/constants/api", () => ({
  RAILS_API_URL: "http://back:3000",
}));

jest.mock("../../../lib/sentry-helpers", () => ({
  captureServerActionError: jest.fn(),
}));

import { getFeatureFlagDecisions, getFeatureFlags } from "../actions";

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

function mockJsonResponse(body: unknown, status = 200) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

const consoleErrorSpy = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

afterAll(() => {
  consoleErrorSpy.mockRestore();
});

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

describe("getFeatureFlags", () => {
  it("有効な flag は true を返す", async () => {
    setupAuthCookies();
    mockJsonResponse({ pro_features: true });

    await expect(getFeatureFlags(["pro_features"])).resolves.toEqual({
      pro_features: true,
    });
  });

  it("無効な flag は false を返す", async () => {
    setupAuthCookies();
    mockJsonResponse({ pro_features: false });

    await expect(getFeatureFlags(["pro_features"])).resolves.toEqual({
      pro_features: false,
    });
  });

  it("レスポンスに含まれないキーは false を返す", async () => {
    setupAuthCookies();
    mockJsonResponse({ pro_features: true });

    await expect(
      getFeatureFlags(["pro_features", "cancellation_survey"]),
    ).resolves.toEqual({
      pro_features: true,
      cancellation_survey: false,
    });
  });

  it("true 以外の値（文字列 'true' など）は false 扱いにする", async () => {
    setupAuthCookies();
    mockJsonResponse({ pro_features: "true" });

    await expect(getFeatureFlags(["pro_features"])).resolves.toEqual({
      pro_features: false,
    });
  });

  it("API がエラーを返したら全て false に倒す", async () => {
    setupAuthCookies();
    mockJsonResponse({}, 500);

    await expect(
      getFeatureFlags(["pro_features", "cancellation_survey"]),
    ).resolves.toEqual({
      pro_features: false,
      cancellation_survey: false,
    });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("401 のときはログを出さずに false へ倒す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    await expect(getFeatureFlags(["pro_features"])).resolves.toEqual({
      pro_features: false,
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("fetch が throw しても false に倒す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("network"));

    await expect(getFeatureFlags(["pro_features"])).resolves.toEqual({
      pro_features: false,
    });
  });

  it("認証 cookie が無いときは API を叩かずに false を返す", async () => {
    mockGet.mockReturnValue(undefined);

    await expect(getFeatureFlags(["pro_features"])).resolves.toEqual({
      pro_features: false,
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("keys[] 形式のクエリと認証ヘッダーを付けて問い合わせる", async () => {
    setupAuthCookies();
    mockJsonResponse({ pro_features: true, cancellation_survey: true });

    await getFeatureFlags(["pro_features", "cancellation_survey"]);

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(
      "http://back:3000/api/v1/feature_flags?keys[]=pro_features&keys[]=cancellation_survey",
    );
    expect(init.headers).toMatchObject({
      "access-token": "test-access-token",
      client: "test-client",
      uid: "test-uid",
    });
    expect(init.cache).toBe("no-store");
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });
});

describe("getFeatureFlagDecisions", () => {
  it("back が返した boolean をそのまま判定にする", async () => {
    setupAuthCookies();
    mockJsonResponse({ pro_features: true, cancellation_survey: false });

    await expect(
      getFeatureFlagDecisions(["pro_features", "cancellation_survey"]),
    ).resolves.toEqual({
      pro_features: "enabled",
      cancellation_survey: "disabled",
    });
  });

  it("レスポンスに含まれないキーは indeterminate を返す", async () => {
    setupAuthCookies();
    mockJsonResponse({});

    await expect(getFeatureFlagDecisions(["pro_features"])).resolves.toEqual({
      pro_features: "indeterminate",
    });
  });

  it("boolean 以外の値（文字列 'false' など）は indeterminate を返す", async () => {
    setupAuthCookies();
    mockJsonResponse({ pro_features: "false" });

    await expect(getFeatureFlagDecisions(["pro_features"])).resolves.toEqual({
      pro_features: "indeterminate",
    });
  });

  it("認証 cookie が無いときは disabled と断定せず indeterminate を返す", async () => {
    mockGet.mockReturnValue(undefined);

    await expect(getFeatureFlagDecisions(["pro_features"])).resolves.toEqual({
      pro_features: "indeterminate",
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("API がエラーを返したときも disabled と断定しない", async () => {
    setupAuthCookies();
    mockJsonResponse({}, 500);

    await expect(getFeatureFlagDecisions(["pro_features"])).resolves.toEqual({
      pro_features: "indeterminate",
    });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("401 のときはログを出さずに indeterminate を返す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    await expect(getFeatureFlagDecisions(["pro_features"])).resolves.toEqual({
      pro_features: "indeterminate",
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("fetch が throw しても indeterminate を返す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("network"));

    await expect(getFeatureFlagDecisions(["pro_features"])).resolves.toEqual({
      pro_features: "indeterminate",
    });
  });
});
