const mockCookieGet = jest.fn();
const mockRedirect = jest.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});
const mockGetPracticeSessions = jest.fn();
const mockGetBaseballNotes = jest.fn();
const mockGetPracticeMenus = jest.fn();
const mockGetMenuSummaries = jest.fn();
const mockGetImprovementThemes = jest.fn();
const mockGetGoals = jest.fn();
const mockGetPeriodicReviews = jest.fn();
const mockGetDayPlan = jest.fn();
const mockGetActivityHeatmap = jest.fn();
const mockGetShadowSwingStats = jest.fn();
const mockGetDashboardData = jest.fn();
const mockGetAvailableSeasons = jest.fn();

jest.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: mockCookieGet }),
}));

jest.mock("next/navigation", () => ({
  redirect: (path: string) => mockRedirect(path),
}));

jest.mock("@app/services/v2/practiceSessionService", () => ({
  getPracticeSessions: () => mockGetPracticeSessions(),
}));

jest.mock("@app/services/v2/baseballNoteService", () => ({
  getBaseballNotes: () => mockGetBaseballNotes(),
}));

jest.mock("@app/services/v2/practiceMenuService", () => ({
  getPracticeMenus: () => mockGetPracticeMenus(),
}));

jest.mock("@app/services/v2/practiceSummaryService", () => ({
  getMenuSummaries: () => mockGetMenuSummaries(),
}));

jest.mock("@app/services/v2/improvementThemeService", () => ({
  getImprovementThemes: (params: unknown) => mockGetImprovementThemes(params),
}));

jest.mock("@app/services/v2/goalService", () => ({
  getGoals: () => mockGetGoals(),
}));

jest.mock("@app/services/v2/planService", () => ({
  getDayPlan: (...args: unknown[]) => mockGetDayPlan(...args),
}));

jest.mock("@app/services/v2/activityService", () => ({
  getActivityHeatmap: (...args: unknown[]) => mockGetActivityHeatmap(...args),
}));

jest.mock("@app/services/v2/shadowSwingService", () => ({
  getShadowSwingStats: (...args: unknown[]) => mockGetShadowSwingStats(...args),
}));

jest.mock("@app/services/v2/periodicReviewService", () => ({
  getPeriodicReviews: () => mockGetPeriodicReviews(),
}));

jest.mock("../actions", () => ({
  getDashboardData: () => mockGetDashboardData(),
  getAvailableSeasons: () => mockGetAvailableSeasons(),
}));

jest.mock("@app/components/header/Header", () => ({
  __esModule: true,
  default: () => <header />,
}));

jest.mock("@app/components/ad/AdInFeed", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../_components/DashboardContent", () => ({
  __esModule: true,
  default: () => <div>成績ダッシュボード</div>,
}));

import type { BaseballNoteV2 } from "@app/interface/baseballNoteV2";
import type { Goal } from "@app/types/goal";
import type { ImprovementTheme } from "@app/types/improvementTheme";
import type {
  ConditionLog,
  MenuSummary,
  PracticeLog,
  PracticeSession,
} from "@app/types/practice";
import { render, screen, within } from "@testing-library/react";
import DashboardPage from "../page";

/** Asia/Tokyo で 2026-08-03（月）になる瞬間。 */
const NOW = new Date("2026-08-03T01:00:00+09:00");

const buildLog = (overrides: Partial<PracticeLog> = {}): PracticeLog => ({
  id: 1,
  practice_menu_id: 1,
  schedule_id: null,
  logged_on: "2026-08-03",
  amount: "200.0",
  weight: null,
  menu_name: "素振り",
  unit_label: "本",
  source: "manual",
  memo: null,
  created_at: "2026-08-03T10:00:00Z",
  ...overrides,
});

const buildSession = (
  overrides: Partial<PracticeSession> = {},
): PracticeSession => ({
  id: 1,
  logged_on: "2026-08-03",
  memo: null,
  improvement_theme_ids: [],
  practice_logs: [buildLog()],
  condition: null,
  created_at: "2026-08-03T10:00:00Z",
  ...overrides,
});

const buildCondition = (
  overrides: Partial<ConditionLog> = {},
): ConditionLog => ({
  id: 1,
  logged_on: "2026-08-03",
  fatigue_level: null,
  physical_level: null,
  sleep_hours: null,
  mood: null,
  memo: null,
  injuries: [],
  ...overrides,
});

const buildHeatmap = () => ({
  from: "2025-08-04",
  to: "2026-08-03",
  current_streak_days: 0,
  longest_streak_days: 0,
  total_active_days: 0,
  data: [],
});

