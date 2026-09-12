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

import type { ImprovementTheme } from "@app/types/improvementTheme";
import { fireEvent, render, screen } from "@testing-library/react";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import NoteThemeSection from "../NoteThemeSection";

const mockUseEntitlement = useEntitlement as jest.MockedFunction<
  typeof useEntitlement
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

function renderSection(
  props: Partial<React.ComponentProps<typeof NoteThemeSection>> = {},
) {
  const onChange = jest.fn();
  render(
    <NoteThemeSection
      themesResult={{ status: "ok", data: [buildTheme()] }}
      selectedIds={[]}
      onChange={onChange}
      initialCount={0}
      {...props}
    />,
  );
  return { onChange };
}

describe("課題の紐付けピッカー", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEntitlement();
  });

  it("取組中の課題だけを候補に出す", () => {
    renderSection({
      themesResult: {
        status: "ok",
        data: [
          buildTheme({ id: 1, title: "取組中の課題", status: "open" }),
          buildTheme({ id: 2, title: "克服した課題", status: "achieved" }),
          buildTheme({ id: 3, title: "アーカイブ課題", status: "archived" }),
        ],
      },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /取り組む課題に紐付け/ }),
    );

    expect(
      screen.getByRole("button", { name: "取組中の課題" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "克服した課題" }),
    ).not.toBeInTheDocument();
  });

  it("候補が0件なら取組中の課題が無いと伝える", () => {
    renderSection({ themesResult: { status: "ok", data: [] } });

    fireEvent.click(
      screen.getByRole("button", { name: /取り組む課題に紐付け/ }),
    );

    expect(screen.getByText("取組中の課題がありません")).toBeInTheDocument();
  });

  it("取得失敗は0件と区別して伝える", () => {
    renderSection({ themesResult: { status: "error" } });

    expect(screen.getByText(/課題を取得できませんでした/)).toBeInTheDocument();
    expect(
      screen.queryByText("取組中の課題がありません"),
    ).not.toBeInTheDocument();
  });

  it("候補を選ぶと紐付けに加える", () => {
    const { onChange } = renderSection();

    fireEvent.click(
      screen.getByRole("button", { name: /取り組む課題に紐付け/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "肩の開きを抑える" }));

    expect(onChange).toHaveBeenCalledWith([1]);
  });

  it("克服済みの課題が紐付いていても名前を表示する", () => {
    renderSection({
      themesResult: {
        status: "ok",
        data: [
          buildTheme({ id: 2, title: "克服した課題", status: "achieved" }),
        ],
      },
      selectedIds: [2],
      initialCount: 1,
    });

    expect(screen.getByText("克服した課題")).toBeInTheDocument();
  });

  it("紐付けを外せる", () => {
    const { onChange } = renderSection({
      selectedIds: [1, 2],
      initialCount: 2,
    });

    fireEvent.click(
      screen.getAllByRole("button", { name: "課題の紐付けを外す" })[0],
    );

    expect(onChange).toHaveBeenCalledWith([2]);
  });

  describe("複数紐付けの Pro 判定（グランドファザリング）", () => {
    it("無料は既存が無い状態から2件目を足そうとすると Pro 訴求を出す", () => {
      renderSection({ selectedIds: [1], initialCount: 0 });

      fireEvent.click(
        screen.getByRole("button", { name: /課題をもう1件追加/ }),
      );

      expect(mockOpenProUpgradeModal).toHaveBeenCalledWith({
        trigger: "multi_improvement_theme_links",
      });
      expect(
        screen.queryByText("取組中の課題がありません"),
      ).not.toBeInTheDocument();
    });

    it("無料でも既存件数の範囲内なら追加し直せる（Pro 解約後の維持）", () => {
      renderSection({ selectedIds: [1], initialCount: 2 });

      fireEvent.click(
        screen.getByRole("button", { name: /課題をもう1件追加/ }),
      );

      expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
    });

    it("無料は既存件数を超えて増やそうとすると Pro 訴求を出す", () => {
      renderSection({ selectedIds: [1, 2], initialCount: 2 });

      fireEvent.click(
        screen.getByRole("button", { name: /課題をもう1件追加/ }),
      );

      expect(mockOpenProUpgradeModal).toHaveBeenCalledWith({
        trigger: "multi_improvement_theme_links",
      });
    });

    it("Pro は既存が無くても複数紐付けできる", () => {
      mockEntitlement({ granted: true });
      renderSection({ selectedIds: [1], initialCount: 0 });

      fireEvent.click(
        screen.getByRole("button", { name: /課題をもう1件追加/ }),
      );

      expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
    });
  });
});
