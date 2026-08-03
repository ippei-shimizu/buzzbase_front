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

jest.mock("@app/services/v2/practiceMenuService", () => ({
  createPracticeMenu: jest.fn(),
  updatePracticeMenu: jest.fn(),
  deletePracticeMenu: jest.fn(),
}));

import type { PracticeMenu } from "@app/types/practice";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import {
  createPracticeMenu,
  deletePracticeMenu,
  updatePracticeMenu,
} from "@app/services/v2/practiceMenuService";
import PracticeMenusContent from "../_components/PracticeMenusContent";

const mockUseEntitlement = useEntitlement as jest.MockedFunction<
  typeof useEntitlement
>;
const mockCreate = createPracticeMenu as jest.MockedFunction<
  typeof createPracticeMenu
>;
const mockUpdate = updatePracticeMenu as jest.MockedFunction<
  typeof updatePracticeMenu
>;
const mockDelete = deletePracticeMenu as jest.MockedFunction<
  typeof deletePracticeMenu
>;

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

async function openCreateForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "メニューを作る" }));
}

describe("PracticeMenusContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEntitlement();
  });

  describe("一覧表示", () => {
    it("カテゴリ別にグルーピングして表示する", () => {
      render(
        <PracticeMenusContent
          initialMenus={[
            buildMenu({ id: 1, name: "素振り", category: "batting" }),
            buildMenu({ id: 2, name: "ランニング", category: "training" }),
            buildMenu({ id: 3, name: "ティー", category: "batting" }),
          ]}
        />,
      );

      const battingGroup = screen.getByRole("region", {
        name: "バッティング",
      });
      expect(within(battingGroup).getByText("素振り")).toBeVisible();
      expect(within(battingGroup).getByText("ティー")).toBeVisible();
      expect(within(battingGroup).queryByText("ランニング")).toBeNull();

      const trainingGroup = screen.getByRole("region", {
        name: "トレーニング",
      });
      expect(within(trainingGroup).getByText("ランニング")).toBeVisible();
    });

    it("カテゴリ見出しは back と同じカテゴリ定義順に並ぶ", () => {
      render(
        <PracticeMenusContent
          initialMenus={[
            buildMenu({ id: 1, name: "その他練習", category: "other" }),
            buildMenu({ id: 2, name: "ベンチプレス", category: "strength" }),
            buildMenu({ id: 3, name: "キャッチボール", category: "pitching" }),
            buildMenu({ id: 4, name: "素振り", category: "batting" }),
          ]}
        />,
      );

      const groupNames = screen
        .getAllByRole("region")
        .map((group) => within(group).getByRole("heading").textContent);
      expect(groupNames).toEqual(["バッティング", "投手", "筋トレ", "その他"]);
    });

    it("メニューが無いカテゴリの見出しは表示しない", () => {
      render(
        <PracticeMenusContent
          initialMenus={[buildMenu({ category: "batting" })]}
        />,
      );

      expect(screen.getByText("バッティング")).toBeVisible();
      expect(screen.queryByText("守備")).toBeNull();
    });

    it("メニューが1件も無いときは空状態を表示する", () => {
      render(<PracticeMenusContent initialMenus={[]} />);

      expect(screen.getByText("まだ練習メニューがありません")).toBeVisible();
    });

    it("初期値は decimal 文字列をそのまま出さず数値として表示する", () => {
      render(
        <PracticeMenusContent
          initialMenus={[buildMenu({ default_value: "200.0" })]}
        />,
      );

      expect(screen.getByText("回数 ・ 初期値 200本")).toBeVisible();
      expect(screen.queryByText(/200\.0/)).toBeNull();
    });
  });

  describe("作成", () => {
    it("名前・カテゴリ・計測タイプ・初期値を入力して作成できる", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({
        ok: true,
        data: buildMenu({ id: 9, name: "ダッシュ", category: "baserunning" }),
      });
      render(<PracticeMenusContent initialMenus={[]} />);

      await openCreateForm(user);
      await user.type(screen.getByLabelText(/名前/), "ダッシュ");
      await user.click(screen.getByRole("button", { name: "走塁" }));
      await user.click(screen.getByRole("button", { name: "距離" }));
      await user.type(screen.getByLabelText(/初期値/), "5");
      await user.click(screen.getByRole("button", { name: "保存" }));

      await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
      expect(mockCreate).toHaveBeenCalledWith({
        name: "ダッシュ",
        category: "baserunning",
        unit: "distance",
        unit_label: "km",
        default_value: 5,
      });
    });

    it("作成したメニューが一覧に追加される", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({
        ok: true,
        data: buildMenu({ id: 9, name: "ティー", category: "batting" }),
      });
      render(<PracticeMenusContent initialMenus={[]} />);

      await openCreateForm(user);
      await user.type(screen.getByLabelText(/名前/), "ティー");
      await user.click(screen.getByRole("button", { name: "保存" }));

      expect(await screen.findByText("ティー")).toBeVisible();
      expect(screen.queryByText("まだ練習メニューがありません")).toBeNull();
    });

    it("名前が未入力ならバリデーションエラーを出して送信しない", async () => {
      const user = userEvent.setup();
      render(<PracticeMenusContent initialMenus={[]} />);

      await openCreateForm(user);
      await user.click(screen.getByRole("button", { name: "保存" }));

      expect(
        await screen.findByText("メニュー名を入力してください"),
      ).toBeInTheDocument();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("初期値が未入力なら default_value は null で送る", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({ ok: true, data: buildMenu({ id: 9 }) });
      render(<PracticeMenusContent initialMenus={[]} />);

      await openCreateForm(user);
      await user.type(screen.getByLabelText(/名前/), "アップ");
      await user.click(screen.getByRole("button", { name: "保存" }));

      await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
      expect(mockCreate.mock.calls[0][0].default_value).toBeNull();
    });
  });

  describe("計測タイプと unit_label の連動", () => {
    it("「筋トレ」を選ぶと計測タイプが重さ×回数へ切り替わる", async () => {
      const user = userEvent.setup();
      render(<PracticeMenusContent initialMenus={[]} />);

      await openCreateForm(user);
      expect(screen.getByRole("button", { name: "回数" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );

      await user.click(screen.getByRole("button", { name: "筋トレ" }));

      expect(screen.getByRole("button", { name: "重さ×回数" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(screen.getByRole("button", { name: "回数" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });

    it("「筋トレ」以外へ切り替えると重さ×回数は回数へ戻る", async () => {
      const user = userEvent.setup();
      render(<PracticeMenusContent initialMenus={[]} />);

      await openCreateForm(user);
      await user.click(screen.getByRole("button", { name: "筋トレ" }));
      await user.click(screen.getByRole("button", { name: "守備" }));

      expect(screen.getByRole("button", { name: "回数" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    it("「筋トレ」を選んでも明示的に選んだ計測タイプは保持される", async () => {
      const user = userEvent.setup();
      render(<PracticeMenusContent initialMenus={[]} />);

      await openCreateForm(user);
      await user.click(screen.getByRole("button", { name: "時間" }));
      await user.click(screen.getByRole("button", { name: "投手" }));

      expect(screen.getByRole("button", { name: "時間" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    it.each([
      ["回数", "本"],
      ["時間", "分"],
      ["距離", "km"],
      ["重さ×回数", "回"],
    ])(
      "計測タイプ「%s」を選ぶと unit_label は %s で自動送信される",
      async (unitLabel, expectedLabel) => {
        const user = userEvent.setup();
        mockCreate.mockResolvedValue({ ok: true, data: buildMenu({ id: 9 }) });
        render(<PracticeMenusContent initialMenus={[]} />);

        await openCreateForm(user);
        await user.type(screen.getByLabelText(/名前/), "メニュー");
        await user.click(screen.getByRole("button", { name: unitLabel }));
        await user.click(screen.getByRole("button", { name: "保存" }));

        await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
        expect(mockCreate.mock.calls[0][0].unit_label).toBe(expectedLabel);
      },
    );

    it("unit_label を直接入力させる欄は存在しない", async () => {
      const user = userEvent.setup();
      render(<PracticeMenusContent initialMenus={[]} />);

      await openCreateForm(user);

      expect(screen.queryByLabelText(/単位/)).toBeNull();
      expect(screen.queryByLabelText(/ラベル/)).toBeNull();
    });
  });

  describe("編集", () => {
    it("行をタップすると既存の値が入ったフォームが開き、更新できる", async () => {
      const user = userEvent.setup();
      const menu = buildMenu({ id: 4, name: "素振り" });
      mockUpdate.mockResolvedValue({
        ok: true,
        data: { ...menu, name: "連続素振り" },
      });
      render(<PracticeMenusContent initialMenus={[menu]} />);

      await user.click(screen.getByRole("button", { name: "素振りを編集" }));

      expect(
        screen.getByRole("dialog", { name: "メニューを編集" }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/名前/)).toHaveValue("素振り");
      expect(screen.getByLabelText(/初期値/)).toHaveValue(200);

      await user.clear(screen.getByLabelText(/名前/));
      await user.type(screen.getByLabelText(/名前/), "連続素振り");
      await user.click(screen.getByRole("button", { name: "保存" }));

      await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
      expect(mockUpdate).toHaveBeenCalledWith(
        4,
        expect.objectContaining({ name: "連続素振り" }),
      );
      expect(await screen.findByText("連続素振り")).toBeVisible();
    });

    it("編集時は無料枠の上限に達していてもフォームを開ける", async () => {
      const user = userEvent.setup();
      render(
        <PracticeMenusContent
          initialMenus={[
            buildMenu({ id: 1, name: "素振り" }),
            buildMenu({ id: 2, name: "ティー" }),
            buildMenu({ id: 3, name: "ランニング" }),
          ]}
        />,
      );

      await user.click(screen.getByRole("button", { name: "素振りを編集" }));

      expect(
        screen.getByRole("dialog", { name: "メニューを編集" }),
      ).toBeInTheDocument();
      expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
    });
  });

  describe("削除", () => {
    it("確認を経てから削除する", async () => {
      const user = userEvent.setup();
      mockDelete.mockResolvedValue({
        ok: true,
        data: { message: "削除しました" },
      });
      render(
        <PracticeMenusContent
          initialMenus={[buildMenu({ id: 7, name: "ティー" })]}
        />,
      );

      await user.click(screen.getByRole("button", { name: "ティーを削除" }));

      expect(
        screen.getByText("「ティー」を削除しますか？"),
      ).toBeInTheDocument();
      expect(mockDelete).not.toHaveBeenCalled();

      await user.click(screen.getByRole("button", { name: "削除" }));

      await waitFor(() => expect(mockDelete).toHaveBeenCalledWith(7));
      await waitFor(() => expect(screen.queryByText("ティー")).toBeNull());
    });

    it("確認をキャンセルすると削除しない", async () => {
      const user = userEvent.setup();
      render(
        <PracticeMenusContent
          initialMenus={[buildMenu({ id: 7, name: "ティー" })]}
        />,
      );

      await user.click(screen.getByRole("button", { name: "ティーを削除" }));
      await user.click(screen.getByRole("button", { name: "キャンセル" }));

      expect(mockDelete).not.toHaveBeenCalled();
      expect(screen.getByText("ティー")).toBeVisible();
    });

    it("削除確認では練習ログが残ることを伝える", async () => {
      const user = userEvent.setup();
      render(
        <PracticeMenusContent
          initialMenus={[buildMenu({ id: 7, name: "ティー" })]}
        />,
      );

      await user.click(screen.getByRole("button", { name: "ティーを削除" }));

      expect(
        screen.getByText(
          "これまでに記録した練習ログは削除されず、そのまま残ります。",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("無料枠の上限", () => {
    const threeMenus = [
      buildMenu({ id: 1, name: "素振り" }),
      buildMenu({ id: 2, name: "ティー" }),
      buildMenu({ id: 3, name: "ランニング" }),
    ];

    it("無料ユーザーが4件目を作ろうとするとフォームではなくペイウォールが出る", async () => {
      const user = userEvent.setup();
      render(<PracticeMenusContent initialMenus={threeMenus} />);

      await openCreateForm(user);

      expect(mockOpenProUpgradeModal).toHaveBeenCalledWith({
        trigger: "unlimited_practice_menus",
      });
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("上限に達すると Pro 限定ではなく件数上限として案内する", () => {
      render(<PracticeMenusContent initialMenus={threeMenus} />);

      expect(
        screen.getByText("無料プランで登録できる練習メニューは3件までです"),
      ).toBeVisible();
      expect(
        screen.getByText(
          "Pro プランなら4つ目以降の練習メニューも自由に登録・編集できます。",
        ),
      ).toBeVisible();
    });

    it("上限未満なら案内を出さずフォームを開ける", async () => {
      const user = userEvent.setup();
      render(<PracticeMenusContent initialMenus={threeMenus.slice(0, 2)} />);

      expect(
        screen.queryByText("無料プランで登録できる練習メニューは3件までです"),
      ).toBeNull();

      await openCreateForm(user);

      expect(
        screen.getByRole("dialog", { name: "メニューを作る" }),
      ).toBeInTheDocument();
      expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
    });

    it("Pro ユーザーは4件目以降も作成フォームを開ける", async () => {
      const user = userEvent.setup();
      mockEntitlement({ granted: true });
      render(<PracticeMenusContent initialMenus={threeMenus} />);

      expect(
        screen.queryByText("無料プランで登録できる練習メニューは3件までです"),
      ).toBeNull();

      await openCreateForm(user);

      expect(
        screen.getByRole("dialog", { name: "メニューを作る" }),
      ).toBeInTheDocument();
      expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
    });

    it("Pro 判定が未確定の間は上限の案内を出さない", () => {
      mockEntitlement({ isLoading: true });
      render(<PracticeMenusContent initialMenus={threeMenus} />);

      expect(
        screen.queryByText("無料プランで登録できる練習メニューは3件までです"),
      ).toBeNull();
    });
  });

  describe("サーバー側の 403", () => {
    it("作成が 403 で拒否されたら件数上限の文言とペイウォールを出す", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({
        ok: false,
        reason: "forbidden",
        errors: ["Forbidden"],
      });
      render(<PracticeMenusContent initialMenus={[]} />);

      await openCreateForm(user);
      await user.type(screen.getByLabelText(/名前/), "ダッシュ");
      await user.click(screen.getByRole("button", { name: "保存" }));

      expect(
        await screen.findByText(
          "無料プランで登録できる練習メニューは3件までです。Pro プランなら4つ目以降の練習メニューも自由に登録・編集できます。",
        ),
      ).toBeInTheDocument();
      expect(mockOpenProUpgradeModal).toHaveBeenCalledWith({
        trigger: "unlimited_practice_menus",
      });
    });

    it("作成が 422 で失敗したらサーバーのエラーメッセージを出す", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({
        ok: false,
        reason: "error",
        errors: ["名前はすでに使われています"],
      });
      render(<PracticeMenusContent initialMenus={[]} />);

      await openCreateForm(user);
      await user.type(screen.getByLabelText(/名前/), "素振り");
      await user.click(screen.getByRole("button", { name: "保存" }));

      expect(
        await screen.findByText("名前はすでに使われています"),
      ).toBeInTheDocument();
      expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
    });
  });
});