const buildNote = (
  overrides: Partial<BaseballNoteV2> = {},
): BaseballNoteV2 => ({
  id: 1,
  title: null,
  date: "2026-08-03",
  memo: null,
  memo_preview: "始動を早くする意識で振れた",
  game_result_ids: [],
  practice_log_id: 1,
  practice_session_id: 1,
  improvement_theme_ids: [],
  reflection_template_id: null,
  reflection_answers: [],
  tags: [],
  media_attachments: [],
  ...overrides,
});

const buildSummary = (overrides: Partial<MenuSummary> = {}): MenuSummary => ({
  practice_menu_id: 1,
  menu_name: "素振り",
  unit: "count",
  unit_label: "本",
  total_amount: 12400,
  total_volume: null,
  this_month_amount: 800,
  this_month_volume: null,
  days_count: 40,
  last_logged_on: "2026-08-03",
  ...overrides,
});

const buildTheme = (
  overrides: Partial<ImprovementTheme> = {},
): ImprovementTheme => ({
  id: 1,
  title: "始動を早くする",
  category: null,
  purpose: null,
  status: "open",
  started_on: "2026-07-01",
  achieved_on: null,
  sort_order: 0,
  practice_logs_count: 12,
  notes_count: 3,
  active_days: 8,
  created_at: "2026-07-01T00:00:00Z",
  ...overrides,
});

const buildGoal = (overrides: Partial<Goal> = {}): Goal => ({
  id: 1,
  title: "8月は20日練習する",
  kind: "numeric",
  period_type: "monthly",
  season_id: null,
  tournament_id: null,
  month_start: "2026-08-01",
  deadline: "2026-08-31",
  metric_key: "practice_days",
  target_value: 20,
  comparison_type: "greater_than",
  practice_menu_id: null,
  practice_menu_name: null,
  custom_metric_label: null,
  custom_unit: null,
  manual_current_value: 0,
  is_achieved: false,
  is_finalized: false,
  achieved_value: null,
  current_value: 8,
  progress_percent: 40,
  days_remaining: 28,
  ...overrides,
});

const ok = <T,>(data: T) => ({ status: "ok" as const, data });
const failed = { status: "error" as const };

function setAuthCookies() {
  mockCookieGet.mockImplementation((key: string) =>
    key === "access-token" ? { value: "test-access-token" } : undefined,
  );
}

interface RenderOptions {
  tab?: string;
  sessions?: unknown;
  notes?: unknown;
  menus?: unknown;
  summaries?: unknown;
  themes?: unknown;
  goals?: unknown;
  reviews?: unknown;
  todayPlans?: unknown;
  heatmap?: unknown;
  swingStats?: unknown;
}

/** 解決値そのものか、Promise を返す関数（reject を作りたい場合）を受ける。 */
const resolveWith = (mock: jest.Mock, value: unknown) => {
  if (typeof value === "function") {
    mock.mockImplementation(value as () => Promise<unknown>);
    return;
  }
  mock.mockResolvedValue(value);
};

async function renderPage({
  tab,
  sessions = ok([buildSession()]),
  notes = ok([]),
  menus = ok([]),
  summaries = ok([]),
  themes = ok([]),
  goals = ok([]),
  reviews = ok([]),
  todayPlans = ok([]),
  heatmap = ok(buildHeatmap()),
  swingStats = ok({ today_count: 0, month_count: 0, total_count: 0 }),
}: RenderOptions = {}) {
  setAuthCookies();
  resolveWith(mockGetPracticeSessions, sessions);
  resolveWith(mockGetBaseballNotes, notes);
  resolveWith(mockGetPracticeMenus, menus);
  resolveWith(mockGetMenuSummaries, summaries);
  resolveWith(mockGetImprovementThemes, themes);
  resolveWith(mockGetGoals, goals);
  resolveWith(mockGetPeriodicReviews, reviews);
  resolveWith(mockGetDayPlan, todayPlans);
  resolveWith(mockGetActivityHeatmap, heatmap);
  resolveWith(mockGetShadowSwingStats, swingStats);
  mockGetDashboardData.mockResolvedValue(null);
  mockGetAvailableSeasons.mockResolvedValue([]);

  render(
    await DashboardPage({
      searchParams: Promise.resolve(tab === undefined ? {} : { tab }),
    }),
  );
}

const recentPractice = () => screen.getByRole("region", { name: "最近の練習" });

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
});

