const mockHasEntitlement = jest.fn();
const mockIsEntitlementLoading = jest.fn(() => false);

jest.mock("@app/hooks/pro/useEntitlement", () => ({
  useEntitlement: () => ({
    isPro: mockHasEntitlement("schedule_copy_next_week"),
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

jest.mock("sonner", () => ({
  toast: { error: jest.fn(), success: jest.fn(), info: jest.fn() },
}));

jest.mock("@app/services/v2/scheduleService", () => ({
  copyScheduleWeekToNext: jest.fn(),
}));

import type { FetchResult } from "@app/services/v2/requests";
import type { Schedule } from "@app/types/schedule";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { copyScheduleWeekToNext } from "@app/services/v2/scheduleService";
import WeeklyPlanContent from "../_components/WeeklyPlanContent";
import {
  COPY_EMPTY_MESSAGE,
  COPY_FORBIDDEN_MESSAGE,
  COPY_LABEL,
  COPY_PAYWALL_TITLE,
  LOAD_ERROR,
  NEXT_WEEK_LABEL,
  PREV_WEEK_LABEL,
} from "../_components/weeklyPlanCopy";

const mockCopy = copyScheduleWeekToNext as jest.MockedFunction<
  typeof copyScheduleWeekToNext
>;

// 2026-08-05 は水曜。その週は 2026-08-03(月) 〜 2026-08-09(日)。
const TODAY = "2026-08-05";
const MONDAY = "2026-08-03";

function buildSchedule(overrides: Partial<Schedule> = {}): Schedule {
  return {
    id: 1,
    title: "朝練",
    days_of_week: null,
    planned_on: MONDAY,
    scheduled_time: "06:00",
    end_time: null,
    event_type: "self_practice",
    recurring: false,
    menu_set_id: null,
    game_result_id: null,
    note: null,
    notification_enabled: false,
    active: true,
    notification_message: null,
    menus: [],
    logged_practice_menu_ids: [],
    ...overrides,
  };
}

const ok = (schedules: Schedule[]): FetchResult<Schedule[]> => ({
  status: "ok",
  data: schedules,
});

function renderContent(result: FetchResult<Schedule[]> = ok([])) {
  return render(<WeeklyPlanContent today={TODAY} result={result} />);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockHasEntitlement.mockReturnValue(true);
  mockIsEntitlementLoading.mockReturnValue(false);
});

describe("週の表示", () => {
  it("週始まりは月曜で、月〜日の 7 日を並べる", () => {
    renderContent();

    expect(screen.getByTestId(`week-day-${MONDAY}`)).toBeInTheDocument();
    expect(screen.getByTestId("week-day-2026-08-09")).toBeInTheDocument();
    // 前週の日曜・翌週の月曜は含まない。
    expect(screen.queryByTestId("week-day-2026-08-02")).toBeNull();
    expect(screen.queryByTestId("week-day-2026-08-10")).toBeNull();
    expect(screen.getByTestId("week-range-label")).toHaveTextContent(
      "8/3〜8/9",
    );
  });

  it("その週の単発予定を曜日の行に出す", () => {
    renderContent(
      ok([
        buildSchedule({ id: 1, title: "朝練", planned_on: MONDAY }),
        buildSchedule({ id: 2, title: "練習試合", planned_on: "2026-08-09" }),
      ]),
    );

    expect(
      within(screen.getByTestId(`week-day-${MONDAY}`)).getByText("朝練"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId("week-day-2026-08-09")).getByText("練習試合"),
    ).toBeInTheDocument();
  });

  it("前へ・次へで週が 7 日ずつ動く", async () => {
    const user = userEvent.setup();
    renderContent();

    await user.click(screen.getByRole("button", { name: NEXT_WEEK_LABEL }));
    expect(screen.getByTestId("week-range-label")).toHaveTextContent(
      "8/10〜8/16",
    );

    await user.click(screen.getByRole("button", { name: PREV_WEEK_LABEL }));
    await user.click(screen.getByRole("button", { name: PREV_WEEK_LABEL }));
    expect(screen.getByTestId("week-range-label")).toHaveTextContent(
      "7/27〜8/2",
    );
  });

  it("日ごとの「＋」は、その日を初期値にした予定作成へ送る", () => {
    renderContent();

    const addLinks = screen.getAllByRole("link", { name: /予定を追加/ });
    expect(addLinks[0]).toHaveAttribute(
      "href",
      `/practice/schedules/new?date=${MONDAY}`,
    );
  });

  it("予定のチップは日付つきの詳細へ送る（済の判定日を引き継ぐ）", () => {
    renderContent(ok([buildSchedule({ id: 7, planned_on: "2026-08-06" })]));

    expect(screen.getByRole("link", { name: /朝練/ })).toHaveAttribute(
      "href",
      "/practice/schedules/7?date=2026-08-06",
    );
  });

  it("取得失敗は「予定なし」と区別して案内する", () => {
    renderContent({ status: "error" });

    expect(screen.getByRole("alert")).toHaveTextContent(LOAD_ERROR);
    expect(screen.queryByTestId(`week-day-${MONDAY}`)).toBeNull();
  });

  it("0 件のときは曜日の枠は出したまま、エラーは出さない", () => {
    renderContent(ok([]));

    expect(screen.getByTestId(`week-day-${MONDAY}`)).toBeInTheDocument();
    expect(screen.queryByText(LOAD_ERROR)).toBeNull();
  });
});

describe("来週にコピー", () => {
  it("成功したら表示週が翌週へ移動する", async () => {
    const user = userEvent.setup();
    mockCopy.mockResolvedValue({
      ok: true,
      data: [buildSchedule({ id: 20, planned_on: "2026-08-10" })],
    });
    renderContent(ok([buildSchedule({ id: 1, planned_on: MONDAY })]));

    await user.click(
      screen.getByRole("button", { name: new RegExp(COPY_LABEL) }),
    );

    expect(mockCopy).toHaveBeenCalledWith(MONDAY);
    await waitFor(() =>
      expect(screen.getByTestId("week-range-label")).toHaveTextContent(
        "8/10〜8/16",
      ),
    );
  });

  it("コピーされた予定が移動先の週に並ぶ", async () => {
    const user = userEvent.setup();
    mockCopy.mockResolvedValue({
      ok: true,
      data: [
        buildSchedule({ id: 20, title: "朝練", planned_on: "2026-08-10" }),
      ],
    });
    renderContent(ok([buildSchedule({ id: 1, planned_on: MONDAY })]));

    await user.click(
      screen.getByRole("button", { name: new RegExp(COPY_LABEL) }),
    );

    await waitFor(() =>
      expect(
        within(screen.getByTestId("week-day-2026-08-10")).getByText("朝練"),
      ).toBeInTheDocument(),
    );
  });

  it("コピー対象が 0 件なら案内を出し、週は動かさない", async () => {
    const user = userEvent.setup();
    mockCopy.mockResolvedValue({ ok: true, data: [] });
    renderContent(ok([]));

    await user.click(
      screen.getByRole("button", { name: new RegExp(COPY_LABEL) }),
    );

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(COPY_EMPTY_MESSAGE),
    );
    expect(screen.getByTestId("week-range-label")).toHaveTextContent(
      "8/3〜8/9",
    );
  });

  it("403 は「Pro 限定」として案内する（無料枠の超過ではない）", async () => {
    const user = userEvent.setup();
    // front の Pro 判定が古く、back だけが未加入と判断したケース。
    mockHasEntitlement.mockReturnValue(true);
    mockCopy.mockResolvedValue({
      ok: false,
      reason: "forbidden",
      errors: ["来週にコピーは Pro プラン限定です"],
    });
    renderContent(ok([buildSchedule()]));

    await user.click(
      screen.getByRole("button", { name: new RegExp(COPY_LABEL) }),
    );

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        COPY_FORBIDDEN_MESSAGE,
      ),
    );
    expect(screen.getByText(COPY_PAYWALL_TITLE)).toBeInTheDocument();
    expect(screen.getByRole("status")).not.toHaveTextContent("上限");
    expect(screen.getByTestId("week-range-label")).toHaveTextContent(
      "8/3〜8/9",
    );
  });

  it("entitlement が無ければ API を叩かずにペイウォールを出す", async () => {
    const user = userEvent.setup();
    mockHasEntitlement.mockReturnValue(false);
    renderContent(ok([buildSchedule()]));

    await user.click(
      screen.getByRole("button", { name: new RegExp(COPY_LABEL) }),
    );

    expect(mockCopy).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent(
      COPY_FORBIDDEN_MESSAGE,
    );
    expect(screen.getByText(COPY_PAYWALL_TITLE)).toBeInTheDocument();
  });

  it("Pro 判定が未確定の間は鍵アイコンを出さない", () => {
    mockIsEntitlementLoading.mockReturnValue(true);
    mockHasEntitlement.mockReturnValue(false);
    renderContent(ok([]));

    expect(screen.queryByTestId("copy-lock-icon")).toBeNull();
  });

  // 再描画（disabled の反映）を挟まずに連続でクリックが届く状況を作り、
  // 表示だけでなく送信処理自体が二重送信を弾くことを確かめる。
  it("再描画を挟まない連打でも 1 回しか送らない", async () => {
    let resolveCopy: (value: { ok: true; data: Schedule[] }) => void = () => {};
    mockCopy.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCopy = resolve;
        }),
    );
    renderContent(ok([buildSchedule()]));

    const button = screen.getByRole("button", { name: new RegExp(COPY_LABEL) });
    await act(async () => {
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
    });

    expect(mockCopy).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveCopy({
        ok: true,
        data: [buildSchedule({ id: 20, planned_on: "2026-08-10" })],
      });
    });
    expect(screen.getByTestId("week-range-label")).toHaveTextContent(
      "8/10〜8/16",
    );
  });
});
