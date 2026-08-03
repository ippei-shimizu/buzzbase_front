jest.mock("sonner", () => ({
  toast: { error: jest.fn(), success: jest.fn(), info: jest.fn() },
}));

jest.mock("@app/services/v2/practiceLogService", () => ({
  createPracticeLog: jest.fn(),
  deletePracticeLog: jest.fn(),
  getPracticeLogs: jest.fn(),
}));

import type { FetchResult } from "@app/services/v2/requests";
import type { Plan, PlanMenu } from "@app/types/plan";
import type { PracticeLog } from "@app/types/practice";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createPracticeLog,
  deletePracticeLog,
  getPracticeLogs,
} from "@app/services/v2/practiceLogService";
import {
  EMPTY_MESSAGE,
  LOAD_ERROR,
  RECORD_PRACTICE_LABEL,
} from "../todayTasksCopy";
import TodayTasksSection from "../TodayTasksSection";

const mockCreateLog = createPracticeLog as jest.MockedFunction<
  typeof createPracticeLog
>;
const mockDeleteLog = deletePracticeLog as jest.MockedFunction<
  typeof deletePracticeLog
>;
const mockGetLogs = getPracticeLogs as jest.MockedFunction<
  typeof getPracticeLogs
>;

const TODAY = "2026-08-03";

function buildMenu(overrides: Partial<PlanMenu> = {}): PlanMenu {
  return {
    practice_menu_id: 1,
    name: "素振り",
    unit_label: "本",
    target_value: 200,
    sort_order: 0,
    done: false,
    ...overrides,
  };
}

function buildPlan(overrides: Partial<Plan> = {}): Plan {
  return {
    id: 10,
    title: "朝練",
    event_type: "self_practice",
    scheduled_time: "06:00",
    recurring: true,
    menu_set_id: null,
    game_result_id: null,
    note: null,
    menus: [buildMenu()],
    done: false,
    ...overrides,
  };
}

function buildLog(overrides: Partial<PracticeLog> = {}): PracticeLog {
  return {
    id: 100,
    practice_menu_id: 1,
    schedule_id: 10,
    logged_on: TODAY,
    amount: null,
    weight: null,
    menu_name: "素振り",
    unit_label: "本",
    source: "manual",
    memo: null,
    created_at: `${TODAY}T00:00:00Z`,
    ...overrides,
  };
}

const ok = (plans: Plan[]): FetchResult<Plan[]> => ({
  status: "ok",
  data: plans,
});

const createdLog = (id: number) =>
  ({ ok: true, data: buildLog({ id }) }) as const;

function renderSection(result: FetchResult<Plan[]>) {
  return render(<TodayTasksSection today={TODAY} result={result} />);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetLogs.mockResolvedValue({ status: "ok", data: [] });
});

