const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockBack = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh, back: mockBack }),
}));

const mockOpenProUpgradeModal = jest.fn();

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({
    open: mockOpenProUpgradeModal,
    close: jest.fn(),
  }),
}));

jest.mock("sonner", () => ({
  toast: { error: jest.fn(), success: jest.fn(), info: jest.fn() },
}));

jest.mock("@app/services/v2/menuSetService", () => ({
  createMenuSet: jest.fn(),
  updateMenuSet: jest.fn(),
}));

import type { MenuSet } from "@app/types/menuSet";
import type { PracticeMenu } from "@app/types/practice";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMenuSet, updateMenuSet } from "@app/services/v2/menuSetService";
import MenuSetFormContent from "../_components/MenuSetFormContent";

const mockCreate = createMenuSet as jest.MockedFunction<typeof createMenuSet>;
const mockUpdate = updateMenuSet as jest.MockedFunction<typeof updateMenuSet>;

const menus: PracticeMenu[] = [
  {
    id: 1,
    name: "素振り",
    category: "batting",
    unit: "count",
    unit_label: "本",
    default_value: "200.0",
    is_favorite: false,
    sort_order: 1,
  },
  {
    id: 2,
    name: "ティー",
    category: "batting",
    unit: "count",
    unit_label: "本",
    default_value: null,
    is_favorite: false,
    sort_order: 2,
  },
  {
    id: 3,
    name: "ランニング",
    category: "training",
    unit: "distance",
    unit_label: "km",
    default_value: "5.0",
    is_favorite: false,
    sort_order: 3,
  },
];

function buildMenuSet(overrides: Partial<MenuSet> = {}): MenuSet {
  return {
    id: 7,
    name: "オフ日ルーティン",
    note: null,
    sort_order: 0,
    items: [],
    ...overrides,
  };
}

const savedMenuSet = buildMenuSet({ id: 7 });

