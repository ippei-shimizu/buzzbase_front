const mockGet = jest.fn();

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => Promise.resolve({ get: mockGet })),
}));

jest.mock("@app/constants/api", () => ({
  RAILS_API_URL: "http://back:3000",
}));

jest.mock("../../../../lib/sentry-helpers", () => ({
  captureServerActionError: jest.fn(),
}));

import {
  createMenuSet,
  deleteMenuSet,
  getMenuSet,
  getMenuSets,
  updateMenuSet,
} from "../menuSetService";
import {
  createPracticeLog,
  deletePracticeLog,
  getPracticeLogs,
} from "../practiceLogService";
import {
  createPracticeMenu,
  deletePracticeMenu,
  getPracticeMenus,
  updatePracticeMenu,
} from "../practiceMenuService";
import {
  deletePracticeSession,
  getPracticeSession,
  getPracticeSessionByDate,
  getPracticeSessions,
  upsertPracticeSession,
} from "../practiceSessionService";
import {
  getMenuSummaries,
  getMenuTrend,
  getPracticeOverview,
  getShadowSwingTrend,
} from "../practiceSummaryService";
import { buildQuery } from "../requests";

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

function requestedUrl(callIndex = 0): string {
  return (global.fetch as jest.Mock).mock.calls[callIndex][0] as string;
}

function requestedInit(callIndex = 0): RequestInit {
  return (global.fetch as jest.Mock).mock.calls[callIndex][1] as RequestInit;
}

const practiceMenu = {
  id: 1,
  name: "素振り",
  category: "batting",
  unit: "count",
  unit_label: "本",
  default_value: "200.0",
  is_favorite: true,
  sort_order: 0,
};