afterEach(() => {
  jest.useRealTimers();
});

describe("認証", () => {
  it("未ログインはサインアップへ送り、API を叩かない", async () => {
    mockCookieGet.mockReturnValue(undefined);

    await expect(
      DashboardPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/signup?auth_required=true");
    expect(mockGetPracticeSessions).not.toHaveBeenCalled();
    expect(mockGetDashboardData).not.toHaveBeenCalled();
  });
});

describe("2面の切り替え", () => {
  it("既定は「練習・活動」面で、ダッシュボードの成績は取りに行かない", async () => {
    await renderPage();

    expect(screen.getByRole("link", { name: "練習・活動" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: "練習を記録" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("成績ダッシュボード")).not.toBeInTheDocument();
    expect(mockGetDashboardData).not.toHaveBeenCalled();
  });

  it("tab=dashboard はダッシュボード面で、活動面のデータは取りに行かない", async () => {
    await renderPage({ tab: "dashboard" });

    expect(
      screen.getByRole("link", { name: "ダッシュボード" }),
    ).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("成績ダッシュボード")).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "最近の練習" }),
    ).not.toBeInTheDocument();
    expect(mockGetPracticeSessions).not.toHaveBeenCalled();
    expect(mockGetDashboardData).toHaveBeenCalled();
  });

  it("不正な tab は既定の「練習・活動」面へ倒す", async () => {
    await renderPage({ tab: "unknown" });

    expect(screen.getByRole("link", { name: "練習・活動" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(recentPractice()).toBeInTheDocument();
  });

  it("面の切り替えはリンクで、URL だけで表示中の面が決まる", async () => {
    await renderPage();

    expect(screen.getByRole("link", { name: "練習・活動" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(
      screen.getByRole("link", { name: "ダッシュボード" }),
    ).toHaveAttribute("href", "/dashboard?tab=dashboard");
  });
});

describe("セクションの並び", () => {
  it("記録導線を先頭に、課題 → 目標 → 練習ツール → 上達サイクル → 最近の練習 の順で並べる", async () => {
    await renderPage({
      summaries: ok([buildSummary()]),
    });

    const titles = screen
      .getAllByRole("region")
      .map((region) => region.getAttribute("aria-label"));
    expect(titles).toEqual([
      "取り組んでいる課題",
      "目標管理",
      "練習ツール",
      "上達サイクルをまわす",
      "今月の積み上げ",
      "最近の練習",
    ]);
  });
});

describe("後からマージされた機能の差し込み", () => {
  it("今日のやること・継続（草グラフ）・練習ツール・相関インサイトを活動面に出す", async () => {
    await renderPage();

    expect(screen.getByText("今日のやること")).toBeInTheDocument();
    expect(screen.getByText("継続")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /素振りカウントタイマー/ }),
    ).toHaveAttribute("href", "/practice/shadow-swing");
    expect(
      screen.getByRole("link", { name: /練習と成績のつながり/ }),
    ).toHaveAttribute("href", "/insights");
  });

  it("差し込んだセクションの取得が失敗しても他のセクションは表示する", async () => {
    await renderPage({
      todayPlans: () => Promise.reject(new Error("boom")),
      heatmap: () => Promise.reject(new Error("boom")),
      swingStats: () => Promise.reject(new Error("boom")),
      summaries: ok([buildSummary()]),
    });

    expect(recentPractice()).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "今月の積み上げ" }),
    ).toBeInTheDocument();
  });
});

