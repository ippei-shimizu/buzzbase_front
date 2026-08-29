const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

jest.mock("sonner", () => ({
  toast: { error: jest.fn(), success: jest.fn(), info: jest.fn() },
}));

jest.mock("@app/services/v2/menuSetService", () => ({
  deleteMenuSet: jest.fn(),
}));

import type { MenuSet } from "@app/types/menuSet";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { deleteMenuSet } from "@app/services/v2/menuSetService";
import MenuSetDetailContent from "../_components/MenuSetDetailContent";

const mockDelete = deleteMenuSet as jest.MockedFunction<typeof deleteMenuSet>;

function buildMenuSet(overrides: Partial<MenuSet> = {}): MenuSet {
  return {
    id: 7,
    name: "オフ日ルーティン",
    note: null,
    sort_order: 0,
    items: [
      {
        practice_menu_id: 1,
        name: "素振り",
        unit_label: "本",
        target_value: 200,
      },
    ],
    ...overrides,
  };
}

describe("MenuSetDetailContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("表示", () => {
    it("メニューを「素振り 200本」形式で表示する", () => {
      render(<MenuSetDetailContent menuSet={buildMenuSet()} />);

      expect(screen.getByText("素振り 200本")).toBeVisible();
    });

    it("目標量が decimal 文字列で届いても数値に整形して表示する", () => {
      render(
        <MenuSetDetailContent
          menuSet={buildMenuSet({
            items: [
              {
                practice_menu_id: 1,
                name: "素振り",
                unit_label: "本",
                // back の float / decimal は文字列で届くことがある。
                target_value: "200.0" as unknown as number,
              },
            ],
          })}
        />,
      );

      expect(screen.getByText("素振り 200本")).toBeVisible();
      expect(screen.queryByText(/200\.0/)).toBeNull();
    });

    it("目標量が未設定のメニューは名前だけを表示する", () => {
      render(
        <MenuSetDetailContent
          menuSet={buildMenuSet({
            items: [
              {
                practice_menu_id: 2,
                name: "ストレッチ",
                unit_label: "分",
                target_value: null,
              },
            ],
          })}
        />,
      );

      expect(screen.getByText("ストレッチ")).toBeVisible();
    });

    it("セット名とメモを表示する", () => {
      render(
        <MenuSetDetailContent
          menuSet={buildMenuSet({ note: "試合前日の軽め調整" })}
        />,
      );

      expect(
        screen.getByRole("heading", { name: "オフ日ルーティン" }),
      ).toBeVisible();
      expect(screen.getByText("試合前日の軽め調整")).toBeVisible();
    });

    it("メモが無いときはメモの見出しごと出さない", () => {
      render(<MenuSetDetailContent menuSet={buildMenuSet({ note: null })} />);

      expect(screen.queryByRole("heading", { name: "メモ" })).toBeNull();
    });

    it("メニュー未設定のセットはその旨を表示する", () => {
      render(<MenuSetDetailContent menuSet={buildMenuSet({ items: [] })} />);

      expect(screen.getByText("メニュー未設定")).toBeVisible();
    });

    it("編集画面への導線を持つ", () => {
      render(<MenuSetDetailContent menuSet={buildMenuSet({ id: 42 })} />);

      expect(screen.getByRole("button", { name: "編集" })).toHaveAttribute(
        "href",
        "/practice/menu-sets/42/edit",
      );
    });
  });

  describe("削除", () => {
    it("確認を経てから削除し、一覧へ戻る", async () => {
      const user = userEvent.setup();
      mockDelete.mockResolvedValue({
        ok: true,
        data: { message: "削除しました" },
      });
      render(<MenuSetDetailContent menuSet={buildMenuSet({ id: 7 })} />);

      await user.click(screen.getByRole("button", { name: "削除" }));

      expect(
        screen.getByText("「オフ日ルーティン」を削除しますか？"),
      ).toBeInTheDocument();
      expect(mockDelete).not.toHaveBeenCalled();

      await user.click(
        screen.getAllByRole("button", { name: "削除" }).at(-1) as HTMLElement,
      );

      await waitFor(() => expect(mockDelete).toHaveBeenCalledWith(7));
      await waitFor(() =>
        expect(mockPush).toHaveBeenCalledWith("/practice/menu-sets"),
      );
    });

    it("確認をキャンセルすると削除しない", async () => {
      const user = userEvent.setup();
      render(<MenuSetDetailContent menuSet={buildMenuSet()} />);

      await user.click(screen.getByRole("button", { name: "削除" }));
      await user.click(screen.getByRole("button", { name: "キャンセル" }));

      expect(mockDelete).not.toHaveBeenCalled();
    });

    it("削除確認では紐付いた予定が残ることを伝える", async () => {
      const user = userEvent.setup();
      render(<MenuSetDetailContent menuSet={buildMenuSet()} />);

      await user.click(screen.getByRole("button", { name: "削除" }));

      expect(
        screen.getByText(
          "このセットを使っている予定は削除されず、メニューの紐付けだけが外れます。",
        ),
      ).toBeInTheDocument();
    });
  });
});