describe("練習ドメインの v2 Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    setupAuthCookies();
  });

  describe("認証ヘッダー", () => {
    it("3トークンを付けて no-store で叩く", async () => {
      mockResponse(200, []);
      await getPracticeMenus();

      expect(requestedInit()).toEqual(
        expect.objectContaining({
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

    it("Cookie が欠けていればリクエストせず error を返す", async () => {
      mockGet.mockReturnValue(undefined);

      const result = await getPracticeMenus();

      expect(result).toEqual({ status: "error" });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("Cookie が欠けている更新系はリクエストせず失敗を返す", async () => {
      mockGet.mockReturnValue(undefined);

      const result = await createPracticeMenu({
        name: "ティー",
        category: "batting",
        unit: "count",
      });

      expect(result).toEqual({
        ok: false,
        reason: "error",
        errors: ["ログインが必要です"],
      });
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("getPracticeMenus", () => {
    it("メニュー一覧を取得する", async () => {
      mockResponse(200, [practiceMenu]);

      const result = await getPracticeMenus();

      expect(result).toEqual({ status: "ok", data: [practiceMenu] });
      expect(requestedUrl()).toBe("http://back:3000/api/v2/practice_menus");
    });

    it("0件は error ではなく空配列の ok として返す", async () => {
      mockResponse(200, []);

      expect(await getPracticeMenus()).toEqual({ status: "ok", data: [] });
    });

    it("500 は error を返す", async () => {
      mockResponse(500, { errors: ["失敗"] });

      expect(await getPracticeMenus()).toEqual({ status: "error" });
    });

    it("通信例外は error を返す", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("network"));

      expect(await getPracticeMenus()).toEqual({ status: "error" });
    });
  });

  describe("createPracticeMenu", () => {
    it("practice_menu でラップして POST する", async () => {
      mockResponse(201, practiceMenu);

      const result = await createPracticeMenu({
        name: "ティー",
        category: "batting",
        unit: "count",
        unit_label: "球",
        default_value: 150,
      });

      expect(result).toEqual({ ok: true, data: practiceMenu });
      expect(requestedUrl()).toBe("http://back:3000/api/v2/practice_menus");
      expect(requestedInit().method).toBe("POST");
      expect(JSON.parse(requestedInit().body as string)).toEqual({
        practice_menu: {
          name: "ティー",
          category: "batting",
          unit: "count",
          unit_label: "球",
          default_value: 150,
        },
      });
    });

    it("上限超過の 403 は forbidden として返し、バリデーションエラーと区別する", async () => {
      mockResponse(403, {
        error: "Pro プランで練習メニューを無制限に登録できます",
      });

      expect(
        await createPracticeMenu({
          name: "4つ目",
          category: "other",
          unit: "count",
        }),
      ).toEqual({
        ok: false,
        reason: "forbidden",
        errors: ["Pro プランで練習メニューを無制限に登録できます"],
      });
    });

    it("422 は error としてバリデーションメッセージを返す", async () => {
      mockResponse(422, { errors: ["名前を入力してください"] });

      expect(
        await createPracticeMenu({
          name: "",
          category: "other",
          unit: "count",
        }),
      ).toEqual({
        ok: false,
        reason: "error",
        errors: ["名前を入力してください"],
      });
    });

    it("エラー本文が無ければ既定のメッセージを返す", async () => {
      mockResponse(500, null);

      expect(
        await createPracticeMenu({
          name: "x",
          category: "other",
          unit: "count",
        }),
      ).toEqual({
        ok: false,
        reason: "error",
        errors: ["練習メニューの作成に失敗しました"],
      });
    });
  });

  describe("updatePracticeMenu / deletePracticeMenu", () => {
    it("PATCH で更新する", async () => {
      mockResponse(200, practiceMenu);

      await updatePracticeMenu(7, { is_favorite: false });

      expect(requestedUrl()).toBe("http://back:3000/api/v2/practice_menus/7");
      expect(requestedInit().method).toBe("PATCH");
      expect(JSON.parse(requestedInit().body as string)).toEqual({
        practice_menu: { is_favorite: false },
      });
    });

    it("DELETE は本文なしで叩く", async () => {
      mockResponse(200, { message: "削除しました" });

      const result = await deletePracticeMenu(7);

      expect(result).toEqual({ ok: true, data: { message: "削除しました" } });
      expect(requestedUrl()).toBe("http://back:3000/api/v2/practice_menus/7");
      expect(requestedInit().method).toBe("DELETE");
      expect(requestedInit().body).toBeUndefined();
    });
  });

  describe("getPracticeLogs", () => {
    it("期間指定なしはクエリを付けない", async () => {
      mockResponse(200, []);

      await getPracticeLogs();

      expect(requestedUrl()).toBe("http://back:3000/api/v2/practice_logs");
    });

    it("from / to を back のパラメータ名で送る", async () => {
      mockResponse(200, []);

      await getPracticeLogs({ from: "2026-08-01", to: "2026-08-31" });

      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/practice_logs?from=2026-08-01&to=2026-08-31",
      );
    });

    it("片方だけの指定でも欠けたキーは送らない", async () => {
      mockResponse(200, []);

      await getPracticeLogs({ from: "2026-08-01" });

      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/practice_logs?from=2026-08-01",
      );
    });

    it("空文字の絞り込みは送らない（back が空値を条件として解釈しないようにする）", async () => {
      mockResponse(200, []);

      await getPracticeLogs({ from: "", to: "2026-08-31" });

      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/practice_logs?to=2026-08-31",
      );
    });
  });

  describe("buildQuery", () => {
    it("null / undefined / 空文字のパラメータは送らない", () => {
      expect(buildQuery({ a: "1", b: null, c: undefined, d: "" })).toBe("?a=1");
    });

    it("送る値が1つも無ければ空文字を返す（末尾の ? を付けない）", () => {
      expect(buildQuery({ a: null, b: undefined })).toBe("");
    });

    it("数値は文字列化して送る", () => {
      expect(buildQuery({ improvement_theme_id: 5 })).toBe(
        "?improvement_theme_id=5",
      );
    });
  });

  describe("createPracticeLog / deletePracticeLog", () => {
    it("practice_log でラップして POST する", async () => {
      mockResponse(201, { id: 1 });

      await createPracticeLog({
        practice_menu_id: 3,
        logged_on: "2026-08-03",
        amount: 200,
        memo: "外角重点",
      });

      expect(requestedUrl()).toBe("http://back:3000/api/v2/practice_logs");
      expect(JSON.parse(requestedInit().body as string)).toEqual({
        practice_log: {
          practice_menu_id: 3,
          logged_on: "2026-08-03",
          amount: 200,
          memo: "外角重点",
        },
      });
    });

    it("削除は DELETE /api/v2/practice_logs/:id", async () => {
      mockResponse(200, { message: "削除しました" });

      await deletePracticeLog(9);

      expect(requestedUrl()).toBe("http://back:3000/api/v2/practice_logs/9");
      expect(requestedInit().method).toBe("DELETE");
    });
  });

  describe("練習セッション", () => {
    it("一覧は from / to / improvement_theme_id を送る", async () => {
      mockResponse(200, []);

      await getPracticeSessions({
        from: "2026-08-01",
        to: "2026-08-31",
        improvement_theme_id: 5,
      });

      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/practice_sessions?from=2026-08-01&to=2026-08-31&improvement_theme_id=5",
      );
    });

    it("単一取得は id をパスに付ける", async () => {
      mockResponse(200, { id: 4 });

      await getPracticeSession(4);

      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/practice_sessions/4",
      );
    });

    it("他ユーザーのセッション（404）は取得失敗と区別して not_found を返す", async () => {
      mockResponse(404, {});

      expect(await getPracticeSession(4)).toEqual({ status: "not_found" });
    });

    it("通信エラーは not_found と区別して error を返す", async () => {
      mockResponse(500, {});

      expect(await getPracticeSession(4)).toEqual({ status: "error" });
    });

    it("日付指定は by_date に date クエリで問い合わせる", async () => {
      mockResponse(200, { id: 4 });

      await getPracticeSessionByDate("2026-08-03");

      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/practice_sessions/by_date?date=2026-08-03",
      );
    });

    it("記録の無い日は null を ok として返す（取得失敗と区別する）", async () => {
      mockResponse(200, null);

      expect(await getPracticeSessionByDate("2026-08-03")).toEqual({
        status: "ok",
        data: null,
      });
    });

    it("保存は practice_session でラップして POST する", async () => {
      mockResponse(201, { id: 4 });

      await upsertPracticeSession({
        logged_on: "2026-08-03",
        memo: "今日の振り返り",
        items: [{ practice_menu_id: 1, amount: 200 }],
      });

      expect(requestedUrl()).toBe("http://back:3000/api/v2/practice_sessions");
      expect(requestedInit().method).toBe("POST");
      expect(JSON.parse(requestedInit().body as string)).toEqual({
        practice_session: {
          logged_on: "2026-08-03",
          memo: "今日の振り返り",
          items: [{ practice_menu_id: 1, amount: 200 }],
        },
      });
    });

    it("無料ユーザーのコンディション保存（403）は forbidden として返す", async () => {
      mockResponse(403, { error: "コンディション記録は Pro プラン限定です" });

      expect(
        await upsertPracticeSession({
          logged_on: "2026-08-03",
          items: [],
          condition: { fatigue_level: 3 },
        }),
      ).toEqual({
        ok: false,
        reason: "forbidden",
        errors: ["コンディション記録は Pro プラン限定です"],
      });
    });

    it("削除は DELETE /api/v2/practice_sessions/:id", async () => {
      mockResponse(200, { message: "削除しました" });

      await deletePracticeSession(4);

      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/practice_sessions/4",
      );
      expect(requestedInit().method).toBe("DELETE");
    });
  });

  describe("練習サマリー", () => {
    it("メニュー別サマリーを取得する", async () => {
      mockResponse(200, []);

      await getMenuSummaries();

      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/practice_menu_summaries",
      );
    });

    it("全体 KPI を取得する", async () => {
      const overview = {
        total_practice_days: 2,
        this_month_practice_days: 1,
        total_swing_count: 50,
        total_volume: 600,
        total_menus: 2,
      };
      mockResponse(200, overview);

      expect(await getPracticeOverview()).toEqual({
        status: "ok",
        data: overview,
      });
      expect(requestedUrl()).toBe("http://back:3000/api/v2/practice_overview");
    });

    it("メニュー推移はメニュー id をパスに付ける", async () => {
      mockResponse(200, { menu: { id: 3 } });

      await getMenuTrend(3);

      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/practice_menu_trends/3",
      );
    });

    it("無料ユーザーのメニュー推移（403）は forbidden を返す", async () => {
      mockResponse(403, {
        error: "メニュー推移の詳細表示は Pro プラン限定です",
      });

      expect(await getMenuTrend(3)).toEqual({ status: "forbidden" });
    });

    it("素振りの推移はメニュー推移とは別のエンドポイントを叩く", async () => {
      const trend = {
        menu: {
          id: null,
          name: "素振り",
          unit: "count",
          unit_label: "本",
          is_weight_reps: false,
        },
        by_year: [],
        by_month: [],
        by_day: [],
      };
      mockResponse(200, trend);

      expect(await getShadowSwingTrend()).toEqual({
        status: "ok",
        data: trend,
      });
      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/shadow_swing_sessions/trend",
      );
      expect(requestedInit().method).toBeUndefined();
    });

    it("無料ユーザーの素振り推移（403）は forbidden を返す", async () => {
      mockResponse(403, {
        error: "メニュー推移の詳細表示は Pro プラン限定です",
      });

      expect(await getShadowSwingTrend()).toEqual({ status: "forbidden" });
    });
  });

  describe("メニューセット", () => {
    it("一覧を取得する", async () => {
      mockResponse(200, []);

      await getMenuSets();

      expect(requestedUrl()).toBe("http://back:3000/api/v2/menu_sets");
    });

    it("単一取得は id をパスに付ける", async () => {
      mockResponse(200, { id: 2 });

      await getMenuSet(2);

      expect(requestedUrl()).toBe("http://back:3000/api/v2/menu_sets/2");
    });

    it("menu_set でラップして POST する", async () => {
      mockResponse(201, { id: 2 });

      await createMenuSet({
        name: "オフ日ルーティン",
        items: [{ practice_menu_id: 1, target_value: 200 }],
      });

      expect(requestedInit().method).toBe("POST");
      expect(JSON.parse(requestedInit().body as string)).toEqual({
        menu_set: {
          name: "オフ日ルーティン",
          items: [{ practice_menu_id: 1, target_value: 200 }],
        },
      });
    });

    it("上限超過の 403 は forbidden として返す", async () => {
      mockResponse(403, {
        error: "Pro プランでメニューセットを無制限に登録できます",
      });

      expect(await createMenuSet({ name: "3つ目" })).toEqual({
        ok: false,
        reason: "forbidden",
        errors: ["Pro プランでメニューセットを無制限に登録できます"],
      });
    });

    it("更新は PATCH /api/v2/menu_sets/:id", async () => {
      mockResponse(200, { id: 2 });

      await updateMenuSet(2, { name: "新" });

      expect(requestedUrl()).toBe("http://back:3000/api/v2/menu_sets/2");
      expect(requestedInit().method).toBe("PATCH");
    });

    it("削除は DELETE /api/v2/menu_sets/:id", async () => {
      mockResponse(200, { message: "削除しました" });

      await deleteMenuSet(2);

      expect(requestedUrl()).toBe("http://back:3000/api/v2/menu_sets/2");
      expect(requestedInit().method).toBe("DELETE");
    });
  });
});
