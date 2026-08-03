const mockCookieGet = jest.fn();
const mockRedirect = jest.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});
const mockGetMenuSummaries = jest.fn();
const mockGetPracticeMenus = jest.fn();
const mockGetPracticeOverview = jest.fn();

jest.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: mockCookieGet }),
}));

jest.mock("next/navigation", () => ({
  redirect: (path: string) => mockRedirect(path),
}));

jest.mock("@app/services/v2/practiceSummaryService", () => ({
  getMenuSummaries: () => mockGetMenuSummaries(),
  getPracticeOverview: () => mockGetPracticeOverview(),
}));

jest.mock("@app/services/v2/practiceMenuService", () => ({
  getPracticeMenus: () => mockGetPracticeMenus(),
}));

jest.mock("@app/components/header/Header", () => ({
  __esModule: true,
  default: () => <header />,
}));

import type { MenuSummary, PracticeMenu } from "@app/types/practice";
import { render, screen, within } from "@testing-library/react";
import PracticeSummaryPage from "../page";

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

const buildMenu = (overrides: Partial<PracticeMenu> = {}): PracticeMenu => ({
  id: 1,
  name: "素振り",
  category: "batting",
  unit: "count",
  unit_label: "本",
  default_value: null,
  is_favorite: false,
  sort_order: 0,
  ...overrides,
});

function setAuthCookies() {
  mockCookieGet.mockImplementation((key: string) =>
    key === "access-token" ? { value: "test-access-token" } : undefined,
  );
}

async function renderPage({
  summaries = [buildSummary()],
  menus = [buildMenu()],
  summariesStatus = "ok",
  overview = null as unknown,
}: {
  summaries?: MenuSummary[];
  menus?: PracticeMenu[];
  summariesStatus?: "ok" | "error";
  overview?: unknown;
} = {}) {
  setAuthCookies();
  mockGetMenuSummaries.mockResolvedValue(
    summariesStatus === "ok"
      ? { status: "ok", data: summaries }
      : { status: "error" },
  );
  mockGetPracticeMenus.mockResolvedValue({ status: "ok", data: menus });
  mockGetPracticeOverview.mockResolvedValue(
    overview === null ? { status: "error" } : { status: "ok", data: overview },
  );
  render(await PracticeSummaryPage());
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("認証", () => {
  it("未ログインはサインアップへ送り、API を叩かない", async () => {
    mockCookieGet.mockReturnValue(undefined);

    await expect(PracticeSummaryPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/signup?auth_required=true");
    expect(mockGetMenuSummaries).not.toHaveBeenCalled();
  });
});

describe("カードの並び", () => {
  it("最終記録日が新しい順に並べ、未記録のメニューを末尾に置く", async () => {
    await renderPage({
      summaries: [
        buildSummary({
          practice_menu_id: 1,
          menu_name: "ティー",
          last_logged_on: "2026-07-01",
        }),
        buildSummary({
          practice_menu_id: 2,
          menu_name: "素振り",
          last_logged_on: "2026-08-03",
        }),
      ],
      menus: [
        buildMenu({ id: 1, name: "ティー" }),
        buildMenu({ id: 2, name: "素振り" }),
        buildMenu({ id: 3, name: "ランニング", unit: "distance" }),
      ],
    });

    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.getAttribute("aria-label"))).toEqual([
      "素振りの推移を見る",
      "ティーの推移を見る",
      "ランニングの推移を見る",
    ]);
    expect(screen.getByText("まだ記録がありません")).toBeInTheDocument();
  });
});

describe("表示単位", () => {
  it("通常メニューは累計と今月を本数で出す", async () => {
    await renderPage();

    expect(screen.getByText("累計")).toBeInTheDocument();
    expect(screen.getByText("12,400本")).toBeInTheDocument();
    expect(screen.getByText("800本")).toBeInTheDocument();
    expect(screen.queryByText("総挙上重量")).not.toBeInTheDocument();
  });

  it("weight_reps は総挙上重量を t / kg で出し、回数は補足に回す", async () => {
    await renderPage({
      summaries: [
        buildSummary({
          practice_menu_id: 5,
          menu_name: "ベンチプレス",
          unit: "weight_reps",
          unit_label: "回",
          total_amount: 620,
          total_volume: 8200,
          this_month_amount: 80,
          this_month_volume: 640,
          days_count: 12,
        }),
      ],
      menus: [buildMenu({ id: 5, name: "ベンチプレス", category: "strength" })],
    });

    expect(screen.getByText("総挙上重量")).toBeInTheDocument();
    expect(screen.getByText("8.2t")).toBeInTheDocument();
    expect(screen.getByText("640kg")).toBeInTheDocument();
    expect(screen.getByText(/累計 620回/)).toBeInTheDocument();
    expect(screen.queryByText("8,200本")).not.toBeInTheDocument();
  });
});

describe("推移への導線", () => {
  it("メニューに紐付く記録は推移ページへリンクする", async () => {
    await renderPage({
      summaries: [buildSummary({ practice_menu_id: 4, menu_name: "ティー" })],
      menus: [buildMenu({ id: 4, name: "ティー" })],
    });

    expect(
      screen.getByRole("link", { name: "ティーの推移を見る" }),
    ).toHaveAttribute("href", "/practice/summary/4");
  });

  it("メニュー未紐付けの素振りは source 付きのリンクにする", async () => {
    await renderPage({
      summaries: [
        buildSummary({ practice_menu_id: null, menu_name: "素振り" }),
      ],
      menus: [],
    });

    expect(
      screen.getByRole("link", { name: "素振りの推移を見る" }),
    ).toHaveAttribute(
      "href",
      "/practice/summary/shadow_swing?source=shadow_swing",
    );
  });

  it("削除済みメニューの記録はリンクにせず、その旨を添える", async () => {
    await renderPage({
      summaries: [
        buildSummary({ practice_menu_id: null, menu_name: "消したメニュー" }),
      ],
      menus: [],
    });

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("削除したメニューの記録")).toBeInTheDocument();
  });
});

describe("0件と取得失敗", () => {
  it("記録も未記録メニューも無ければ空の案内を出す", async () => {
    await renderPage({ summaries: [], menus: [] });

    expect(screen.getByText("まだ練習の記録がありません")).toBeInTheDocument();
    expect(
      screen.queryByText(/積み上げサマリーを取得できませんでした/),
    ).not.toBeInTheDocument();
  });

  it("取得失敗は 0 件と区別してエラーを出す", async () => {
    await renderPage({ summariesStatus: "error" });

    expect(
      screen.getByText(/積み上げサマリーを取得できませんでした/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("まだ練習の記録がありません"),
    ).not.toBeInTheDocument();
  });
});

describe("KPI ヘッダ", () => {
  it("取得できた全体 KPI を表示する", async () => {
    await renderPage({
      overview: {
        total_practice_days: 120,
        this_month_practice_days: 12,
        total_swing_count: 4800,
        total_volume: 8200,
        total_menus: 5,
      },
    });

    const header = screen.getByRole("region", { name: "練習全体の積み上げ" });
    expect(within(header).getByText("120日")).toBeInTheDocument();
    expect(within(header).getByText("12日")).toBeInTheDocument();
    expect(within(header).getByText("8.2t")).toBeInTheDocument();
    expect(within(header).getByText("4,800本")).toBeInTheDocument();
  });

  it("KPI の取得に失敗してもカードは表示する", async () => {
    await renderPage();

    expect(
      screen.queryByRole("region", { name: "練習全体の積み上げ" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("12,400本")).toBeInTheDocument();
  });
});