describe("表示", () => {
  it("繰り返しと単発が同じ日に並ぶ", () => {
    renderSection(
      ok([
        buildPlan({ id: 10, title: "朝練", recurring: true }),
        buildPlan({
          id: 11,
          title: "練習試合",
          recurring: false,
          event_type: "game",
          menus: [],
        }),
      ]),
    );

    expect(screen.getByRole("link", { name: "朝練" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "練習試合" })).toBeInTheDocument();
  });

  it("予定 0 件は「予定なし」を出す", () => {
    renderSection(ok([]));

    expect(screen.getByText(EMPTY_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(LOAD_ERROR)).toBeNull();
  });

  it("取得失敗は 0 件と区別して案内する", () => {
    renderSection({ status: "error" });

    expect(screen.getByRole("alert")).toHaveTextContent(LOAD_ERROR);
    expect(screen.queryByText(EMPTY_MESSAGE)).toBeNull();
  });
});

describe("「済」トグル", () => {
  it("通信を待たずにチェックが入り、schedule_id つきでログを作る", async () => {
    const user = userEvent.setup();
    mockCreateLog.mockResolvedValue(createdLog(100));
    renderSection(ok([buildPlan()]));

    const checkbox = screen.getByRole("checkbox", { name: /素振り/ });
    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(mockCreateLog).toHaveBeenCalledWith({
      practice_menu_id: 1,
      schedule_id: 10,
      logged_on: TODAY,
    });
  });

  it("済のメニューを外すと、その予定・その日のログだけ削除する", async () => {
    const user = userEvent.setup();
    mockGetLogs.mockResolvedValue({
      status: "ok",
      data: [
        buildLog({ id: 100 }),
        buildLog({ id: 101, schedule_id: 11 }),
        buildLog({ id: 102, schedule_id: null }),
      ],
    });
    mockDeleteLog.mockResolvedValue({
      ok: true,
      data: { message: "削除しました" },
    });
    renderSection(ok([buildPlan({ menus: [buildMenu({ done: true })] })]));

    await user.click(screen.getByRole("checkbox", { name: /素振り/ }));

    await waitFor(() => expect(mockDeleteLog).toHaveBeenCalledTimes(1));
    expect(mockDeleteLog).toHaveBeenCalledWith(100);
  });

  it("作成に失敗したらチェックを元に戻す", async () => {
    const user = userEvent.setup();
    mockCreateLog.mockResolvedValue({
      ok: false,
      reason: "error",
      errors: ["保存に失敗しました"],
    });
    renderSection(ok([buildPlan()]));

    const checkbox = screen.getByRole("checkbox", { name: /素振り/ });
    await user.click(checkbox);

    await waitFor(() => expect(checkbox).not.toBeChecked());
  });

  it("解除に失敗したらチェックを戻す（済のまま残す）", async () => {
    const user = userEvent.setup();
    mockGetLogs.mockResolvedValue({
      status: "ok",
      data: [buildLog({ id: 100 })],
    });
    mockDeleteLog.mockResolvedValue({
      ok: false,
      reason: "error",
      errors: ["削除に失敗しました"],
    });
    renderSection(ok([buildPlan({ menus: [buildMenu({ done: true })] })]));

    const checkbox = screen.getByRole("checkbox", { name: /素振り/ });
    await user.click(checkbox);

    await waitFor(() => expect(checkbox).toBeChecked());
  });

  it("当日ログの取得に失敗したら解除せず元に戻す", async () => {
    const user = userEvent.setup();
    mockGetLogs.mockResolvedValue({ status: "error" });
    renderSection(ok([buildPlan({ menus: [buildMenu({ done: true })] })]));

    const checkbox = screen.getByRole("checkbox", { name: /素振り/ });
    await user.click(checkbox);

    await waitFor(() => expect(checkbox).toBeChecked());
    expect(mockDeleteLog).not.toHaveBeenCalled();
  });

  it("連打しても作成は 1 回しか走らない", async () => {
    const user = userEvent.setup();
    let resolveCreate: (
      value: ReturnType<typeof createdLog>,
    ) => void = () => {};
    mockCreateLog.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve;
        }),
    );
    renderSection(ok([buildPlan()]));

    const checkbox = screen.getByRole("checkbox", { name: /素振り/ });
    await user.click(checkbox);
    await user.click(checkbox);
    await user.click(checkbox);

    expect(mockCreateLog).toHaveBeenCalledTimes(1);
    expect(mockDeleteLog).not.toHaveBeenCalled();

    resolveCreate(createdLog(100));
    await waitFor(() => expect(checkbox).toBeChecked());
  });

  it("同じメニューでも別の予定なら独立してトグルできる", async () => {
    const user = userEvent.setup();
    mockCreateLog.mockResolvedValue(createdLog(100));
    renderSection(
      ok([
        buildPlan({ id: 10, title: "朝練" }),
        buildPlan({ id: 11, title: "夕練" }),
      ]),
    );

    const checkboxes = screen.getAllByRole("checkbox", { name: /素振り/ });
    await user.click(checkboxes[0]);

    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    expect(mockCreateLog).toHaveBeenCalledWith(
      expect.objectContaining({ schedule_id: 10 }),
    );
  });

  it("全メニューが済になると予定に完了マークが付く", async () => {
    const user = userEvent.setup();
    mockCreateLog.mockResolvedValue(createdLog(100));
    renderSection(
      ok([
        buildPlan({
          menus: [
            buildMenu({ practice_menu_id: 1, name: "素振り", done: true }),
            buildMenu({ practice_menu_id: 2, name: "ランニング" }),
          ],
        }),
      ]),
    );

    expect(screen.queryByTestId("today-plan-done-10")).toBeNull();

    await user.click(screen.getByRole("checkbox", { name: /ランニング/ }));

    expect(screen.getByTestId("today-plan-done-10")).toBeInTheDocument();
  });
});

describe("練習記録への引き継ぎ", () => {
  it("済のメニューが無ければ記録ボタンを出さない", () => {
    renderSection(ok([buildPlan()]));

    expect(
      screen.queryByRole("link", { name: RECORD_PRACTICE_LABEL }),
    ).toBeNull();
  });

  it("date と presetMenus の両方を渡す", () => {
    renderSection(
      ok([
        buildPlan({
          menus: [buildMenu({ target_value: 200, done: true })],
        }),
      ]),
    );

    const href = screen
      .getByRole("link", { name: RECORD_PRACTICE_LABEL })
      .getAttribute("href") as string;
    const query = new URLSearchParams(href.split("?")[1]);

    expect(query.get("date")).toBe(TODAY);
    expect(JSON.parse(query.get("presetMenus") as string)).toEqual([
      { practice_menu_id: 1, target_value: 200 },
    ]);
  });

  it("済にした直後のメニューが引き継ぎ対象に入る", async () => {
    const user = userEvent.setup();
    mockCreateLog.mockResolvedValue(createdLog(100));
    renderSection(ok([buildPlan()]));

    await user.click(screen.getByRole("checkbox", { name: /素振り/ }));

    const href = screen
      .getByRole("link", { name: RECORD_PRACTICE_LABEL })
      .getAttribute("href") as string;
    expect(new URLSearchParams(href.split("?")[1]).get("presetMenus")).toBe(
      JSON.stringify([{ practice_menu_id: 1, target_value: 200 }]),
    );
  });
});