describe("最近の練習の日付表記", () => {
  it("今日・昨日・一昨日は相対表記、それ以前は月日で出す", async () => {
    await renderPage({
      sessions: ok([
        buildSession({ id: 1, logged_on: "2026-08-03" }),
        buildSession({ id: 2, logged_on: "2026-08-02" }),
        buildSession({ id: 3, logged_on: "2026-08-01" }),
        buildSession({ id: 4, logged_on: "2026-07-31" }),
      ]),
    });

    const section = recentPractice();
    expect(within(section).getByText("今日")).toBeInTheDocument();
    expect(within(section).getByText("昨日")).toBeInTheDocument();
    expect(within(section).getByText("一昨日")).toBeInTheDocument();
    // 3日前は相対表記の範囲外。
    expect(within(section).getByText("7/31")).toBeInTheDocument();
    expect(within(section).queryByText("一昨昨日")).not.toBeInTheDocument();
  });

  it("日付に曜日を添える", async () => {
    await renderPage({
      sessions: ok([buildSession({ logged_on: "2026-08-03" })]),
    });

    expect(within(recentPractice()).getByText("(月)")).toBeInTheDocument();
  });

  it("その日の記録詳細へ遷移できる", async () => {
    await renderPage({
      sessions: ok([buildSession({ id: 42, logged_on: "2026-08-03" })]),
    });

    expect(
      screen.getByRole("link", { name: "今日の練習の詳細を開く" }),
    ).toHaveAttribute("href", "/practice/records/42");
  });

  it("直近5日ぶんだけ出し、それより古い記録は一覧に任せる", async () => {
    await renderPage({
      sessions: ok(
        ["08-03", "08-02", "08-01", "07-31", "07-30", "07-29"].map(
          (day, index) =>
            buildSession({ id: index + 1, logged_on: `2026-${day}` }),
        ),
      ),
    });

    const section = recentPractice();
    expect(
      within(section).getAllByRole("link", { name: /練習の詳細を開く/ }),
    ).toHaveLength(5);
    expect(within(section).queryByText("7/29")).not.toBeInTheDocument();
    expect(
      within(section).getByRole("link", { name: /すべての記録を見る/ }),
    ).toHaveAttribute("href", "/practice/records");
  });

  it("練習量は decimal 文字列のまま出さず整形する", async () => {
    await renderPage({
      sessions: ok([
        buildSession({
          practice_logs: [buildLog({ amount: "200.0", unit_label: "本" })],
        }),
      ]),
    });

    const section = recentPractice();
    expect(within(section).getByText("200本")).toBeInTheDocument();
    expect(within(section).queryByText("200.0本")).not.toBeInTheDocument();
  });
});

describe("最近の練習のコンディションバッジ", () => {
  it("体調を優先して表情バッジに要約する", async () => {
    await renderPage({
      sessions: ok([
        buildSession({
          condition: buildCondition({ physical_level: 4, fatigue_level: 1 }),
        }),
      ]),
    });

    const section = recentPractice();
    expect(within(section).getByText("好調")).toBeInTheDocument();
    expect(within(section).queryByText("かなり疲れ")).not.toBeInTheDocument();
    expect(within(section).queryByText("元気")).not.toBeInTheDocument();
  });

  it("体調が無ければ疲労度を疲労度の語彙で出す", async () => {
    await renderPage({
      sessions: ok([
        buildSession({ condition: buildCondition({ fatigue_level: 4 }) }),
      ]),
    });

    expect(within(recentPractice()).getByText("元気")).toBeInTheDocument();
  });

  it("段階が無ければ気分を出す", async () => {
    await renderPage({
      sessions: ok([
        buildSession({ condition: buildCondition({ mood: "好調" }) }),
      ]),
    });

    expect(within(recentPractice()).getByText("好調")).toBeInTheDocument();
  });

  it("コンディション未記録の日はバッジを出さない", async () => {
    await renderPage({
      sessions: ok([buildSession({ condition: null })]),
    });

    const section = recentPractice();
    expect(within(section).queryByText("ふつう")).not.toBeInTheDocument();
    expect(within(section).queryByText("好調")).not.toBeInTheDocument();
  });
});

describe("最近の練習のノートプレビュー", () => {
  it("練習ログに紐付いたノートのプレビューを添える", async () => {
    await renderPage({
      sessions: ok([buildSession({ practice_logs: [buildLog({ id: 7 })] })]),
      notes: ok([
        buildNote({ practice_log_id: 7, memo_preview: "始動が早くなった" }),
      ]),
    });

    expect(
      within(recentPractice()).getByText("始動が早くなった"),
    ).toBeInTheDocument();
  });

  it("別のログに紐付いたノートは出さない", async () => {
    await renderPage({
      sessions: ok([buildSession({ practice_logs: [buildLog({ id: 7 })] })]),
      notes: ok([
        buildNote({ practice_log_id: 99, memo_preview: "別の日のノート" }),
      ]),
    });

    expect(
      within(recentPractice()).queryByText("別の日のノート"),
    ).not.toBeInTheDocument();
  });

  it("ノートの取得に失敗してもタイムラインは表示する", async () => {
    await renderPage({
      sessions: ok([buildSession({ logged_on: "2026-08-03" })]),
      notes: failed,
    });

    expect(within(recentPractice()).getByText("今日")).toBeInTheDocument();
  });
});

