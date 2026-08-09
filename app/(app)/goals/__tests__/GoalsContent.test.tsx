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

jest.mock("@app/services/v2/goalService", () => ({
  createGoal: jest.fn(),
  updateGoal: jest.fn(),
  deleteGoal: jest.fn(),
  achieveGoal: jest.fn(),
  unachieveGoal: jest.fn(),
}));

import type { Goal } from "@app/types/goal";
import type { Feature } from "@app/types/pro";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import {
  achieveGoal,
  createGoal,
  deleteGoal,
  unachieveGoal,
  updateGoal,
} from "@app/services/v2/goalService";
import GoalsContent from "../_components/GoalsContent";

const mockUseEntitlement = useEntitlement as jest.MockedFunction<
  typeof useEntitlement
>;
const mockCreate = createGoal as jest.MockedFunction<typeof createGoal>;
const mockUpdate = updateGoal as jest.MockedFunction<typeof updateGoal>;
const mockDelete = deleteGoal as jest.MockedFunction<typeof deleteGoal>;
const mockAchieve = achieveGoal as jest.MockedFunction<typeof achieveGoal>;
const mockUnachieve = unachieveGoal as jest.MockedFunction<
  typeof unachieveGoal
>;

function buildGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 1,
    title: "月20日練習",
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
    current_value: 5,
    progress_percent: 25,
    days_remaining: 28,
    ...overrides,
  };
}

function mockEntitlement({
  features = [] as Feature[],
  isLoading = false,
}: { features?: Feature[]; isLoading?: boolean } = {}) {
  mockUseEntitlement.mockReturnValue({
    isPro: features.length > 0,
    inTrial: false,
    inGracePeriod: false,
    isLoading,
    hasEntitlement: jest.fn((feature: Feature) => features.includes(feature)),
  });
}

function renderContent(
  props: Partial<Parameters<typeof GoalsContent>[0]> = {},
) {
  return render(
    <GoalsContent
      initialGoals={[]}
      initialHistory={[]}
      historyLoadFailed={false}
      seasons={[{ id: 11, name: "2026年" }]}
      tournaments={[{ id: 21, name: "夏の大会" }]}
      menus={[
        {
          id: 31,
          name: "素振り",
          category: "batting",
          unit: "count",
          unit_label: "本",
          default_value: "200.0",
          is_favorite: false,
          sort_order: 1,
        },
      ]}
      {...props}
    />,
  );
}

async function openCreateForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "新しい目標を追加" }));
}

async function openEditForm(
  user: ReturnType<typeof userEvent.setup>,
  title: string,
) {
  await user.click(screen.getByRole("button", { name: `${title}の詳細` }));
  await user.click(screen.getByRole("button", { name: "編集" }));
  return screen.findByRole("dialog", { name: "目標を編集" });
}

