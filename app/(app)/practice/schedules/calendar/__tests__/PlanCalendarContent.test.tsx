const mockHasEntitlement = jest.fn();
const mockIsEntitlementLoading = jest.fn(() => false);

jest.mock("@app/hooks/pro/useEntitlement", () => ({
  useEntitlement: () => ({
    isPro: mockHasEntitlement("schedule_calendar_full_history"),
    inTrial: false,
    inGracePeriod: false,
    isLoading: mockIsEntitlementLoading(),
    hasEntitlement: mockHasEntitlement,
  }),
}));

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({ open: jest.fn(), close: jest.fn() }),
}));

jest.mock("@app/lib/analytics", () => ({
  trackEvent: jest.fn(),
}));

jest.mock("@app/services/v2/planService", () => ({
  getPlanCalendar: jest.fn(),
}));

import type { FetchResult } from "@app/services/v2/requests";
import type { CalendarEntry, CalendarResponse } from "@app/types/plan";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EVENT_TYPES } from "@app/constants/schedule";
import { getPlanCalendar } from "@app/services/v2/planService";
import {
  ADD_PLAN_LABEL,
  EMPTY_MESSAGE,
  LOAD_ERROR,
  PAYWALL_RANGE_NOTICE,
  PAYWALL_TITLE,
} from "../_components/calendarCopy";
import PlanCalendarContent from "../_components/PlanCalendarContent";
import { fetchRange } from "../_utils/calendarDate";

const mockGetPlanCalendar = getPlanCalendar as jest.MockedFunction<
  typeof getPlanCalendar
>;

// 2026-08-03 は月曜。無料枠は 2026-05-03 〜 2026-11-03 になる。
const TODAY = "2026-08-03";
const INITIAL_RANGE = fetchRange(TODAY);

const entry = (overrides: Partial<CalendarEntry> = {}): CalendarEntry => ({
  date: TODAY,
  event_type: "self_practice",
  title: "朝練",
  schedule_id: 1,
  ...overrides,
});

const ok = (entries: CalendarEntry[]): FetchResult<CalendarResponse> => ({
  status: "ok",
  data: { entries },
});

const colorOf = (value: string): string =>
  EVENT_TYPES.find((item) => item.value === value)?.color ?? "";

const toRgb = (hex: string): string => {
  const value = hex.replace("#", "");
  return `rgb(${parseInt(value.slice(0, 2), 16)}, ${parseInt(value.slice(2, 4), 16)}, ${parseInt(value.slice(4, 6), 16)})`;
};

// matchMedia は jsdom に無いため、ブレークポイントの変化を発火できるモックを用意する。
let isNarrowViewport = false;
const mediaListeners = new Set<() => void>();

const setNarrowViewport = (narrow: boolean) => {
  isNarrowViewport = narrow;
  act(() => {
    mediaListeners.forEach((listener) => listener());
  });
};

const renderCalendar = (
  initialResult: FetchResult<CalendarResponse> = ok([]),
) =>
  render(
    <PlanCalendarContent
      today={TODAY}
      initialRange={INITIAL_RANGE}
      initialResult={initialResult}
    />,
  );

/** 月モードで「次へ」を count 回押す。 */
const clickNext = async (
  user: ReturnType<typeof userEvent.setup>,
  count = 1,
) => {
  for (let index = 0; index < count; index += 1) {
    await user.click(screen.getByRole("button", { name: "次へ" }));
  }
};

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      media: query,
      get matches() {
        return isNarrowViewport;
      },
      addEventListener: (_type: string, listener: () => void) => {
        mediaListeners.add(listener);
      },
      removeEventListener: (_type: string, listener: () => void) => {
        mediaListeners.delete(listener);
      },
    }),
  });
});

beforeEach(() => {
  jest.clearAllMocks();
  isNarrowViewport = false;
  mediaListeners.clear();
  mockIsEntitlementLoading.mockReturnValue(false);
  mockHasEntitlement.mockReturnValue(true);
  mockGetPlanCalendar.mockResolvedValue(ok([]));
});