describe("MenuSetFormContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("作成", () => {
    it("セット名・メモ・メニューを指定して作成できる", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({ ok: true, data: savedMenuSet });
      render(<MenuSetFormContent menuSet={null} menus={menus} />);

      await user.type(screen.getByLabelText(/セット名/), "オフ日ルーティン");
      await user.type(screen.getByLabelText(/メモ/), "試合前日の軽め調整");
      await user.click(screen.getByRole("checkbox", { name: "素振り" }));
      await user.click(screen.getByRole("button", { name: "作成する" }));

      await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
      expect(mockCreate).toHaveBeenCalledWith({
        name: "オフ日ルーティン",
        note: "試合前日の軽め調整",
        items: [{ practice_menu_id: 1, target_value: 200 }],
      });
    });

    it("作成後は詳細画面へ遷移する", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({ ok: true, data: savedMenuSet });
      render(<MenuSetFormContent menuSet={null} menus={menus} />);

      await user.type(screen.getByLabelText(/セット名/), "オフ日ルーティン");
      await user.click(screen.getByRole("button", { name: "作成する" }));

      await waitFor(() =>
        expect(mockPush).toHaveBeenCalledWith("/practice/menu-sets/7"),
      );
    });

    it("セット名が未入力なら送信せずエラーを出す", async () => {
      const user = userEvent.setup();
      render(<MenuSetFormContent menuSet={null} menus={menus} />);

      await user.click(screen.getByRole("button", { name: "作成する" }));

      expect(
        await screen.findByText("セット名を入力してください"),
      ).toBeInTheDocument();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("メモ未入力なら note は null で送る", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({ ok: true, data: savedMenuSet });
      render(<MenuSetFormContent menuSet={null} menus={menus} />);

      await user.type(screen.getByLabelText(/セット名/), "朝練");
      await user.click(screen.getByRole("button", { name: "作成する" }));

      await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
      expect(mockCreate.mock.calls[0][0].note).toBeNull();
    });
  });

  describe("メニューの選択と目標量", () => {
    it("選択したメニューの目標量には default_value が初期表示される", async () => {
      const user = userEvent.setup();
      render(<MenuSetFormContent menuSet={null} menus={menus} />);

      await user.click(screen.getByRole("checkbox", { name: "素振り" }));

      expect(screen.getByLabelText("素振りの目標量")).toHaveValue(200);
    });

    it("default_value は decimal 文字列のまま入力欄へ入れない", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({ ok: true, data: savedMenuSet });
      render(<MenuSetFormContent menuSet={null} menus={menus} />);

      await user.click(screen.getByRole("checkbox", { name: "ランニング" }));

      expect(screen.getByLabelText("ランニングの目標量")).toHaveValue(5);

      await user.type(screen.getByLabelText(/セット名/), "朝ラン");
      await user.click(screen.getByRole("button", { name: "作成する" }));

      await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
      expect(mockCreate.mock.calls[0][0].items).toEqual([
        { practice_menu_id: 3, target_value: 5 },
      ]);
    });

    it("default_value が無いメニューは空欄で始まり target_value は null で送る", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({ ok: true, data: savedMenuSet });
      render(<MenuSetFormContent menuSet={null} menus={menus} />);

      await user.click(screen.getByRole("checkbox", { name: "ティー" }));

      expect(screen.getByLabelText("ティーの目標量")).toHaveValue(null);

      await user.type(screen.getByLabelText(/セット名/), "ティー中心");
      await user.click(screen.getByRole("button", { name: "作成する" }));

      await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
      expect(mockCreate.mock.calls[0][0].items).toEqual([
        { practice_menu_id: 2, target_value: null },
      ]);
    });

    it("目標量を編集した値が送信される", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({ ok: true, data: savedMenuSet });
      render(<MenuSetFormContent menuSet={null} menus={menus} />);

      await user.type(screen.getByLabelText(/セット名/), "朝練");
      await user.click(screen.getByRole("checkbox", { name: "素振り" }));
      await user.clear(screen.getByLabelText("素振りの目標量"));
      await user.type(screen.getByLabelText("素振りの目標量"), "300");
      await user.click(screen.getByRole("button", { name: "作成する" }));

      await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
      expect(mockCreate.mock.calls[0][0].items).toEqual([
        { practice_menu_id: 1, target_value: 300 },
      ]);
    });

    it("選択を外すとその目標量欄も消える", async () => {
      const user = userEvent.setup();
      render(<MenuSetFormContent menuSet={null} menus={menus} />);

      await user.click(screen.getByRole("checkbox", { name: "素振り" }));
      await user.click(screen.getByRole("checkbox", { name: "素振り" }));

      expect(screen.queryByLabelText("素振りの目標量")).toBeNull();
    });

    it("練習メニューが1件も無いときは先に登録するよう案内する", () => {
      render(<MenuSetFormContent menuSet={null} menus={[]} />);

      expect(
        screen.getByText(
          "練習メニューがありません。先に練習メニューを登録すると、セットに入れられます。",
        ),
      ).toBeVisible();
      expect(
        screen.getByRole("link", { name: "練習メニューを登録する" }),
      ).toHaveAttribute("href", "/practice/menus");
    });
  });

  describe("編集", () => {
    const editing = buildMenuSet({
      id: 7,
      name: "オフ日ルーティン",
      note: "軽め",
      items: [
        {
          practice_menu_id: 1,
          name: "素振り",
          unit_label: "本",
          target_value: 150,
        },
        {
          practice_menu_id: 3,
          name: "ランニング",
          unit_label: "km",
          target_value: 3,
        },
      ],
    });

    it("既存の値がフォームに反映される", () => {
      render(<MenuSetFormContent menuSet={editing} menus={menus} />);

      expect(screen.getByLabelText(/セット名/)).toHaveValue("オフ日ルーティン");
      expect(screen.getByLabelText(/メモ/)).toHaveValue("軽め");
      expect(screen.getByRole("checkbox", { name: "素振り" })).toBeChecked();
      expect(
        screen.getByRole("checkbox", { name: "ティー" }),
      ).not.toBeChecked();
      expect(screen.getByLabelText("素振りの目標量")).toHaveValue(150);
    });

    it("セット名を書き換えて更新できる", async () => {
      const user = userEvent.setup();
      mockUpdate.mockResolvedValue({ ok: true, data: editing });
      render(<MenuSetFormContent menuSet={editing} menus={menus} />);

      await user.clear(screen.getByLabelText(/セット名/));
      await user.type(screen.getByLabelText(/セット名/), "オフ日ルーティン改");
      await user.click(screen.getByRole("button", { name: "更新する" }));

      await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
      expect(mockUpdate.mock.calls[0][0]).toBe(7);
      expect(mockUpdate.mock.calls[0][1].name).toBe("オフ日ルーティン改");
    });

    it("items は差分ではなく選択中のメニューを毎回すべて送る", async () => {
      const user = userEvent.setup();
      mockUpdate.mockResolvedValue({ ok: true, data: editing });
      render(<MenuSetFormContent menuSet={editing} menus={menus} />);

      // 「ティー」を足すだけの操作でも、既存の2件を含めた全量が送られる必要がある。
      await user.click(screen.getByRole("checkbox", { name: "ティー" }));
      await user.click(screen.getByRole("button", { name: "更新する" }));

      await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
      expect(mockUpdate.mock.calls[0][1].items).toEqual([
        { practice_menu_id: 1, target_value: 150 },
        { practice_menu_id: 2, target_value: null },
        { practice_menu_id: 3, target_value: 3 },
      ]);
    });

    it("メニューを1件も選ばずに更新すると空配列を送って全解除する", async () => {
      const user = userEvent.setup();
      mockUpdate.mockResolvedValue({ ok: true, data: editing });
      render(<MenuSetFormContent menuSet={editing} menus={menus} />);

      await user.click(screen.getByRole("checkbox", { name: "素振り" }));
      await user.click(screen.getByRole("checkbox", { name: "ランニング" }));
      await user.click(screen.getByRole("button", { name: "更新する" }));

      await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
      expect(mockUpdate.mock.calls[0][1].items).toEqual([]);
    });

    it("メニューが全置換されることを保存前に伝える", () => {
      render(<MenuSetFormContent menuSet={editing} menus={menus} />);

      expect(
        screen.getByText(
          "保存すると、このセットのメニューは選択した内容にまるごと置き換わります。",
        ),
      ).toBeVisible();
    });
  });

  describe("サーバー側のエラー", () => {
    it("作成が 403 で拒否されたら件数上限の文言とペイウォールを出す", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({
        ok: false,
        reason: "forbidden",
        errors: ["Pro プランでメニューセットを無制限に登録できます"],
      });
      render(<MenuSetFormContent menuSet={null} menus={menus} />);

      await user.type(screen.getByLabelText(/セット名/), "3つ目");
      await user.click(screen.getByRole("button", { name: "作成する" }));

      expect(
        await screen.findByText(
          "無料プランで作成できるメニューセットは2件までです。Pro プランなら3つ目以降のメニューセットも自由に作成・編集できます。",
        ),
      ).toBeInTheDocument();
      expect(mockOpenProUpgradeModal).toHaveBeenCalledWith({
        trigger: "unlimited_menu_sets",
      });
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("作成が 422 で失敗したらサーバーのメッセージを出す", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({
        ok: false,
        reason: "error",
        errors: ["名前は50文字以内で入力してください"],
      });
      render(<MenuSetFormContent menuSet={null} menus={menus} />);

      await user.type(screen.getByLabelText(/セット名/), "セット");
      await user.click(screen.getByRole("button", { name: "作成する" }));

      expect(
        await screen.findByText("名前は50文字以内で入力してください"),
      ).toBeInTheDocument();
      expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
    });

    it("更新の 403 は件数上限ではないためペイウォールに倒さない", async () => {
      const user = userEvent.setup();
      mockUpdate.mockResolvedValue({
        ok: false,
        reason: "forbidden",
        errors: ["更新できません"],
      });
      render(<MenuSetFormContent menuSet={buildMenuSet()} menus={menus} />);

      await user.click(screen.getByRole("button", { name: "更新する" }));

      expect(await screen.findByText("更新できません")).toBeInTheDocument();
      expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
    });
  });
});