describe("GoalsContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEntitlement();
  });

  describe("達成バッジへの導線", () => {
    it("バッジ一覧へのリンクを出す", () => {
      renderContent();

      expect(screen.getByRole("link", { name: "達成バッジ" })).toHaveAttribute(
        "href",
        "/goals/badges",
      );
    });
  });

  describe("3タブの分類", () => {
    const activeGoals = [
      buildGoal({ id: 1, title: "進行中の目標" }),
      buildGoal({
        id: 2,
        title: "手動達成した目標",
        kind: "qualitative",
        is_achieved: true,
      }),
    ];
    const historyGoals = [
      buildGoal({
        id: 3,
        title: "達成して確定した目標",
        is_finalized: true,
        is_achieved: true,
      }),
      buildGoal({ id: 4, title: "未達で確定した目標", is_finalized: true }),
    ];

    it("進行中タブには未達成・未確定の目標だけを出す", () => {
      renderContent({
        initialGoals: activeGoals,
        initialHistory: historyGoals,
      });

      expect(screen.getByText("進行中の目標")).toBeVisible();
      expect(screen.queryByText("手動達成した目標")).toBeNull();
      expect(screen.queryByText("未達で確定した目標")).toBeNull();
    });

    it("達成タブには確定前に手動達成したものも含める", async () => {
      const user = userEvent.setup();
      renderContent({
        initialGoals: activeGoals,
        initialHistory: historyGoals,
      });

      await user.click(screen.getByRole("tab", { name: /達成/ }));

      expect(screen.getByText("手動達成した目標")).toBeVisible();
      expect(screen.getByText("達成して確定した目標")).toBeVisible();
      expect(screen.queryByText("未達で確定した目標")).toBeNull();
    });

    it("未達タブには未達成のまま確定したものだけを出す", async () => {
      const user = userEvent.setup();
      renderContent({
        initialGoals: activeGoals,
        initialHistory: historyGoals,
      });

      await user.click(screen.getByRole("tab", { name: /未達/ }));

      expect(screen.getByText("未達で確定した目標")).toBeVisible();
      expect(screen.queryByText("進行中の目標")).toBeNull();
      expect(screen.queryByText("達成して確定した目標")).toBeNull();
    });

    it("タブの件数バッジが分類と一致する", () => {
      renderContent({
        initialGoals: activeGoals,
        initialHistory: historyGoals,
      });

      expect(screen.getByRole("tab", { name: "進行中 1" })).toBeVisible();
      expect(screen.getByRole("tab", { name: "達成 2" })).toBeVisible();
      expect(screen.getByRole("tab", { name: "未達 1" })).toBeVisible();
    });

    it("期間タイプごとに見出しを付けて並べる", () => {
      renderContent({
        initialGoals: [
          buildGoal({ id: 1, title: "月次の目標", period_type: "monthly" }),
          buildGoal({ id: 2, title: "週次の目標", period_type: "weekly" }),
        ],
      });

      const weekly = screen.getByRole("region", { name: "週次" });
      expect(within(weekly).getByText("週次の目標")).toBeVisible();
      const monthly = screen.getByRole("region", { name: "月次" });
      expect(within(monthly).getByText("月次の目標")).toBeVisible();
    });
  });

  describe("進捗バー", () => {
    it("back の進捗率をバーの幅として反映する", () => {
      renderContent({
        initialGoals: [buildGoal({ progress_percent: 42.5 })],
      });

      const bar = screen.getByRole("progressbar", { name: "月20日練習の進捗" });
      expect(bar).toHaveAttribute("aria-valuenow", "42.5");
      expect(bar.firstChild).toHaveStyle({ width: "42.5%" });
      expect(screen.getByText("43%")).toBeVisible();
    });

    it("進捗率が 100 を超えてもバーは 100% で止める", () => {
      renderContent({
        initialGoals: [buildGoal({ progress_percent: 150 })],
      });

      const bar = screen.getByRole("progressbar", { name: "月20日練習の進捗" });
      expect(bar.firstChild).toHaveStyle({ width: "100%" });
    });

    it("現在値と目標値をこの順で表示する", () => {
      renderContent({
        initialGoals: [buildGoal({ current_value: 5, target_value: 20 })],
      });

      const card = screen.getByRole("button", { name: "月20日練習の詳細" });
      expect(card.textContent).toContain("現在5→目標20");
    });

    it("以下条件の指標は目標値に「以下」を添える", () => {
      renderContent({
        initialGoals: [
          buildGoal({
            metric_key: "era",
            comparison_type: "less_than",
            current_value: 3.2,
            target_value: 2.5,
          }),
        ],
      });

      expect(screen.getByText("2.50 以下")).toBeVisible();
      expect(screen.getByText("3.20")).toBeVisible();
    });

    it("back が数値を文字列で返しても整形して表示する", () => {
      renderContent({
        initialGoals: [
          buildGoal({
            metric_key: "batting_average",
            current_value: "0.28",
            target_value: "0.3",
          }),
        ],
      });

      expect(screen.getByText(".280")).toBeVisible();
      expect(screen.getByText(".300")).toBeVisible();
    });

    it("定性目標は進捗バーではなく達成状態のチップを出す", () => {
      renderContent({
        initialGoals: [
          buildGoal({ kind: "qualitative", title: "大会で優勝する" }),
        ],
      });

      expect(screen.queryByRole("progressbar")).toBeNull();
      expect(screen.getByText("未達成")).toBeVisible();
    });
  });

  describe("達成トグル", () => {
    it("数値目標には達成トグルを出さない（back が 422 を返すため）", () => {
      renderContent({ initialGoals: [buildGoal({ kind: "numeric" })] });

      expect(screen.queryByRole("button", { name: /達成にする/ })).toBeNull();
    });

    it("自由指標にも達成トグルを出さない", () => {
      renderContent({
        initialGoals: [
          buildGoal({
            kind: "manual",
            custom_metric_label: "球速",
            title: "球速アップ",
          }),
        ],
      });

      expect(screen.queryByRole("button", { name: /達成にする/ })).toBeNull();
    });

    it("確定済みの定性目標には達成トグルを出さない", async () => {
      const user = userEvent.setup();
      renderContent({
        initialHistory: [
          buildGoal({
            kind: "qualitative",
            title: "去年の目標",
            is_finalized: true,
          }),
        ],
      });

      await user.click(screen.getByRole("tab", { name: /未達/ }));

      expect(screen.queryByRole("button", { name: /達成にする/ })).toBeNull();
    });

    it("定性目標の達成トグルで達成にできる", async () => {
      const user = userEvent.setup();
      const goal = buildGoal({ kind: "qualitative", title: "大会で優勝する" });
      mockAchieve.mockResolvedValue({
        ok: true,
        data: { ...goal, is_achieved: true, progress_percent: 100 },
      });
      renderContent({ initialGoals: [goal] });

      await user.click(
        screen.getByRole("button", { name: "大会で優勝するを達成にする" }),
      );

      await waitFor(() => expect(mockAchieve).toHaveBeenCalledWith(1));
      expect(mockUnachieve).not.toHaveBeenCalled();
      // 達成済みになったので進行中タブから消え、達成タブへ移る。
      expect(await screen.findByRole("tab", { name: "達成 1" })).toBeVisible();
      expect(screen.getByRole("tab", { name: "進行中 0" })).toBeVisible();
    });

    it("達成済みの定性目標はトグルで取り消せる", async () => {
      const user = userEvent.setup();
      const goal = buildGoal({
        kind: "qualitative",
        title: "大会で優勝する",
        is_achieved: true,
      });
      mockUnachieve.mockResolvedValue({
        ok: true,
        data: { ...goal, is_achieved: false, progress_percent: 0 },
      });
      renderContent({ initialGoals: [goal] });

      await user.click(screen.getByRole("tab", { name: /達成/ }));
      await user.click(
        screen.getByRole("button", { name: "大会で優勝するの達成を取り消す" }),
      );

      await waitFor(() => expect(mockUnachieve).toHaveBeenCalledWith(1));
      expect(mockAchieve).not.toHaveBeenCalled();
    });
  });

  describe("編集（変更不可属性の固定）", () => {
    const editableGoal = buildGoal({
      id: 5,
      title: "月20日練習",
      metric_key: "practice_days",
      target_value: 20,
    });

    it("種類・期間・指標・条件の選択肢をすべて操作不能にする", async () => {
      const user = userEvent.setup();
      renderContent({ initialGoals: [editableGoal] });

      await openEditForm(user, "月20日練習");

      expect(screen.getByRole("button", { name: "数値目標" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "達成目標" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "自由指標" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "月次" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "シーズン" })).toBeDisabled();
      expect(
        screen.getByRole("button", { name: "カスタム期間" }),
      ).toBeDisabled();
      expect(screen.getByRole("button", { name: "練習日数" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "防御率" })).toBeDisabled();
    });

    it("変更できない理由を画面で伝える", async () => {
      const user = userEvent.setup();
      renderContent({ initialGoals: [editableGoal] });

      await openEditForm(user, "月20日練習");

      expect(
        screen.getByText(
          "目標タイプ・期間・指標・条件は作成後に変更できません。変更したい場合は削除して作り直してください。",
        ),
      ).toBeInTheDocument();
    });

    it("更新では変更不可の属性を一切送らない", async () => {
      const user = userEvent.setup();
      mockUpdate.mockResolvedValue({
        ok: true,
        data: { ...editableGoal, target_value: 25 },
      });
      renderContent({ initialGoals: [editableGoal] });

      await openEditForm(user, "月20日練習");
      await user.clear(screen.getByLabelText(/目標値/));
      await user.type(screen.getByLabelText(/目標値/), "25");
      await user.click(screen.getByRole("button", { name: "更新" }));

      await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
      const [id, payload] = mockUpdate.mock.calls[0];
      expect(id).toBe(5);
      expect(payload).toEqual({
        title: "月20日練習",
        month_start: "2026-08-01",
        deadline: "2026-08-31",
        target_value: 25,
      });
      [
        "kind",
        "period_type",
        "season_id",
        "tournament_id",
        "metric_key",
        "comparison_type",
        "practice_menu_id",
      ].forEach((key) => expect(payload).not.toHaveProperty(key));
    });

    it("シーズン目標の編集ではシーズンの選択肢も操作不能にする", async () => {
      const user = userEvent.setup();
      mockEntitlement({ features: ["season_goals"] });
      renderContent({
        initialGoals: [
          buildGoal({
            id: 6,
            title: "シーズン打率3割",
            period_type: "season",
            season_id: 11,
            month_start: null,
            metric_key: "batting_average",
            target_value: 0.3,
          }),
        ],
      });

      await openEditForm(user, "シーズン打率3割");

      expect(screen.getByRole("button", { name: "2026年" })).toBeDisabled();
    });

    it("自由指標の編集では条件（以上・以下）も操作不能にする", async () => {
      const user = userEvent.setup();
      mockEntitlement({ features: ["manual_metric_goals"] });
      renderContent({
        initialGoals: [
          buildGoal({
            id: 7,
            title: "球速アップ",
            kind: "manual",
            metric_key: null,
            custom_metric_label: "球速",
            custom_unit: "km/h",
            target_value: 130,
            manual_current_value: 125,
          }),
        ],
      });

      await openEditForm(user, "球速アップ");

      expect(screen.getByRole("button", { name: "以上" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "以下" })).toBeDisabled();
    });

    it("確定済みの目標は詳細から編集できない", async () => {
      const user = userEvent.setup();
      renderContent({
        initialHistory: [
          buildGoal({ id: 8, title: "去年の目標", is_finalized: true }),
        ],
      });

      await user.click(screen.getByRole("tab", { name: /未達/ }));
      await user.click(
        screen.getByRole("button", { name: "去年の目標の詳細" }),
      );

      expect(screen.queryByRole("button", { name: "編集" })).toBeNull();
    });
  });

  describe("作成フォームの出し分け", () => {
    it("数値目標では指標と目標値を出し、指標名・現在値は出さない", async () => {
      const user = userEvent.setup();
      renderContent();

      await openCreateForm(user);

      expect(screen.getByRole("group", { name: "打撃" })).toBeInTheDocument();
      expect(screen.getByLabelText(/目標値/)).toBeInTheDocument();
      expect(screen.queryByLabelText(/指標名/)).toBeNull();
      expect(screen.queryByLabelText(/現在値/)).toBeNull();
    });

    it("定性目標では指標も目標値も出さない", async () => {
      const user = userEvent.setup();
      renderContent();

      await openCreateForm(user);
      await user.click(screen.getByRole("button", { name: "達成目標" }));

      expect(screen.queryByRole("group", { name: "打撃" })).toBeNull();
      expect(screen.queryByLabelText(/目標値/)).toBeNull();
      expect(screen.getByLabelText("目標")).toBeInTheDocument();
    });

    it("自由指標では指標名・単位・条件・現在値を出し、指標カテゴリは出さない", async () => {
      const user = userEvent.setup();
      mockEntitlement({ features: ["manual_metric_goals"] });
      renderContent();

      await openCreateForm(user);
      await user.click(screen.getByRole("button", { name: "自由指標" }));

      expect(screen.getByLabelText(/指標名/)).toBeInTheDocument();
      expect(screen.getByLabelText(/単位/)).toBeInTheDocument();
      expect(screen.getByRole("group", { name: "条件" })).toBeInTheDocument();
      expect(screen.getByLabelText(/現在値/)).toBeInTheDocument();
      expect(screen.queryByRole("group", { name: "打撃" })).toBeNull();
    });

    it("メニュー継続日数を選ぶと対象メニューの選択欄が出る", async () => {
      const user = userEvent.setup();
      renderContent();

      await openCreateForm(user);
      expect(
        screen.queryByRole("group", { name: "対象の練習メニュー" }),
      ).toBeNull();

      await user.click(
        screen.getByRole("button", { name: "メニュー継続日数" }),
      );

      const group = screen.getByRole("group", { name: "対象の練習メニュー" });
      expect(
        within(group).getByRole("button", { name: "素振り" }),
      ).toBeInTheDocument();
    });

    it("週次・月次・年間は期間が自動設定であることを伝え、日付入力を出さない", async () => {
      const user = userEvent.setup();
      renderContent();

      await openCreateForm(user);

      expect(
        screen.getByText("対象期間: 今月（自動設定）"),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText(/期限/)).toBeNull();

      await user.click(screen.getByRole("button", { name: "週次" }));
      expect(
        screen.getByText("対象期間: 今週 月〜日（自動設定）"),
      ).toBeInTheDocument();
    });

    it("カスタム期間では開始日と期限を入力させる", async () => {
      const user = userEvent.setup();
      mockEntitlement({ features: ["custom_period_goals"] });
      renderContent();

      await openCreateForm(user);
      await user.click(screen.getByRole("button", { name: "カスタム期間" }));

      expect(screen.getByLabelText(/開始日/)).toBeInTheDocument();
      expect(screen.getByLabelText(/期限/)).toBeInTheDocument();
    });

    it("シーズン・大会では対象の選択欄と期限を出す", async () => {
      const user = userEvent.setup();
      mockEntitlement({ features: ["season_goals", "tournament_goals"] });
      renderContent();

      await openCreateForm(user);
      await user.click(screen.getByRole("button", { name: "シーズン" }));
      expect(
        screen.getByRole("group", { name: "シーズン" }),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText(/開始日/)).toBeNull();

      await user.click(screen.getByRole("button", { name: "大会" }));
      expect(screen.getByRole("group", { name: "大会" })).toBeInTheDocument();
      expect(screen.getByLabelText(/期限/)).toBeInTheDocument();
    });

    it("数値目標の達成条件は指標に応じて表示する", async () => {
      const user = userEvent.setup();
      renderContent();

      await openCreateForm(user);
      expect(screen.getByText("条件: 以上")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "防御率" }));
      expect(screen.getByText("条件: 以下")).toBeInTheDocument();
    });

    it("自由指標で「以下」を選ぶと less_than を送る", async () => {
      const user = userEvent.setup();
      mockEntitlement({ features: ["manual_metric_goals"] });
      mockCreate.mockResolvedValue({ ok: true, data: buildGoal({ id: 9 }) });
      renderContent();

      await openCreateForm(user);
      await user.click(screen.getByRole("button", { name: "自由指標" }));
      await user.type(screen.getByLabelText(/指標名/), "体重");
      await user.click(screen.getByRole("button", { name: "以下" }));
      await user.type(screen.getByLabelText(/目標値/), "70");
      await user.click(screen.getByRole("button", { name: "保存" }));

      await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
      expect(mockCreate.mock.calls[0][0]).toMatchObject({
        kind: "manual",
        custom_metric_label: "体重",
        target_value: 70,
        comparison_type: "less_than",
      });
    });

    it("必須項目が未入力なら送信せずエラーを出す", async () => {
      const user = userEvent.setup();
      renderContent();

      await openCreateForm(user);
      await user.click(screen.getByRole("button", { name: "保存" }));

      expect(
        await screen.findByText("目標値を入力してください"),
      ).toBeInTheDocument();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("入力した内容で作成できる", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({
        ok: true,
        data: buildGoal({ id: 9, title: "今月20日練習" }),
      });
      renderContent();

      await openCreateForm(user);
      await user.type(screen.getByLabelText(/目標値/), "20");
      await user.type(screen.getByLabelText(/タイトル/), "今月20日練習");
      await user.click(screen.getByRole("button", { name: "保存" }));

      await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
      expect(mockCreate).toHaveBeenCalledWith({
        title: "今月20日練習",
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
      });
      expect(await screen.findByText("今月20日練習")).toBeVisible();
    });
  });

  describe("Pro ゲート", () => {
    it.each([
      ["シーズン", "season_goals", "シーズン目標を設定"],
      ["大会", "tournament_goals", "大会目標を設定"],
      ["カスタム期間", "custom_period_goals", "カスタム期間で目標を設定"],
    ] as const)(
      "%s は無料だと訴求を出して保存させない",
      async (chipLabel, feature, upsellTitle) => {
        const user = userEvent.setup();
        renderContent();

        await openCreateForm(user);
        await user.click(screen.getByRole("button", { name: chipLabel }));

        expect(screen.getByText(upsellTitle)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();

        mockEntitlement({ features: [feature] });
      },
    );

    it("自由指標は無料だと訴求を出して保存させない", async () => {
      const user = userEvent.setup();
      renderContent();

      await openCreateForm(user);
      await user.click(screen.getByRole("button", { name: "自由指標" }));

      expect(screen.getByText("自由指標で目標を設定")).toBeInTheDocument();
      expect(screen.queryByLabelText(/指標名/)).toBeNull();
      expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
    });

    it.each([
      ["シーズン", "season_goals"],
      ["大会", "tournament_goals"],
      ["カスタム期間", "custom_period_goals"],
    ] as const)(
      "%s は対応する entitlement があれば訴求を出さない",
      async (chipLabel, feature) => {
        const user = userEvent.setup();
        mockEntitlement({ features: [feature] });
        renderContent();

        await openCreateForm(user);
        await user.click(screen.getByRole("button", { name: chipLabel }));

        expect(screen.queryByText(/Pro プランを見る/)).toBeNull();
      },
    );

    it("別の Pro 機能の entitlement では解放されない", async () => {
      const user = userEvent.setup();
      mockEntitlement({ features: ["season_goals"] });
      renderContent();

      await openCreateForm(user);
      await user.click(screen.getByRole("button", { name: "大会" }));

      expect(screen.getByText("大会目標を設定")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
    });

    it("Pro 判定が未確定の間は追加ボタン自体を押せなくする", () => {
      mockEntitlement({ isLoading: true });
      renderContent();

      expect(
        screen.getByRole("button", { name: "新しい目標を追加" }),
      ).toBeDisabled();
    });

    it("作成が 403 になったら back の文言を出して該当機能のペイウォールを開く", async () => {
      const user = userEvent.setup();
      mockEntitlement({ features: ["season_goals"] });
      mockCreate.mockResolvedValue({
        ok: false,
        reason: "forbidden",
        errors: ["シーズン目標は Pro プラン限定です"],
      });
      renderContent();

      await openCreateForm(user);
      await user.click(screen.getByRole("button", { name: "シーズン" }));
      await user.click(screen.getByRole("button", { name: "2026年" }));
      await user.type(screen.getByLabelText(/目標値/), "0.3");
      await user.click(screen.getByRole("button", { name: "保存" }));

      expect(
        await screen.findByText("シーズン目標は Pro プラン限定です"),
      ).toBeInTheDocument();
      expect(mockOpenProUpgradeModal).toHaveBeenCalledWith({
        trigger: "season_goals",
      });
    });
  });

  describe("無料枠の上限", () => {
    const twoPersonalGoals = [
      buildGoal({ id: 1, title: "月次目標", period_type: "monthly" }),
      buildGoal({ id: 2, title: "週次目標", period_type: "weekly" }),
    ];

    it("無料で3件目を作ろうとするとフォームではなくペイウォールが出る", async () => {
      const user = userEvent.setup();
      renderContent({ initialGoals: twoPersonalGoals });

      await openCreateForm(user);

      expect(mockOpenProUpgradeModal).toHaveBeenCalledWith({
        trigger: "unlimited_monthly_goals",
      });
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("上限に達すると Pro 限定ではなく件数上限として案内する", () => {
      renderContent({ initialGoals: twoPersonalGoals });

      expect(
        screen.getByText("無料プランで同時に設定できる目標は2件までです"),
      ).toBeVisible();
    });

    it("シーズン・大会目標は無料枠を消費しない", () => {
      renderContent({
        initialGoals: [
          buildGoal({ id: 1, period_type: "season" }),
          buildGoal({ id: 2, period_type: "tournament" }),
          buildGoal({ id: 3, period_type: "monthly" }),
        ],
      });

      expect(
        screen.queryByText("無料プランで同時に設定できる目標は2件までです"),
      ).toBeNull();
    });

    it("確定済みの目標は無料枠を消費しない", () => {
      renderContent({
        initialGoals: [buildGoal({ id: 1, period_type: "monthly" })],
        initialHistory: [
          buildGoal({ id: 2, period_type: "monthly", is_finalized: true }),
          buildGoal({ id: 3, period_type: "weekly", is_finalized: true }),
        ],
      });

      expect(
        screen.queryByText("無料プランで同時に設定できる目標は2件までです"),
      ).toBeNull();
    });

    it("Pro なら3件目以降も作成フォームを開ける", async () => {
      const user = userEvent.setup();
      mockEntitlement({ features: ["unlimited_monthly_goals"] });
      renderContent({ initialGoals: twoPersonalGoals });

      await openCreateForm(user);

      expect(
        screen.getByRole("dialog", { name: "新しい目標" }),
      ).toBeInTheDocument();
      expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
    });

    it("Pro 判定が未確定の間は上限の案内を出さない", () => {
      mockEntitlement({ isLoading: true });
      renderContent({ initialGoals: twoPersonalGoals });

      expect(
        screen.queryByText("無料プランで同時に設定できる目標は2件までです"),
      ).toBeNull();
    });

    it("上限を超えて保有していても既存目標は編集・削除できる（グランドファザリング）", async () => {
      const user = userEvent.setup();
      mockUpdate.mockResolvedValue({
        ok: true,
        data: buildGoal({ id: 1, title: "月次目標" }),
      });
      renderContent({
        initialGoals: [
          ...twoPersonalGoals,
          buildGoal({ id: 3, title: "年間目標", period_type: "yearly" }),
          buildGoal({ id: 4, title: "カスタム目標", period_type: "custom" }),
        ],
      });

      const dialog = await openEditForm(user, "月次目標");

      expect(dialog).toBeInTheDocument();
      expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();

      await user.click(screen.getByRole("button", { name: "更新" }));
      await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
    });

    it("作成が 403 になったら件数上限として案内する", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({
        ok: false,
        reason: "forbidden",
        errors: ["Pro プランで期間目標を無制限に設定できます"],
      });
      renderContent();

      await openCreateForm(user);
      await user.type(screen.getByLabelText(/目標値/), "20");
      await user.click(screen.getByRole("button", { name: "保存" }));

      expect(
        await screen.findByText(
          /無料プランで同時に設定できる目標は2件までです。/,
        ),
      ).toBeInTheDocument();
      expect(mockOpenProUpgradeModal).toHaveBeenCalledWith({
        trigger: "unlimited_monthly_goals",
      });
    });
  });

  describe("詳細・削除", () => {
    it("詳細で進捗・残り日数・期限を出す", async () => {
      const user = userEvent.setup();
      renderContent({
        initialGoals: [buildGoal({ progress_percent: 25, days_remaining: 28 })],
      });

      await user.click(
        screen.getByRole("button", { name: "月20日練習の詳細" }),
      );

      const dialog = screen.getByRole("dialog", { name: "目標の詳細" });
      // 進捗率はバーと数値サマリーの2箇所に出る。
      expect(within(dialog).getAllByText("25%")).toHaveLength(2);
      expect(within(dialog).getByText("28日")).toBeInTheDocument();
      expect(within(dialog).getByText("2026/8/31")).toBeInTheDocument();
    });

    it("確認を経てから削除する", async () => {
      const user = userEvent.setup();
      mockDelete.mockResolvedValue({
        ok: true,
        data: { message: "削除しました" },
      });
      renderContent({ initialGoals: [buildGoal({ id: 3 })] });

      await user.click(
        screen.getByRole("button", { name: "月20日練習の詳細" }),
      );
      await user.click(screen.getByRole("button", { name: "削除" }));

      expect(
        screen.getByText("「月20日練習」を削除しますか？"),
      ).toBeInTheDocument();
      expect(mockDelete).not.toHaveBeenCalled();

      await user.click(
        within(screen.getByRole("dialog", { name: "目標の削除" })).getByRole(
          "button",
          { name: "削除" },
        ),
      );

      await waitFor(() => expect(mockDelete).toHaveBeenCalledWith(3));
      await waitFor(() => expect(screen.queryByText("月20日練習")).toBeNull());
    });
  });

  describe("取得失敗", () => {
    it("履歴の取得に失敗したら未達0件と誤認させない", () => {
      renderContent({ historyLoadFailed: true });

      expect(
        screen.getByText(
          "達成・未達の履歴を取得できませんでした。進行中の目標のみ表示しています。",
        ),
      ).toBeVisible();
    });
  });
});
