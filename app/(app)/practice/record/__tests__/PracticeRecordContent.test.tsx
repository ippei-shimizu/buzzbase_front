const mockPush = jest.fn();
const mockOpenProUpgradeModal = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({
    open: mockOpenProUpgradeModal,
    close: jest.fn(),
  }),
}));

jest.mock("@app/hooks/pro/useEntitlement", () => ({
  useEntitlement: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: { error: jest.fn(), success: jest.fn(), info: jest.fn() },
}));

jest.mock("@app/services/v2/practiceSessionService", () => ({
  getPracticeSessionByDate: jest.fn(),
  upsertPracticeSession: jest.fn(),
}));

import type { ImprovementTheme } from "@app/types/improvementTheme";
import type {
  PracticeLog,
  PracticeMenu,
  PracticeSession,
  PracticeSessionItemInput,
} from "@app/types/practice";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import {
  getPracticeSessionByDate,
  upsertPracticeSession,
} from "@app/services/v2/practiceSessionService";
import PracticeRecordContent from "../_components/PracticeRecordContent";
import { todayString } from "../_utils/practiceRecordDraft";

const mockUseEntitlement = useEntitlement as jest.MockedFunction<
  typeof useEntitlement
>;
const mockGetByDate = getPracticeSessionByDate as jest.MockedFunction<
  typeof getPracticeSessionByDate
>;
const mockUpsert = upsertPracticeSession as jest.MockedFunction<
  typeof upsertPracticeSession
>;

const TODAY = todayString();

/** 基準日から日数をずらした `YYYY-MM-DD` を返す。 */
function shiftDays(date: string, days: number): string {
  const shifted = new Date(`${date}T00:00:00+09:00`);
  shifted.setDate(shifted.getDate() + days);
  return todayString(shifted);
}

const YESTERDAY = shiftDays(TODAY, -1);
const TOMORROW = shiftDays(TODAY, 1);

function buildMenu(overrides: Partial<PracticeMenu> = {}): PracticeMenu {
  return {
    id: 1,
    name: "素振り",
    category: "batting",
    unit: "count",
    unit_label: "本",
    default_value: "200.0",
    is_favorite: false,
    sort_order: 1,
    ...overrides,
  };
}

function buildLog(overrides: Partial<PracticeLog> = {}): PracticeLog {
  return {
    id: 1,
    practice_menu_id: 1,
    schedule_id: null,
    logged_on: YESTERDAY,
    amount: "300.0",
    weight: null,
    menu_name: "素振り",
    unit_label: "本",
    source: "manual",
    memo: null,
    created_at: `${YESTERDAY}T10:00:00+09:00`,
    ...overrides,
  };
}

function buildSession(
  overrides: Partial<PracticeSession> = {},
): PracticeSession {
  return {
    id: 10,
    logged_on: YESTERDAY,
    memo: null,
    improvement_theme_ids: [],
    practice_logs: [],
    condition: null,
    created_at: `${YESTERDAY}T10:00:00+09:00`,
    ...overrides,
  };
}

function buildTheme(
  overrides: Partial<ImprovementTheme> = {},
): ImprovementTheme {
  return {
    id: 1,
    title: "内角の対応",
    category: null,
    purpose: null,
    status: "open",
    started_on: TODAY,
    achieved_on: null,
    sort_order: 1,
    practice_logs_count: 0,
    notes_count: 0,
    active_days: 0,
    created_at: `${TODAY}T10:00:00+09:00`,
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
    hasEntitlement: jest.fn(() => granted),
  });
}

const DEFAULT_MENUS = [
  buildMenu({ id: 1, name: "素振り", category: "batting" }),
  buildMenu({
    id: 2,
    name: "ベンチプレス",
    category: "strength",
    unit: "weight_reps",
    unit_label: "回",
    default_value: "10.0",
  }),
  buildMenu({
    id: 3,
    name: "ランニング",
    category: "training",
    unit: "distance",
    unit_label: "km",
    default_value: null,
  }),
];

function renderContent(
  overrides: Partial<React.ComponentProps<typeof PracticeRecordContent>> = {},
) {
  return render(
    <PracticeRecordContent
      today={TODAY}
      initialDate={TODAY}
      menus={DEFAULT_MENUS}
      initialSession={null}
      initialLoadFailed={false}
      presetMenus={[]}
      themes={[]}
      {...overrides}
    />,
  );
}