describe("最近の練習の0件と取得失敗", () => {
  it("0件は「これから並ぶ」案内にする", async () => {
    await renderPage({ sessions: ok([]) });

    const section = recentPractice();
    expect(
      within(section).getByText(/記録した練習がここに新しい順で並びます/),
    ).toBeInTheDocument();
    expect(within(section).queryByRole("alert")).not.toBeInTheDocument();
  });

  it("取得失敗は0件と区別してエラーを出す", async () => {
    await renderPage({ sessions: failed });

    const section = recentPractice();
    expect(within(section).getByRole("alert")).toHaveTextContent(
      "最近の練習を取得できませんでした",
    );
    expect(
      within(section).queryByText(/記録した練習がここに新しい順で並びます/),
    ).not.toBeInTheDocument();
  });
});

describe("今月の積み上げ", () => {
  it("今月の多い順に上位3件だけ出す", async () => {
    await renderPage({
      summaries: ok([
        buildSummary({
          practice_menu_id: 1,
          menu_name: "素振り",
          this_month_amount: 300,
        }),
        buildSummary({
          practice_menu_id: 2,
          menu_name: "ティー",
          this_month_amount: 900,
        }),
        buildSummary({
          practice_menu_id: 3,
          menu_name: "ランニング",
          this_month_amount: 600,
        }),
        buildSummary({
          practice_menu_id: 4,
          menu_name: "ノック",
          this_month_amount: 100,
        }),
      ]),
    });

    const section = screen.getByRole("region", { name: "今月の積み上げ" });
    expect(
      within(section)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["ティー900本", "ランニング600本", "素振り300本"]);
    expect(within(section).queryByText("ノック")).not.toBeInTheDocument();
  });

  it("今月0件のメニューしか無ければセクションごと出さない", async () => {
    await renderPage({
      summaries: ok([
        buildSummary({ this_month_amount: 0, this_month_volume: null }),
      ]),
    });

    expect(
      screen.queryByRole("region", { name: "今月の積み上げ" }),
    ).not.toBeInTheDocument();
  });

  it("サマリーが0件でもセクションごと出さない", async () => {
    await renderPage({ summaries: ok([]) });

    expect(
      screen.queryByRole("region", { name: "今月の積み上げ" }),
    ).not.toBeInTheDocument();
  });

  it("取得失敗は非表示にせずエラーを出す", async () => {
    await renderPage({ summaries: failed });

    const section = screen.getByRole("region", { name: "今月の積み上げ" });
    expect(within(section).getByRole("alert")).toHaveTextContent(
      "今月の積み上げを取得できませんでした",
    );
  });

  it("筋トレは回数ではなく総挙上重量で比べて表示する", async () => {
    await renderPage({
      summaries: ok([
        buildSummary({
          practice_menu_id: 5,
          menu_name: "ベンチプレス",
          unit: "weight_reps",
          unit_label: "回",
          total_amount: 620,
          total_volume: 8200,
          this_month_amount: 80,
          this_month_volume: 640,
        }),
      ]),
    });

    const section = screen.getByRole("region", { name: "今月の積み上げ" });
    expect(within(section).getByText("640kg")).toBeInTheDocument();
    expect(within(section).queryByText("80回")).not.toBeInTheDocument();
  });
});

describe("取り組んでいる課題", () => {
  it("取組中の課題だけを取りに行く", async () => {
    await renderPage();

    expect(mockGetImprovementThemes).toHaveBeenCalledWith({ status: "open" });
  });

  it("課題と取組状況を出し、詳細へ遷移できる", async () => {
    await renderPage({
      themes: ok([buildTheme({ id: 3, title: "始動を早くする" })]),
    });

    const section = screen.getByRole("region", {
      name: "取り組んでいる課題",
    });
    expect(within(section).getByText("取組 8日")).toBeInTheDocument();
    expect(within(section).getByText("練習 12")).toBeInTheDocument();
    expect(within(section).getByText("ノート 3")).toBeInTheDocument();
    expect(
      within(section).getByRole("link", { name: /始動を早くする/ }),
    ).toHaveAttribute("href", "/themes/3");
  });

  it("0件は課題設定を促し、取得失敗とは別の文言にする", async () => {
    await renderPage({ themes: ok([]) });

    const section = screen.getByRole("region", { name: "取り組んでいる課題" });
    expect(
      within(section).getByText(/いま取り組む課題を決めると/),
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("link", { name: "課題を設定する" }),
    ).toHaveAttribute("href", "/themes");
    expect(within(section).queryByRole("alert")).not.toBeInTheDocument();
  });

  it("取得失敗は0件と区別してエラーを出す", async () => {
    await renderPage({ themes: failed });

    const section = screen.getByRole("region", { name: "取り組んでいる課題" });
    expect(within(section).getByRole("alert")).toHaveTextContent(
      "課題を取得できませんでした",
    );
    expect(
      within(section).queryByText(/いま取り組む課題を決めると/),
    ).not.toBeInTheDocument();
  });
});

