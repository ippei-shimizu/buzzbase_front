const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

jest.mock("sonner", () => ({
  toast: { error: jest.fn(), success: jest.fn(), info: jest.fn() },
}));

jest.mock("@app/services/v2/practiceLogService", () => ({
  createPracticeLog: jest.fn(),
  deletePracticeLog: jest.fn(),
}));

jest.mock("@app/services/v2/scheduleService", () => ({
  deleteSchedule: jest.fn(),
}));

import type { Schedule } from "@app/types/schedule";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createPracticeLog,
  deletePracticeLog,
} from "@app/services/v2/practiceLogService";
import { deleteSchedule } from "@app/services/v2/scheduleService";
import ScheduleDetailContent from "../_components/ScheduleDetailContent";

const mockCreateLog = createPracticeLog as jest.MockedFunction<
  typeof createPracticeLog
>;
const mockDeleteLog = deletePracticeLog as jest.MockedFunction<
  typeof deletePracticeLog
>;
const mockDeleteSchedule = deleteSchedule as jest.MockedFunction<
  typeof deleteSchedule
>;

function buildSchedule(overrides: Partial<Schedule> = {}): Schedule {
  return {
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
    menus: [
      {
        practice_menu_id: 1,
        name: "素振り",
        unit_label: "本",
        target_value: 200,
      },
      {
        practice_menu_id: 2,
        name: "ランニング",
        unit_label: "km",
        target_value: 5,
      },
    ],
    logged_practice_menu_ids: [],
    ...overrides,
  };
}

function renderDetail({
  schedule = buildSchedule(),
  initialDoneLogIds = {},
  logsLoadFailed = false,
}: {
  schedule?: Schedule;
  initialDoneLogIds?: Record<number, number[]>;
  logsLoadFailed?: boolean;
} = {}) {
  render(
    <ScheduleDetailContent
      schedule={schedule}
      contextDate="2026-08-03"
      initialDoneLogIds={initialDoneLogIds}
      logsLoadFailed={logsLoadFailed}
    />,
  );
}

function recordHrefParams(): URLSearchParams {
  const href = screen
    .getByRole("link", { name: "練習記録をつける" })
    .getAttribute("href") as string;
  return new URLSearchParams(href.split("?")[1]);
}