/** 日付欄を別日に切り替える。 */
function changeDate(value: string) {
  fireEvent.change(screen.getByLabelText("日付"), { target: { value } });
}

/** 直近の保存リクエストの items を practice_menu_id 昇順で取り出す。 */
function savedItems(): PracticeSessionItemInput[] {
  const input = mockUpsert.mock.calls.at(-1)?.[0];
  return [...(input?.items ?? [])].sort(
    (a, b) => a.practice_menu_id - b.practice_menu_id,
  );
}

describe("PracticeRecordContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEntitlement();
    mockUpsert.mockResolvedValue({ ok: true, data: buildSession() });
  });

  describe("日付の切り替え", () => {
    it("日付を選ぶとその日の既存セッションを読み込んでフォームが差し替わる", async () => {
      mockGetByDate.mockResolvedValue({
        status: "ok",
        data: buildSession({
          practice_logs: [buildLog({ practice_menu_id: 1, amount: "300.0" })],
        }),
      });
      renderContent();

      expect(
        screen.getByRole("checkbox", { name: "素振り" }),
      ).not.toBeChecked();

      changeDate(YESTERDAY);

      await waitFor(() =>
        expect(mockGetByDate).toHaveBeenCalledWith(YESTERDAY),
      );
      expect(
        await screen.findByRole("checkbox", { name: "素振り" }),
      ).toBeChecked();
      expect(screen.getByLabelText("素振りの量")).toHaveValue(300);
    });

    it("記録が無い日（by_date が null）は空フォームを出しエラーにしない", async () => {
      mockGetByDate.mockResolvedValue({ status: "ok", data: null });
      renderContent({
        initialSession: buildSession({
          practice_logs: [buildLog({ practice_menu_id: 1 })],
        }),
      });

      changeDate(YESTERDAY);

      await waitFor(() => expect(mockGetByDate).toHaveBeenCalled());
      await waitFor(() =>
        expect(
          screen.getByRole("checkbox", { name: "素振り" }),
        ).not.toBeChecked(),
      );
      expect(screen.queryByRole("alert")).toBeNull();
      expect(
        screen.getByRole("button", { name: "練習記録のみ保存" }),
      ).toBeVisible();
    });

    it("読み込みに失敗した日は空フォームではなくエラーを出す", async () => {
      mockGetByDate.mockResolvedValue({ status: "error" });
      renderContent();

      changeDate(YESTERDAY);

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "この日の練習記録を読み込めませんでした",
      );
      expect(screen.queryByRole("checkbox", { name: "素振り" })).toBeNull();
    });

    it("未来日は選べない", async () => {
      renderContent();

      expect(screen.getByLabelText("日付")).toHaveAttribute("max", TODAY);

      changeDate(TOMORROW);

      await waitFor(() => expect(mockGetByDate).not.toHaveBeenCalled());
    });
  });

  describe("メニューの選択と量の入力", () => {
    it("選ぶとメニューの初期値（default_value）が入る", async () => {
      const user = userEvent.setup();
      renderContent();

      await user.click(screen.getByRole("checkbox", { name: "素振り" }));

      expect(screen.getByLabelText("素振りの量")).toHaveValue(200);
    });

    it("重さ×回数のメニューは kg と回の2入力になる", async () => {
      const user = userEvent.setup();
      renderContent();

      await user.click(screen.getByRole("checkbox", { name: "ベンチプレス" }));

      expect(screen.getByLabelText("ベンチプレスの重さ（kg）")).toBeVisible();
      expect(screen.getByLabelText("ベンチプレスの回数")).toHaveValue(10);
      expect(screen.getByText("kg ×")).toBeVisible();
    });

    it("重さ×回数以外のメニューは量の1入力だけになる", async () => {
      const user = userEvent.setup();
      renderContent();

      await user.click(screen.getByRole("checkbox", { name: "ランニング" }));

      expect(screen.getByLabelText("ランニングの量")).toBeVisible();
      expect(screen.queryByLabelText(/ランニングの重さ/)).toBeNull();
    });

    it("重さと回数を入力すると weight と amount に分けて送る", async () => {
      const user = userEvent.setup();
      renderContent();

      await user.click(screen.getByRole("checkbox", { name: "ベンチプレス" }));
      await user.type(screen.getByLabelText("ベンチプレスの重さ（kg）"), "60");
      await user.click(
        screen.getByRole("button", { name: "練習記録のみ保存" }),
      );

      await waitFor(() => expect(mockUpsert).toHaveBeenCalledTimes(1));
      expect(savedItems()).toEqual([
        { practice_menu_id: 2, amount: 10, weight: 60 },
      ]);
    });

    it("メニューを選ばずに保存しようとすると送信しない", async () => {
      const user = userEvent.setup();
      renderContent();

      await user.click(
        screen.getByRole("button", { name: "練習記録のみ保存" }),
      );

      expect(
        await screen.findByText(
          "記録する内容がありません。メニューを選んでください",
        ),
      ).toBeVisible();
      expect(mockUpsert).not.toHaveBeenCalled();
    });
  });

  describe("既存セッションの上書き保存", () => {
    it("触っていない項目も含めて全項目を送る", async () => {
      const user = userEvent.setup();
      renderContent({
        initialSession: buildSession({
          practice_logs: [
            buildLog({ id: 1, practice_menu_id: 1, amount: "300.0" }),
            buildLog({
              id: 2,
              practice_menu_id: 3,
              amount: "5.0",
              menu_name: "ランニング",
            }),
          ],
        }),
      });

      await user.clear(screen.getByLabelText("素振りの量"));
      await user.type(screen.getByLabelText("素振りの量"), "400");
      await user.click(
        screen.getByRole("button", { name: "練習記録の変更を保存" }),
      );

      await waitFor(() => expect(mockUpsert).toHaveBeenCalledTimes(1));
      expect(savedItems()).toEqual([
        { practice_menu_id: 1, amount: 400, weight: null },
        { practice_menu_id: 3, amount: 5, weight: null },
      ]);
    });

    it("一覧に出ないメニューの記録も送り返してログを消さない", async () => {
      const user = userEvent.setup();
      renderContent({
        initialSession: buildSession({
          practice_logs: [
            buildLog({ id: 1, practice_menu_id: 1, amount: "300.0" }),
            buildLog({
              id: 2,
              practice_menu_id: 99,
              amount: "20.0",
              menu_name: "削除済みメニュー",
            }),
          ],
        }),
      });

      await user.click(
        screen.getByRole("button", { name: "練習記録の変更を保存" }),
      );

      await waitFor(() => expect(mockUpsert).toHaveBeenCalledTimes(1));
      expect(savedItems()).toEqual([
        { practice_menu_id: 1, amount: 300, weight: null },
        { practice_menu_id: 99, amount: 20, weight: null },
      ]);
    });

    it("外したメニューは送らない", async () => {
      const user = userEvent.setup();
      renderContent({
        initialSession: buildSession({
          practice_logs: [
            buildLog({ id: 1, practice_menu_id: 1 }),
            buildLog({ id: 2, practice_menu_id: 3, amount: "5.0" }),
          ],
        }),
      });

      await user.click(screen.getByRole("checkbox", { name: "素振り" }));
      await user.click(
        screen.getByRole("button", { name: "練習記録の変更を保存" }),
      );

      await waitFor(() => expect(mockUpsert).toHaveBeenCalledTimes(1));
      expect(savedItems()).toEqual([
        { practice_menu_id: 3, amount: 5, weight: null },
      ]);
    });

    it("選んだ日付を logged_on として送る", async () => {
      const user = userEvent.setup();
      mockGetByDate.mockResolvedValue({ status: "ok", data: null });
      renderContent();

      changeDate(YESTERDAY);
      await waitFor(() => expect(mockGetByDate).toHaveBeenCalled());

      await user.click(await screen.findByRole("checkbox", { name: "素振り" }));
      await user.click(
        screen.getByRole("button", { name: "練習記録のみ保存" }),
      );

      await waitFor(() => expect(mockUpsert).toHaveBeenCalledTimes(1));
      expect(mockUpsert.mock.calls[0][0].logged_on).toBe(YESTERDAY);
    });
  });

  describe("プリセットメニュー", () => {
    const presetMenus = [{ practice_menu_id: 1, target_value: 150 }];

    it("プリセットで指定されたメニューを目標量つきで選択済みにする", () => {
      renderContent({ presetMenus });

      expect(screen.getByRole("checkbox", { name: "素振り" })).toBeChecked();
      expect(screen.getByLabelText("素振りの量")).toHaveValue(150);
    });

    it("日付を変えるとプリセットは無効になる", async () => {
      mockGetByDate.mockResolvedValue({ status: "ok", data: null });
      renderContent({ presetMenus });

      changeDate(YESTERDAY);

      await waitFor(() => expect(mockGetByDate).toHaveBeenCalled());
      await waitFor(() =>
        expect(
          screen.getByRole("checkbox", { name: "素振り" }),
        ).not.toBeChecked(),
      );
    });
  });

  describe("メニューが1件も無いとき", () => {
    it("空状態とメニュー作成の導線を出す", () => {
      renderContent({ menus: [] });

      expect(screen.getByText("まだ練習メニューがありません")).toBeVisible();
      expect(
        screen.getByRole("link", { name: "最初のメニューを作る" }),
      ).toHaveAttribute("href", "/practice/menus");
      expect(screen.queryByRole("checkbox")).toBeNull();
    });
  });

  describe("取り組む課題の紐付け", () => {
    it("選んだ課題を紐付けて保存する", async () => {
      const user = userEvent.setup();
      renderContent({ themes: [buildTheme({ id: 7, title: "内角の対応" })] });

      await user.click(screen.getByRole("checkbox", { name: "素振り" }));
      await user.click(screen.getByRole("button", { name: "内角の対応" }));
      await user.click(
        screen.getByRole("button", { name: "練習記録のみ保存" }),
      );

      await waitFor(() => expect(mockUpsert).toHaveBeenCalledTimes(1));
      expect(mockUpsert.mock.calls[0][0].improvement_theme_ids).toEqual([7]);
    });

    it("無料プランで2件目を選ぼうとするとペイウォールを出して選択しない", async () => {
      const user = userEvent.setup();
      renderContent({
        themes: [
          buildTheme({ id: 7, title: "内角の対応" }),
          buildTheme({ id: 8, title: "初球打ち" }),
        ],
      });

      await user.click(screen.getByRole("button", { name: "内角の対応" }));
      await user.click(screen.getByRole("button", { name: "初球打ち" }));

      expect(mockOpenProUpgradeModal).toHaveBeenCalledWith({
        trigger: "multi_improvement_theme_links",
      });
      expect(screen.getByRole("button", { name: "初球打ち" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });

    it("Pro プランなら複数の課題を紐付けられる", async () => {
      const user = userEvent.setup();
      mockEntitlement({ granted: true });
      renderContent({
        themes: [
          buildTheme({ id: 7, title: "内角の対応" }),
          buildTheme({ id: 8, title: "初球打ち" }),
        ],
      });

      await user.click(screen.getByRole("button", { name: "内角の対応" }));
      await user.click(screen.getByRole("button", { name: "初球打ち" }));

      expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
      expect(screen.getByRole("button", { name: "初球打ち" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    it("既に複数紐付いている記録は無料プランでもそのまま維持できる", async () => {
      const user = userEvent.setup();
      renderContent({
        themes: [
          buildTheme({ id: 7, title: "内角の対応" }),
          buildTheme({ id: 8, title: "初球打ち" }),
        ],
        initialSession: buildSession({
          improvement_theme_ids: [7, 8],
          practice_logs: [buildLog({ practice_menu_id: 1 })],
        }),
      });

      await user.click(
        screen.getByRole("button", { name: "練習記録の変更を保存" }),
      );

      await waitFor(() => expect(mockUpsert).toHaveBeenCalledTimes(1));
      expect(mockUpsert.mock.calls[0][0].improvement_theme_ids).toEqual([7, 8]);
      expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
    });
  });

  describe("野球ノートを書く", () => {
    it("保存後に日付・セッション ID・課題を引き継いでノート作成画面へ進む", async () => {
      const user = userEvent.setup();
      mockUpsert.mockResolvedValue({
        ok: true,
        data: buildSession({ id: 42, logged_on: TODAY }),
      });
      renderContent({ themes: [buildTheme({ id: 7, title: "内角の対応" })] });

      await user.click(screen.getByRole("checkbox", { name: "素振り" }));
      await user.click(screen.getByRole("button", { name: "内角の対応" }));
      await user.click(
        screen.getByRole("button", { name: "野球ノートを書く" }),
      );

      await waitFor(() => expect(mockPush).toHaveBeenCalledTimes(1));
      expect(mockPush).toHaveBeenCalledWith(
        `/note/new?date=${TODAY}&practiceSessionId=42&improvementThemeIds=7`,
      );
    });

    it("課題が未選択ならノートへは引き継がない", async () => {
      const user = userEvent.setup();
      mockUpsert.mockResolvedValue({
        ok: true,
        data: buildSession({ id: 42, logged_on: TODAY }),
      });
      renderContent();

      await user.click(screen.getByRole("checkbox", { name: "素振り" }));
      await user.click(
        screen.getByRole("button", { name: "野球ノートを書く" }),
      );

      await waitFor(() => expect(mockPush).toHaveBeenCalledTimes(1));
      expect(mockPush).toHaveBeenCalledWith(
        `/note/new?date=${TODAY}&practiceSessionId=42`,
      );
    });

    it("練習記録のみ保存ではノート作成画面へ遷移しない", async () => {
      const user = userEvent.setup();
      renderContent();

      await user.click(screen.getByRole("checkbox", { name: "素振り" }));
      await user.click(
        screen.getByRole("button", { name: "練習記録のみ保存" }),
      );

      await waitFor(() => expect(mockUpsert).toHaveBeenCalledTimes(1));
      expect(mockPush).not.toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("練習記録を保存しました");
    });
  });

  describe("保存の失敗", () => {
    it("403 のときは保存できたように見せず、課題の上限としてペイウォールを出す", async () => {
      const user = userEvent.setup();
      mockEntitlement({ granted: true });
      mockUpsert.mockResolvedValue({
        ok: false,
        reason: "forbidden",
        errors: ["複数の課題への紐付けは Pro プラン限定です"],
      });
      renderContent({
        themes: [
          buildTheme({ id: 7, title: "内角の対応" }),
          buildTheme({ id: 8, title: "初球打ち" }),
        ],
      });

      await user.click(screen.getByRole("checkbox", { name: "素振り" }));
      await user.click(screen.getByRole("button", { name: "内角の対応" }));
      await user.click(screen.getByRole("button", { name: "初球打ち" }));
      await user.click(
        screen.getByRole("button", { name: "野球ノートを書く" }),
      );

      expect(
        await screen.findByText("複数の課題への紐付けは Pro プラン限定です"),
      ).toBeVisible();
      expect(mockPush).not.toHaveBeenCalled();
      expect(toast.success).not.toHaveBeenCalled();
      expect(mockOpenProUpgradeModal).toHaveBeenCalledWith({
        trigger: "multi_improvement_theme_links",
      });
    });

    it("課題を複数送っていない 403 ではペイウォールを出さずサーバーの文言を出す", async () => {
      const user = userEvent.setup();
      mockUpsert.mockResolvedValue({
        ok: false,
        reason: "forbidden",
        errors: ["コンディション記録は Pro プラン限定です"],
      });
      renderContent();

      await user.click(screen.getByRole("checkbox", { name: "素振り" }));
      await user.click(
        screen.getByRole("button", { name: "野球ノートを書く" }),
      );

      expect(
        await screen.findByText("コンディション記録は Pro プラン限定です"),
      ).toBeVisible();
      expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("保存に失敗したらエラーを出して遷移も成功表示もしない", async () => {
      const user = userEvent.setup();
      mockUpsert.mockResolvedValue({
        ok: false,
        reason: "error",
        errors: ["練習記録の保存に失敗しました"],
      });
      renderContent();

      await user.click(screen.getByRole("checkbox", { name: "素振り" }));
      await user.click(
        screen.getByRole("button", { name: "野球ノートを書く" }),
      );

      expect(
        await screen.findByText("練習記録の保存に失敗しました"),
      ).toBeVisible();
      expect(mockPush).not.toHaveBeenCalled();
      expect(toast.success).not.toHaveBeenCalled();
      expect(
        screen.getByRole("button", { name: "野球ノートを書く" }),
      ).toBeEnabled();
    });
  });
});
