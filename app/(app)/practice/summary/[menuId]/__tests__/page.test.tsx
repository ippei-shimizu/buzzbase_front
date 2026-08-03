const mockCookieGet = jest.fn();
const mockRedirect = jest.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});
const mockNotFound = jest.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});
const mockGetCachedProStatus = jest.fn();
const mockGetMenuTrend = jest.fn();
const mockGetShadowSwingTrend = jest.fn();
const mockGetPracticeMenus = jest.fn();

jest.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: mockCookieGet }),
}));

jest.mock("next/navigation", () => ({
  redirect: (path: string) => mockRedirect(path),
  notFound: () => mockNotFound(),
}));

jest.mock("@app/(app)/pro/proStatus", () => ({
  getCachedProStatus: () => mockGetCachedProStatus(),
}));

jest.mock("@app/services/v2/practiceSummaryService", () => ({
  getMenuTrend: (menuId: number) => mockGetMenuTrend(menuId),
  getShadowSwingTrend: () => mockGetShadowSwingTrend(),
}));

jest.mock("@app/services/v2/practiceMenuService", () => ({
  getPracticeMenus: () => mockGetPracticeMenus(),
}));

jest.mock("@app/components/header/Header", () => ({
  __esModule: true,
  default: () => <header />,
}));

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({ open: jest.fn(), close: jest.fn() }),
}));

jest.mock("@app/lib/analytics", () => ({
  trackEvent: jest.fn(),
}));

import type { MenuTrend } from "@app/types/practice";
import { render, screen } from "@testing-library/react";
import { DEFAULT_PRO_STATUS } from "@app/types/pro";
import PracticeMenuTrendPage from "../page";

const FEATURE = "practice_menu_trend_detail";
const SAMPLE_LABEL = "サンプルデータ（実際の記録ではありません）";

const buildTrend = (overrides: Partial<MenuTrend> = {}): MenuTrend => ({
  menu: {
    id: 3,
    name: "ベンチプレス",
    unit: "weight_reps",
    unit_label: "回",
    is_weight_reps: true,
  },
  by_year: [
    { period: "2026", total_amount: 620, total_volume: 8200, days_count: 40 },
  ],
  by_month: [
    {
      period: "2026-08",
      total_amount: 80,
      total_volume: 640,
      days_count: 4,
    },
  ],
  by_day: [
    {
      period: "2026-08-03",
      total_amount: 20,
      total_volume: 160,
      days_count: 1,
    },
  ],
  ...overrides,
});

function setAuthCookies() {
  mockCookieGet.mockImplementation((key: string) =>
    key === "access-token" ? { value: "test-access-token" } : undefined,
  );
}

function setPro(isPro: boolean) {
  mockGetCachedProStatus.mockResolvedValue({
    ...DEFAULT_PRO_STATUS,
    entitlements: isPro
      ? [...DEFAULT_PRO_STATUS.entitlements, FEATURE]
      : DEFAULT_PRO_STATUS.entitlements,
  });
}

async function renderPage({
  menuId = "3",
  source,
}: { menuId?: string; source?: string } = {}) {
  render(
    await PracticeMenuTrendPage({
      params: Promise.resolve({ menuId }),
      searchParams: Promise.resolve(source ? { source } : {}),
    }),
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  setAuthCookies();
  mockGetPracticeMenus.mockResolvedValue({
    status: "ok",
    data: [
      {
        id: 3,
        name: "ベンチプレス",
        category: "strength",
        unit: "weight_reps",
        unit_label: "回",
        default_value: null,
        is_favorite: false,
        sort_order: 0,
      },
    ],
  });
});