describe("ScheduleDetailContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("「済」トグル", () => {
    it("未完了のメニューをチェックするとその日の練習ログを作る", async () => {
      const user = userEvent.setup();
      mockCreateLog.mockResolvedValue({
        ok: true,
        data: { id: 99 },
      } as Awaited<ReturnType<typeof createPracticeLog>>);
      renderDetail();

      await user.click(screen.getByRole("checkbox", { name: /素振り/ }));

      expect(mockCreateLog).toHaveBeenCalledWith({
        practice_menu_id: 1,
        schedule_id: 10,
        logged_on: "2026-08-03",
      });
      await waitFor(() =>
        expect(screen.getByRole("checkbox", { name: /素振り/ })).toBeChecked(),
      );
    });

    it("済のメニューを外すとその予定の練習ログを削除する", async () => {
      const user = userEvent.setup();
      mockDeleteLog.mockResolvedValue({
        ok: true,
        data: { message: "削除しました" },
      });
      renderDetail({ initialDoneLogIds: { 1: [99] } });

      expect(screen.getByRole("checkbox", { name: /素振り/ })).toBeChecked();
      await user.click(screen.getByRole("checkbox", { name: /素振り/ }));

      expect(mockDeleteLog).toHaveBeenCalledWith(99);
      await waitFor(() =>
        expect(
          screen.getByRole("checkbox", { name: /素振り/ }),
        ).not.toBeChecked(),
      );
    });

    it("別メニューのトグル中でも、リクエストが進行中のメニューは操作できず二重送信しない", async () => {
      const user = userEvent.setup();
      let resolveFirstCreate: (
        value: Awaited<ReturnType<typeof createPracticeLog>>,
      ) => void = () => {};
      mockCreateLog.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirstCreate = resolve;
          }),
      );
      renderDetail();

      await user.click(screen.getByRole("checkbox", { name: /素振り/ }));
      expect(screen.getByRole("checkbox", { name: /素振り/ })).toBeDisabled();

      mockCreateLog.mockResolvedValueOnce({
        ok: true,
        data: { id: 200 },
      } as Awaited<ReturnType<typeof createPracticeLog>>);
      await user.click(screen.getByRole("checkbox", { name: /ランニング/ }));

      // 別メニューをトグルしても、進行中の素振りは無効のまま（再送信不可）。
      expect(screen.getByRole("checkbox", { name: /素振り/ })).toBeDisabled();
      await user.click(screen.getByRole("checkbox", { name: /素振り/ }));
      expect(mockCreateLog).toHaveBeenCalledTimes(2);

      resolveFirstCreate({
        ok: true,
        data: { id: 99 },
      } as Awaited<ReturnType<typeof createPracticeLog>>);
      await waitFor(() =>
        expect(screen.getByRole("checkbox", { name: /素振り/ })).toBeChecked(),
      );
      // 進行中に押し直しても handleToggle 自体は増えていない（1件目の解決分のみ）。
      expect(mockCreateLog).toHaveBeenCalledTimes(2);
    });

    it("当日ログの取得に失敗したときは済の状態を触らせない", () => {
      renderDetail({ logsLoadFailed: true });

      expect(screen.getByRole("checkbox", { name: /素振り/ })).toBeDisabled();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  describe("練習記録への引き継ぎ", () => {
    it("済メニューを date と presetMenus の両方で渡す", () => {
      renderDetail({ initialDoneLogIds: { 2: [98] } });

      const params = recordHrefParams();
      expect(params.get("date")).toBe("2026-08-03");
      expect(JSON.parse(params.get("presetMenus") as string)).toEqual([
        { practice_menu_id: 2, target_value: 5 },
      ]);
    });

    it("済メニューが無くても date は渡す", () => {
      renderDetail();

      const params = recordHrefParams();
      expect(params.get("date")).toBe("2026-08-03");
      expect(params.get("presetMenus")).toBeNull();
    });

    it("トグルした結果が引き継ぎ内容に反映される", async () => {
      const user = userEvent.setup();
      mockCreateLog.mockResolvedValue({
        ok: true,
        data: { id: 99 },
      } as Awaited<ReturnType<typeof createPracticeLog>>);
      renderDetail();

      await user.click(screen.getByRole("checkbox", { name: /素振り/ }));

      await waitFor(() =>
        expect(
          JSON.parse(recordHrefParams().get("presetMenus") as string),
        ).toEqual([{ practice_menu_id: 1, target_value: 200 }]),
      );
    });
  });

  describe("記録画面への導線", () => {
    it("試合の予定では試合記録への導線を出す", () => {
      renderDetail({ schedule: buildSchedule({ event_type: "game" }) });

      expect(
        screen.getByRole("link", { name: "試合記録をつける" }),
      ).toHaveAttribute("href", "/game-result/record");
      expect(
        screen.queryByRole("link", { name: "練習記録をつける" }),
      ).not.toBeInTheDocument();
    });

    it("試合以外では練習記録への導線を出す", () => {
      renderDetail();

      expect(
        screen.queryByRole("link", { name: "試合記録をつける" }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "練習記録をつける" }),
      ).toBeInTheDocument();
    });
  });

  it("編集への導線を持つ", () => {
    renderDetail();

    expect(screen.getByRole("button", { name: "編集" })).toHaveAttribute(
      "href",
      "/practice/schedules/10/edit",
    );
  });

  it("削除すると一覧へ戻る", async () => {
    const user = userEvent.setup();
    mockDeleteSchedule.mockResolvedValue({
      ok: true,
      data: { message: "削除しました" },
    });
    renderDetail();

    await user.click(screen.getByRole("button", { name: "削除" }));
    await user.click(
      screen.getAllByRole("button", { name: "削除" }).slice(-1)[0],
    );

    await waitFor(() => expect(mockDeleteSchedule).toHaveBeenCalledWith(10));
    expect(mockPush).toHaveBeenCalledWith("/practice/schedules");
  });
});
