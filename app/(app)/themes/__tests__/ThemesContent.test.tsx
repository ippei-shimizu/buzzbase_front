const mockOpenProUpgradeModal = jest.fn();

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({
    open: mockOpenProUpgradeModal,
    close: jest.fn(),
  }),
}));

jest.mock("@app/hooks/pro/useEntitlement", () => ({
  useEntitlement: jest.fn(),
}));

jest.mock("@app/lib/analytics", () => ({
  trackEvent: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: { error: jest.fn(), success: jest.fn(), info: jest.fn() },
}));

jest.mock("@app/services/v2/improvementThemeService", () => ({
  createImprovementTheme: jest.fn(),
}));

import type { ImprovementTheme } from "@app/types/improvementTheme";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import { createImprovementTheme } from "@app/services/v2/improvementThemeService";
import ThemesContent from "../_components/ThemesContent";

const mockUseEntitlement = useEntitlement as jest.MockedFunction<
  typeof useEntitlement
>;
const mockCreate = createImprovementTheme as jest.MockedFunction<
  typeof createImprovementTheme
>;

function buildTheme(
  overrides: Partial<ImprovementTheme> = {},
): ImprovementTheme {
  return {
    id: 1,
    title: "肩の開きを抑える",
    category: "batting",
    purpose: null,
    status: "open",
    started_on: "2026-07-01",
    achieved_on: null,
    sort_order: 0,
    practice_logs_count: 0,
    notes_count: 0,
    active_days: 0,
    created_at: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

function mockEntitlement({
  granted = false,
  isLoading = false,
}: { granted?: boolean; isLoading?: boolean } = {}) {
  mockUseEntitlement.mockReturnValue({
    isPro: granted,
    inTrial: false,
    inGracePeriod: false,
    isLoading,
    hasEntitlement: () => granted,
  } as unknown as ReturnType<typeof useEntitlement>);
}

function tab(name: string) {
  return screen.getByRole("tab", { name: new RegExp(name) });
}

describe("課題一覧", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEntitlement();
  });

  it("3タブに件数バッジを出し、取組中を初期表示する", () => {
    render(
      <ThemesContent
        initialThemes={[
          buildTheme({ id: 1, title: "課題A", status: "open" }),
          buildTheme({ id: 2, title: "課題B", status: "open" }),
          buildTheme({ id: 3, title: "課題C", status: "achieved" }),
          buildTheme({ id: 4, title: "課題D", status: "archived" }),
        ]}
      />,
    );

    expect(within(tab("取組中")).getByText("2")).toBeInTheDocument();
    expect(within(tab("克服")).getByText("1")).toBeInTheDocument();
    expect(within(tab("アーカイブ")).getByText("1")).toBeInTheDocument();
    expect(screen.getByText("課題A")).toBeInTheDocument();
    expect(screen.queryByText("課題C")).not.toBeInTheDocument();
  });

  it("タブを切り替えるとそのステータスの課題だけを出す", async () => {
    const user = userEvent.setup();
    render(
      <ThemesContent
        initialThemes={[
          buildTheme({ id: 1, title: "課題A", status: "open" }),
          buildTheme({ id: 3, title: "課題C", status: "achieved" }),
        ]}
      />,
    );

    await user.click(tab("克服"));

    expect(screen.getByText("課題C")).toBeInTheDocument();
    expect(screen.queryByText("課題A")).not.toBeInTheDocument();
  });

  it("課題が無いタブには専用の空メッセージを出す", async () => {
    const user = userEvent.setup();
    render(<ThemesContent initialThemes={[]} />);

    expect(screen.getByText(/いま取り組む課題を決めると/)).toBeInTheDocument();

    await user.click(tab("アーカイブ"));
    expect(
      screen.getByText("アーカイブした課題はありません。"),
    ).toBeInTheDocument();
  });

  it("統計は back の集計値をそのまま出す", () => {
    render(
      <ThemesContent
        initialThemes={[
          buildTheme({
            active_days: 12,
            practice_logs_count: 30,
            notes_count: 4,
          }),
        ]}
      />,
    );

    expect(screen.getByText("取組 12日")).toBeInTheDocument();
    expect(screen.getByText("練習 30件")).toBeInTheDocument();
    expect(screen.getByText("ノート 4件")).toBeInTheDocument();
  });

  it("課題を作成すると一覧へ加わる", async () => {
    const user = userEvent.setup();
    mockCreate.mockResolvedValue({
      ok: true,
      data: buildTheme({ id: 9, title: "体重移動" }),
    });
    render(<ThemesContent initialThemes={[]} />);

    await user.click(
      screen.getByRole("button", { name: /新しい課題に取り組む/ }),
    );
    await user.type(screen.getByLabelText(/いま取り組む課題/), "体重移動");
    await user.click(
      screen.getByRole("button", { name: "この課題に取り組む" }),
    );

    await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
    expect(mockCreate.mock.calls[0][0]).toEqual({
      title: "体重移動",
      category: "batting",
      purpose: null,
    });
    expect(await screen.findByText("体重移動")).toBeInTheDocument();
  });

  it("タイトルが空なら送信しない", async () => {
    const user = userEvent.setup();
    render(<ThemesContent initialThemes={[]} />);

    await user.click(
      screen.getByRole("button", { name: /新しい課題に取り組む/ }),
    );
    await user.click(
      screen.getByRole("button", { name: "この課題に取り組む" }),
    );

    expect(mockCreate).not.toHaveBeenCalled();
    expect(
      screen.getByText("課題のタイトルを入力してください。"),
    ).toBeInTheDocument();
  });

  it("無料で取組中が2件あると3件目の作成で Pro 訴求を出す", async () => {
    const user = userEvent.setup();
    render(
      <ThemesContent
        initialThemes={[
          buildTheme({ id: 1, status: "open" }),
          buildTheme({ id: 2, status: "open" }),
        ]}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /新しい課題に取り組む/ }),
    );

    expect(mockOpenProUpgradeModal).toHaveBeenCalledWith({
      trigger: "unlimited_improvement_themes",
    });
    expect(
      screen.queryByRole("button", { name: "この課題に取り組む" }),
    ).not.toBeInTheDocument();
  });

  it("克服・アーカイブ済みは無料枠に数えず、3件目を作成できる", async () => {
    const user = userEvent.setup();
    mockCreate.mockResolvedValue({ ok: true, data: buildTheme({ id: 9 }) });
    render(
      <ThemesContent
        initialThemes={[
          buildTheme({ id: 1, status: "open" }),
          buildTheme({ id: 2, status: "achieved" }),
          buildTheme({ id: 3, status: "archived" }),
        ]}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /新しい課題に取り組む/ }),
    );

    expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "この課題に取り組む" }),
    ).toBeInTheDocument();
  });

  it("Pro は取組中が2件を超えても作成フォームを開ける", async () => {
    const user = userEvent.setup();
    mockEntitlement({ granted: true });
    render(
      <ThemesContent
        initialThemes={[
          buildTheme({ id: 1, status: "open" }),
          buildTheme({ id: 2, status: "open" }),
        ]}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /新しい課題に取り組む/ }),
    );

    expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "この課題に取り組む" }),
    ).toBeInTheDocument();
  });

  it("サーバー側で上限に弾かれたらフォームに上限の案内を出す", async () => {
    const user = userEvent.setup();
    mockCreate.mockResolvedValue({
      ok: false,
      reason: "forbidden",
      errors: ["取組中の課題は無料プランで2つまでです"],
    });
    render(<ThemesContent initialThemes={[]} />);

    await user.click(
      screen.getByRole("button", { name: /新しい課題に取り組む/ }),
    );
    await user.type(screen.getByLabelText(/いま取り組む課題/), "3つ目");
    await user.click(
      screen.getByRole("button", { name: "この課題に取り組む" }),
    );

    await waitFor(() =>
      expect(mockOpenProUpgradeModal).toHaveBeenCalledWith({
        trigger: "unlimited_improvement_themes",
      }),
    );
    expect(
      screen.getByText(/無料プランで同時に取り組める課題は2件までです/),
    ).toBeInTheDocument();
  });
});