describe("認証", () => {
  it("未ログインはサインアップへ送る", async () => {
    mockCookieGet.mockReturnValue(undefined);

    await expect(
      PracticeMenuTrendPage({
        params: Promise.resolve({ menuId: "3" }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(mockGetMenuTrend).not.toHaveBeenCalled();
  });
});

describe("無料ユーザー", () => {
  beforeEach(() => {
    setPro(false);
  });

  it("推移 API を一度も叩かずサンプルを表示する", async () => {
    await renderPage();

    expect(mockGetMenuTrend).not.toHaveBeenCalled();
    expect(mockGetShadowSwingTrend).not.toHaveBeenCalled();
    expect(screen.getByText(SAMPLE_LABEL)).toBeInTheDocument();
  });

  it("Pro 限定機能である旨を伝える（無料枠の超過ではない）", async () => {
    await renderPage();

    expect(
      screen.getByText(
        /メニューごとの推移の詳細表示は Pro プラン限定の機能です/,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/件まで/)).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "メニューごとの推移を詳しく見る" }),
    ).toBeInTheDocument();
  });

  it("サンプルでも対象メニューの単位で表示する", async () => {
    await renderPage();

    expect(
      screen.getByRole("heading", { level: 2, name: "ベンチプレス" }),
    ).toBeInTheDocument();
    // weight_reps のサンプルは総挙上重量（kg / t）で出す。
    expect(screen.getAllByText(/kg|t$/).length).toBeGreaterThan(0);
  });

  it("素振りはメニュー一覧を引かずに素振りとして見せる", async () => {
    await renderPage({ menuId: "shadow_swing", source: "shadow_swing" });

    expect(mockGetShadowSwingTrend).not.toHaveBeenCalled();
    expect(mockGetPracticeMenus).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", { level: 2, name: "素振り" }),
    ).toBeInTheDocument();
  });
});

describe("Pro ユーザー", () => {
  beforeEach(() => {
    setPro(true);
  });

  it("メニュー推移をメニュー id で取得する", async () => {
    mockGetMenuTrend.mockResolvedValue({ status: "ok", data: buildTrend() });

    await renderPage({ menuId: "3" });

    expect(mockGetMenuTrend).toHaveBeenCalledWith(3);
    expect(mockGetShadowSwingTrend).not.toHaveBeenCalled();
    expect(screen.queryByText(SAMPLE_LABEL)).not.toBeInTheDocument();
    expect(screen.getByText("640kg")).toBeInTheDocument();
  });

  it("source=shadow_swing は素振り専用エンドポイントを叩く", async () => {
    mockGetShadowSwingTrend.mockResolvedValue({
      status: "ok",
      data: buildTrend({
        menu: {
          id: null,
          name: "素振り",
          unit: "count",
          unit_label: "本",
          is_weight_reps: false,
        },
      }),
    });

    await renderPage({ menuId: "shadow_swing", source: "shadow_swing" });

    expect(mockGetShadowSwingTrend).toHaveBeenCalledTimes(1);
    expect(mockGetMenuTrend).not.toHaveBeenCalled();
    expect(screen.getByText("80本")).toBeInTheDocument();
  });

  it("記録 0 件は空の案内を出す", async () => {
    mockGetMenuTrend.mockResolvedValue({
      status: "ok",
      data: buildTrend({ by_year: [], by_month: [], by_day: [] }),
    });

    await renderPage();

    expect(screen.getByText("まだ記録がありません")).toBeInTheDocument();
    expect(
      screen.queryByText(/推移を取得できませんでした/),
    ).not.toBeInTheDocument();
  });

  it("取得失敗は 0 件と区別してエラーを出す", async () => {
    mockGetMenuTrend.mockResolvedValue({ status: "error" });

    await renderPage();

    expect(screen.getByText(/推移を取得できませんでした/)).toBeInTheDocument();
    expect(screen.queryByText("まだ記録がありません")).not.toBeInTheDocument();
    expect(screen.queryByText(SAMPLE_LABEL)).not.toBeInTheDocument();
  });

  it("403 は Pro 限定の文脈でサンプルへ倒す", async () => {
    mockGetMenuTrend.mockResolvedValue({ status: "forbidden" });

    await renderPage();

    expect(screen.getByText(SAMPLE_LABEL)).toBeInTheDocument();
    expect(
      screen.getByText(
        /メニューごとの推移の詳細表示は Pro プラン限定の機能です/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/推移を取得できませんでした/),
    ).not.toBeInTheDocument();
  });
});

describe("不正なパス", () => {
  it("数値でないメニュー id は 404（source 指定なし）", async () => {
    setPro(true);

    await expect(renderPage({ menuId: "abc" })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(mockGetMenuTrend).not.toHaveBeenCalled();
  });
});