describe("目標管理", () => {
  it("進行中の目標を期間別に出す", async () => {
    await renderPage({ goals: ok([buildGoal()]) });

    const section = screen.getByRole("region", { name: "目標管理" });
    expect(within(section).getByText("月次")).toBeInTheDocument();
    expect(within(section).getByText("8月は20日練習する")).toBeInTheDocument();
    expect(
      within(section).getByRole("progressbar", {
        name: "8月は20日練習するの進捗",
      }),
    ).toHaveAttribute("aria-valuenow", "40");
  });

  it("0件は設定を促す案内にする", async () => {
    await renderPage({ goals: ok([]) });

    const section = screen.getByRole("region", { name: "目標管理" });
    expect(within(section).getByText(/目標を設定すると/)).toBeInTheDocument();
    expect(within(section).queryByRole("alert")).not.toBeInTheDocument();
  });

  it("取得失敗は0件と区別してエラーを出す", async () => {
    await renderPage({ goals: failed });

    const section = screen.getByRole("region", { name: "目標管理" });
    expect(within(section).getByRole("alert")).toHaveTextContent(
      "目標を取得できませんでした",
    );
    expect(
      within(section).queryByText(/目標を設定すると/),
    ).not.toBeInTheDocument();
  });

  it("目標の管理へ遷移できる", async () => {
    await renderPage({ goals: ok([]) });

    expect(
      within(screen.getByRole("region", { name: "目標管理" })).getByRole(
        "link",
        { name: "目標を管理" },
      ),
    ).toHaveAttribute("href", "/goals");
  });
});

describe("未読レポートバナー", () => {
  it("未読があれば案内する", async () => {
    await renderPage({
      reviews: ok([
        {
          id: 1,
          period_type: "weekly",
          period_start: "2026-07-27",
          period_end: "2026-08-02",
          read: false,
        },
      ]),
    });

    expect(
      screen.getByRole("link", { name: /振り返りレポートが届いています/ }),
    ).toBeInTheDocument();
  });

  it("未読が無ければ出さない", async () => {
    await renderPage({ reviews: ok([]) });

    expect(
      screen.queryByText(/振り返りレポートが届いています/),
    ).not.toBeInTheDocument();
  });
});

describe("セクションの取得失敗の隔離", () => {
  it("1セクションの取得が例外で落ちても他のセクションは表示する", async () => {
    await renderPage({
      sessions: () => Promise.reject(new Error("boom")),
      themes: ok([buildTheme({ title: "始動を早くする" })]),
      summaries: ok([buildSummary({ this_month_amount: 800 })]),
      goals: ok([buildGoal()]),
    });

    expect(within(recentPractice()).getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("始動を早くする")).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "今月の積み上げ" }),
    ).toBeInTheDocument();
    expect(screen.getByText("8月は20日練習する")).toBeInTheDocument();
  });

  it("複数のセクションが失敗しても残りは表示する", async () => {
    await renderPage({
      sessions: failed,
      themes: () => Promise.reject(new Error("boom")),
      goals: failed,
      summaries: ok([buildSummary({ this_month_amount: 800 })]),
    });

    expect(
      screen.getByRole("region", { name: "今月の積み上げ" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("alert")).toHaveLength(3);
    // 記録導線は取得結果に依存しないので常に出る。
    expect(
      screen.getByRole("link", { name: "練習を記録" }),
    ).toBeInTheDocument();
  });
});

describe("記録導線と上達サイクル", () => {
  it("記録導線を最上段に固定する", async () => {
    await renderPage();

    expect(screen.getByRole("link", { name: "練習を記録" })).toHaveAttribute(
      "href",
      "/practice/record",
    );
    expect(
      screen.getByRole("link", { name: "野球ノートを記録" }),
    ).toHaveAttribute("href", "/note/new");
    expect(
      screen.getByRole("link", { name: "練習記録・野球ノートの一覧" }),
    ).toHaveAttribute("href", "/practice/records");
  });

  it("上達サイクルの導線を並べる", async () => {
    await renderPage();

    const section = screen.getByRole("region", {
      name: "上達サイクルをまわす",
    });
    expect(
      within(section)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual(["/themes", "/goals", "/insights", "/review"]);
  });
});