describe("PlanCalendarContent", () => {
  describe("表示モードの切り替え", () => {
    it("デスクトップ幅では月グリッドを表示する", () => {
      renderCalendar();

      expect(screen.getByRole("button", { name: "月" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(screen.getByTestId(`calendar-day-${TODAY}`)).toBeInTheDocument();
      expect(screen.getByTestId("calendar-range-label")).toHaveTextContent(
        "2026年8月",
      );
    });

    it("週に切り替えると月曜から日曜の7日が並ぶ", async () => {
      const user = userEvent.setup();
      renderCalendar();

      await user.click(screen.getByRole("button", { name: "週" }));

      expect(
        screen.queryByTestId(`calendar-day-${TODAY}`),
      ).not.toBeInTheDocument();
      [
        "2026-08-03",
        "2026-08-04",
        "2026-08-05",
        "2026-08-06",
        "2026-08-07",
        "2026-08-08",
        "2026-08-09",
      ].forEach((date) => {
        expect(
          screen.getByTestId(`calendar-day-section-${date}`),
        ).toBeInTheDocument();
      });
      expect(screen.getByTestId("calendar-range-label")).toHaveTextContent(
        "8月3日(月) - 8月9日(日)",
      );
    });

    it("日に切り替えるとその日だけを表示する", async () => {
      const user = userEvent.setup();
      renderCalendar();

      await user.click(screen.getByRole("button", { name: "日" }));

      expect(
        screen.getByTestId(`calendar-day-section-${TODAY}`),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId("calendar-day-section-2026-08-04"),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("calendar-range-label")).toHaveTextContent(
        "2026年8月3日(月)",
      );
    });

    it("SP 幅では週表示を既定にする", () => {
      isNarrowViewport = true;
      renderCalendar();

      expect(screen.getByRole("button", { name: "週" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    it("明示的に選んだモードは画面幅の変化で上書きしない", async () => {
      const user = userEvent.setup();
      renderCalendar();

      await user.click(screen.getByRole("button", { name: "日" }));
      setNarrowViewport(true);

      expect(screen.getByRole("button", { name: "日" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(
        screen.queryByTestId("calendar-day-section-2026-08-04"),
      ).not.toBeInTheDocument();
    });

    it("モード未選択なら画面幅の変化に追従する", () => {
      renderCalendar();

      setNarrowViewport(true);

      expect(screen.getByRole("button", { name: "週" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });
  });

  describe("前後移動", () => {
    it("次へで翌月の範囲を取得する", async () => {
      const user = userEvent.setup();
      renderCalendar();

      await clickNext(user);

      expect(screen.getByTestId("calendar-range-label")).toHaveTextContent(
        "2026年9月",
      );
      await waitFor(() =>
        expect(mockGetPlanCalendar).toHaveBeenCalledWith(
          "2026-08-31",
          "2026-10-04",
        ),
      );
    });

    it("前へで前月の範囲を取得する", async () => {
      const user = userEvent.setup();
      renderCalendar();

      await user.click(screen.getByRole("button", { name: "前へ" }));

      expect(screen.getByTestId("calendar-range-label")).toHaveTextContent(
        "2026年7月",
      );
      await waitFor(() =>
        expect(mockGetPlanCalendar).toHaveBeenCalledWith(
          "2026-06-29",
          "2026-08-02",
        ),
      );
    });

    it("週モードの次へは7日進む", async () => {
      const user = userEvent.setup();
      renderCalendar();

      await user.click(screen.getByRole("button", { name: "週" }));
      await clickNext(user);

      expect(screen.getByTestId("calendar-range-label")).toHaveTextContent(
        "8月10日(月) - 8月16日(日)",
      );
    });

    it("日モードの次へは1日進む", async () => {
      const user = userEvent.setup();
      renderCalendar();

      await user.click(screen.getByRole("button", { name: "日" }));
      await clickNext(user);

      expect(screen.getByTestId("calendar-range-label")).toHaveTextContent(
        "2026年8月4日(火)",
      );
    });

    it("モードを切り替えただけでは再取得しない", async () => {
      const user = userEvent.setup();
      renderCalendar();

      await user.click(screen.getByRole("button", { name: "週" }));
      await user.click(screen.getByRole("button", { name: "日" }));

      expect(mockGetPlanCalendar).not.toHaveBeenCalled();
    });
  });

  describe("予定の表示", () => {
    it("繰り返し予定は back が展開した日付ぶんすべて表示する", () => {
      renderCalendar(
        ok([
          entry({ date: "2026-08-03" }),
          entry({ date: "2026-08-10" }),
          entry({ date: "2026-08-17" }),
        ]),
      );

      ["2026-08-03", "2026-08-10", "2026-08-17"].forEach((date) => {
        expect(
          within(screen.getByTestId(`calendar-day-${date}`)).getByText("朝練"),
        ).toBeInTheDocument();
      });
    });

    it("event_type ごとに色を分ける", () => {
      renderCalendar(
        ok([
          entry({ date: "2026-08-03", event_type: "self_practice" }),
          entry({
            date: "2026-08-04",
            event_type: "game",
            title: "練習試合",
            schedule_id: 2,
          }),
          entry({
            date: "2026-08-05",
            event_type: "practice",
            title: "全体練",
            schedule_id: 3,
          }),
          entry({
            date: "2026-08-06",
            event_type: "other",
            title: "ミーティング",
            schedule_id: 4,
          }),
        ]),
      );

      const chips = screen.getAllByTestId("calendar-month-chip");
      const colorByType = new Map(
        chips.map((chip) => [
          chip.getAttribute("data-event-type"),
          chip.style.backgroundColor,
        ]),
      );

      expect(colorByType.get("self_practice")).toBe(
        toRgb(colorOf("self_practice")),
      );
      expect(colorByType.get("game")).toBe(toRgb(colorOf("game")));
      expect(colorByType.get("practice")).toBe(toRgb(colorOf("practice")));
      expect(colorByType.get("other")).toBe(toRgb(colorOf("other")));
      expect(new Set(colorByType.values()).size).toBe(4);
    });

    it("日付を選ぶとその日の詳細に切り替わる", async () => {
      const user = userEvent.setup();
      renderCalendar(
        ok([entry({ date: "2026-08-12", title: "居残り", schedule_id: 9 })]),
      );

      await user.click(screen.getByTestId("calendar-day-2026-08-12"));

      expect(
        screen.getByTestId("calendar-day-section-2026-08-12"),
      ).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /居残り/ })).toHaveAttribute(
        "href",
        "/practice/schedules/9?date=2026-08-12",
      );
    });

    it("その日の予定追加ボタンは日付付きの作成画面へ遷移する", () => {
      renderCalendar(ok([]));

      expect(
        screen.getByRole("link", { name: `8月3日(月) ${ADD_PLAN_LABEL}` }),
      ).toHaveAttribute("href", "/practice/schedules/new?date=2026-08-03");
    });

    it("週モードでは各日に予定追加ボタンが並ぶ", async () => {
      const user = userEvent.setup();
      renderCalendar(ok([]));

      await user.click(screen.getByRole("button", { name: "週" }));

      expect(
        screen.getByRole("link", { name: `8月5日(水) ${ADD_PLAN_LABEL}` }),
      ).toHaveAttribute("href", "/practice/schedules/new?date=2026-08-05");
    });
  });

  describe("0件と取得失敗の区別", () => {
    it("0件なら予定なしと伝える", () => {
      renderCalendar(ok([]));

      expect(screen.getByText(EMPTY_MESSAGE)).toBeInTheDocument();
      expect(screen.queryByText(LOAD_ERROR)).not.toBeInTheDocument();
    });

    it("取得失敗なら予定なしではなくエラーを出す", () => {
      renderCalendar({ status: "error" });

      expect(screen.getByText(LOAD_ERROR)).toBeInTheDocument();
      expect(screen.queryByText(EMPTY_MESSAGE)).not.toBeInTheDocument();
      expect(
        screen.queryByTestId(`calendar-day-${TODAY}`),
      ).not.toBeInTheDocument();
    });

    it("移動先の取得に失敗したときもエラーを出す", async () => {
      const user = userEvent.setup();
      mockGetPlanCalendar.mockResolvedValue({ status: "error" });
      renderCalendar(ok([]));

      await clickNext(user);

      expect(await screen.findByText(LOAD_ERROR)).toBeInTheDocument();
    });
  });

  describe("無料プランの閲覧範囲", () => {
    it("前後3ヶ月を超える月へ移動するとペイウォールを出す（空カレンダーにしない）", async () => {
      const user = userEvent.setup();
      mockHasEntitlement.mockReturnValue(false);
      renderCalendar(ok([]));

      await clickNext(user, 4);

      expect(screen.getByTestId("calendar-range-label")).toHaveTextContent(
        "2026年12月",
      );
      expect(screen.getByText(PAYWALL_TITLE)).toBeInTheDocument();
      expect(
        screen.queryByTestId("calendar-day-2026-12-01"),
      ).not.toBeInTheDocument();
      expect(screen.queryByText(EMPTY_MESSAGE)).not.toBeInTheDocument();
    });

    it("一部だけ範囲外の月は境界の日だけロック表示する", async () => {
      const user = userEvent.setup();
      mockHasEntitlement.mockReturnValue(false);
      renderCalendar(ok([]));

      await clickNext(user, 3);

      expect(screen.getByTestId("calendar-range-label")).toHaveTextContent(
        "2026年11月",
      );
      expect(screen.queryByText(PAYWALL_TITLE)).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("calendar-day-locked-2026-11-03"),
      ).not.toBeInTheDocument();
      expect(
        screen.getByTestId("calendar-day-locked-2026-11-04"),
      ).toBeInTheDocument();
    });

    it("ロックした日は予定0件ではなく閲覧範囲外だと伝える", async () => {
      const user = userEvent.setup();
      mockHasEntitlement.mockReturnValue(false);
      renderCalendar(ok([]));

      await clickNext(user, 3);
      await user.click(screen.getByTestId("calendar-day-2026-11-30"));

      expect(screen.getByText(PAYWALL_RANGE_NOTICE)).toBeInTheDocument();
      expect(screen.queryByText(EMPTY_MESSAGE)).not.toBeInTheDocument();
    });

    it("閲覧範囲外の日でも予定の追加はできる", async () => {
      const user = userEvent.setup();
      mockHasEntitlement.mockReturnValue(false);
      renderCalendar(ok([]));

      await clickNext(user, 3);
      await user.click(screen.getByTestId("calendar-day-2026-11-30"));

      expect(
        screen.getByRole("link", { name: `11月30日(月) ${ADD_PLAN_LABEL}` }),
      ).toHaveAttribute("href", "/practice/schedules/new?date=2026-11-30");
    });

    it("Pro ユーザーは範囲外へ移動してもペイウォールを出さない", async () => {
      const user = userEvent.setup();
      mockHasEntitlement.mockReturnValue(true);
      renderCalendar(ok([]));

      await clickNext(user, 4);

      expect(screen.queryByText(PAYWALL_TITLE)).not.toBeInTheDocument();
      expect(
        await screen.findByTestId("calendar-day-2026-12-01"),
      ).toBeInTheDocument();
    });

    it("Pro 判定が未確定の間は範囲外扱いにしない", async () => {
      const user = userEvent.setup();
      mockIsEntitlementLoading.mockReturnValue(true);
      mockHasEntitlement.mockReturnValue(false);
      renderCalendar(ok([]));

      await clickNext(user, 4);

      expect(screen.queryByText(PAYWALL_TITLE)).not.toBeInTheDocument();
      expect(
        await screen.findByTestId("calendar-day-2026-12-01"),
      ).toBeInTheDocument();
    });

    it("Pro 判定が未確定の間は境界の日もロックしない", () => {
      mockIsEntitlementLoading.mockReturnValue(true);
      mockHasEntitlement.mockReturnValue(false);
      renderCalendar(ok([]));

      expect(
        screen.queryByTestId("calendar-day-locked-2026-08-03"),
      ).not.toBeInTheDocument();
    });

    it("範囲外でも取得は行い、back がクランプした結果を使う", async () => {
      const user = userEvent.setup();
      mockHasEntitlement.mockReturnValue(false);
      renderCalendar(ok([]));

      await clickNext(user, 4);

      await waitFor(() =>
        expect(mockGetPlanCalendar).toHaveBeenLastCalledWith(
          "2026-11-30",
          "2027-01-03",
        ),
      );
    });
  });
});
