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

import type { Schedule } from "@app/types/schedule";
import {
  copyScheduleWeekToNext,
  createSchedule,
  deleteSchedule,
  getSchedules,
  updateSchedule,
} from "../scheduleService";

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

const schedule: Schedule = {
  id: 10,
  title: "朝の素振り",
  days_of_week: "1,3,5",
  planned_on: null,
  scheduled_time: "06:00",
  event_type: "self_practice",
  recurring: true,
  menu_set_id: null,
  game_result_id: null,
  note: null,
  notification_enabled: true,
  active: true,
  notification_message: null,
  menus: [],
  logged_practice_menu_ids: [],
};

describe("scheduleService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    setupAuthCookies();
  });

  it("一覧は GET /api/v2/schedules を叩く", async () => {
    mockResponse(200, [schedule]);

    const result = await getSchedules();

    expect(requestedUrl()).toBe("http://back:3000/api/v2/schedules");
    expect(result).toEqual({ status: "ok", data: [schedule] });
  });

  it("作成は POST /api/v2/schedules に schedule でラップして送る", async () => {
    mockResponse(201, schedule);

    const result = await createSchedule({
      title: "朝の素振り",
      days_of_week: "1,3,5",
      planned_on: null,
    });

    expect(requestedUrl()).toBe("http://back:3000/api/v2/schedules");
    const init = requestedInit();
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      schedule: {
        title: "朝の素振り",
        days_of_week: "1,3,5",
        planned_on: null,
      },
    });
    expect(result).toEqual({ ok: true, data: schedule });
  });

  it("更新は PATCH /api/v2/schedules/:id を叩く", async () => {
    mockResponse(200, schedule);

    await updateSchedule(10, { title: "朝練" });

    expect(requestedUrl()).toBe("http://back:3000/api/v2/schedules/10");
    expect(requestedInit().method).toBe("PATCH");
  });

  it("削除は DELETE /api/v2/schedules/:id を叩く", async () => {
    mockResponse(200, { message: "削除しました" });

    const result = await deleteSchedule(10);

    expect(requestedUrl()).toBe("http://back:3000/api/v2/schedules/10");
    expect(requestedInit().method).toBe("DELETE");
    expect(result).toEqual({ ok: true, data: { message: "削除しました" } });
  });

  it("来週へのコピーは POST /api/v2/schedules/week_copy に week_start を送る", async () => {
    const copied = { ...schedule, id: 11, planned_on: "2026-08-10" };
    mockResponse(201, [copied]);

    const result = await copyScheduleWeekToNext("2026-08-03");

    expect(requestedUrl()).toBe("http://back:3000/api/v2/schedules/week_copy");
    const init = requestedInit();
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      week_start: "2026-08-03",
    });
    expect(result).toEqual({ ok: true, data: [copied] });
  });

  it("コピー元が0件でも 201 + 空配列を成功として返す", async () => {
    mockResponse(201, []);

    await expect(copyScheduleWeekToNext("2026-08-03")).resolves.toEqual({
      ok: true,
      data: [],
    });
  });

  it("無料プランの 403 は forbidden として返す（Pro 限定機能）", async () => {
    mockResponse(403, { error: "来週にコピーは Pro プラン限定です" });

    await expect(copyScheduleWeekToNext("2026-08-03")).resolves.toEqual({
      ok: false,
      reason: "forbidden",
      errors: ["来週にコピーは Pro プラン限定です"],
    });
  });

  it("422 のバリデーションエラーはメッセージを取り出して返す", async () => {
    mockResponse(422, { errors: ["曜日と日付は同時に指定できません"] });

    const result = await createSchedule({ title: "x" });

    expect(result).toEqual({
      ok: false,
      reason: "error",
      errors: ["曜日と日付は同時に指定できません"],
    });
  });
});
