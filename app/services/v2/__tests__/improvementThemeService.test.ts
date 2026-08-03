const mockGet = jest.fn();

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => Promise.resolve({ get: mockGet })),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@app/constants/api", () => ({
  RAILS_API_URL: "http://back:3000",
}));

jest.mock("../../../../lib/sentry-helpers", () => ({
  captureServerActionError: jest.fn(),
}));

import {
  getGameResultOption,
  searchGameResultOptions,
} from "../gameResultLinkService";
import {
  createImprovementTheme,
  deleteImprovementTheme,
  getImprovementThemes,
  updateImprovementTheme,
} from "../improvementThemeService";

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

function mockResponse(status: number, body: unknown) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

function requestedUrl(): string {
  return (global.fetch as jest.Mock).mock.calls[0][0] as string;
}

function requestedInit(): RequestInit {
  return (global.fetch as jest.Mock).mock.calls[0][1] as RequestInit;
}

const theme = {
  id: 5,
  title: "肩の開きを抑える",
  category: "batting",
  purpose: null,
  status: "open",
  started_on: "2026-07-01",
  achieved_on: null,
  sort_order: 0,
  practice_logs_count: 3,
  notes_count: 2,
  active_days: 4,
  created_at: "2026-07-01T00:00:00.000Z",
};

describe("課題の v2 Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    setupAuthCookies();
  });

  describe("getImprovementThemes", () => {
    it("GET /api/v2/improvement_themes を叩く", async () => {
      mockResponse(200, [theme]);

      const result = await getImprovementThemes();

      expect(requestedUrl()).toBe("http://back:3000/api/v2/improvement_themes");
      expect(result).toEqual({ status: "ok", data: [theme] });
    });

    it("status で絞り込める", async () => {
      mockResponse(200, [theme]);

      await getImprovementThemes({ status: "open" });

      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/improvement_themes?status=open",
      );
    });

    it("0件は取得成功として空配列を返す", async () => {
      mockResponse(200, []);

      expect(await getImprovementThemes()).toEqual({ status: "ok", data: [] });
    });

    it("取得失敗は 0件と区別して error を返す", async () => {
      mockResponse(500, {});

      expect(await getImprovementThemes()).toEqual({ status: "error" });
    });
  });

  describe("createImprovementTheme", () => {
    it("POST で improvement_theme を包んで送る", async () => {
      mockResponse(201, theme);

      const result = await createImprovementTheme({
        title: "肩の開きを抑える",
        category: "batting",
        purpose: null,
      });

      expect(requestedUrl()).toBe("http://back:3000/api/v2/improvement_themes");
      expect(requestedInit().method).toBe("POST");
      expect(JSON.parse(requestedInit().body as string)).toEqual({
        improvement_theme: {
          title: "肩の開きを抑える",
          category: "batting",
          purpose: null,
        },
      });
      expect(result).toEqual({ ok: true, data: theme });
    });

    it("無料枠超過の 403 は forbidden として返す", async () => {
      mockResponse(403, { error: "取組中の課題は無料プランで2つまでです" });

      const result = await createImprovementTheme({ title: "3つ目" });

      expect(result).toEqual({
        ok: false,
        reason: "forbidden",
        errors: ["取組中の課題は無料プランで2つまでです"],
      });
    });
  });

  describe("updateImprovementTheme", () => {
    it("PATCH で状態遷移を送る", async () => {
      mockResponse(200, { ...theme, status: "achieved" });

      await updateImprovementTheme(5, {
        status: "achieved",
        achieved_on: "2026-08-03",
      });

      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/improvement_themes/5",
      );
      expect(requestedInit().method).toBe("PATCH");
      expect(JSON.parse(requestedInit().body as string)).toEqual({
        improvement_theme: { status: "achieved", achieved_on: "2026-08-03" },
      });
    });
  });

  describe("deleteImprovementTheme", () => {
    it("DELETE を叩く", async () => {
      mockResponse(200, { message: "削除しました" });

      const result = await deleteImprovementTheme(5);

      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/improvement_themes/5",
      );
      expect(requestedInit().method).toBe("DELETE");
      expect(result).toEqual({ ok: true, data: { message: "削除しました" } });
    });
  });
});

describe("試合記録の紐付け候補", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    setupAuthCookies();
  });

  const rawGameResult = {
    game_result_id: 101,
    match_result: {
      date_and_time: "2026-07-20T13:00:00.000+09:00",
      opponent_team_name: "青空高校",
    },
  };

  it("対戦相手の検索はサーバー側の filtered_index に委ねる", async () => {
    mockResponse(200, { data: [rawGameResult] });

    const result = await searchGameResultOptions("青空");

    expect(requestedUrl()).toBe(
      "http://back:3000/api/v2/game_results/filtered_index?search=%E9%9D%92%E7%A9%BA&per_page=20",
    );
    expect(result).toEqual({
      status: "ok",
      data: [
        {
          game_result_id: 101,
          date: "2026-07-20",
          opponent_team_name: "青空高校",
        },
      ],
    });
  });

  it("検索語が無ければ search を送らない", async () => {
    mockResponse(200, { data: [] });

    await searchGameResultOptions(undefined);

    expect(requestedUrl()).toBe(
      "http://back:3000/api/v2/game_results/filtered_index?per_page=20",
    );
  });

  it("0件は取得成功として空配列を返す", async () => {
    mockResponse(200, { data: [] });

    expect(await searchGameResultOptions("該当なし")).toEqual({
      status: "ok",
      data: [],
    });
  });

  it("取得失敗は 0件と区別して error を返す", async () => {
    mockResponse(500, {});

    expect(await searchGameResultOptions("青空")).toEqual({ status: "error" });
  });

  it("紐付け済みの1件は show エンドポイントから引く", async () => {
    mockResponse(200, rawGameResult);

    const result = await getGameResultOption(101);

    expect(requestedUrl()).toBe("http://back:3000/api/v2/game_results/101");
    expect(result).toEqual({
      status: "ok",
      data: {
        game_result_id: 101,
        date: "2026-07-20",
        opponent_team_name: "青空高校",
      },
    });
  });
});
