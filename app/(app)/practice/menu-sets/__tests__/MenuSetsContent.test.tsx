const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: jest.fn(), back: jest.fn() }),
}));

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

import type { MenuSet } from "@app/types/menuSet";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import MenuSetsContent from "../_components/MenuSetsContent";

const mockUseEntitlement = useEntitlement as jest.MockedFunction<
  typeof useEntitlement
>;

function buildMenuSet(overrides: Partial<MenuSet> = {}): MenuSet {
  return {
    id: 1,
    name: "オフ日ルーティン",
    note: null,
    sort_order: 0,
    items: [],
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

const twoSets = [
  buildMenuSet({ id: 1, name: "オフ日ルーティン" }),
  buildMenuSet({ id: 2, name: "試合前調整" }),
];

async function clickCreate(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "セットを作る" }));
}

describe("MenuSetsContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEntitlement();
  });

  describe("一覧表示", () => {
    it("含まれるメニュー名を「/」区切りで表示する", () => {
      render(
        <MenuSetsContent
          menuSets={[
            buildMenuSet({
              items: [
                {
                  practice_menu_id: 1,
                  name: "素振り",
                  unit_label: "本",
                  target_value: 200,
                },
                {
                  practice_menu_id: 2,
                  name: "ティー",
                  unit_label: "本",
                  target_value: 100,
                },
                {
                  practice_menu_id: 3,
                  name: "ランニング",
                  unit_label: "km",
                  target_value: null,
                },
              ],
            }),
          ]}
        />,
      );

      expect(screen.getByText("素振り / ティー / ランニング")).toBeVisible();
    });

    it("一覧には目標量を出さず、メニュー名だけを並べる", () => {
      render(
        <MenuSetsContent
          menuSets={[
            buildMenuSet({
              items: [
                {
                  practice_menu_id: 1,
                  name: "素振り",
                  unit_label: "本",
                  target_value: 200,
                },
              ],
            }),
          ]}
        />,
      );

      expect(screen.getByText("素振り")).toBeVisible();
      expect(screen.queryByText(/200本/)).toBeNull();
    });

    it("メニュー未設定のセットはその旨を表示する", () => {
      render(<MenuSetsContent menuSets={[buildMenuSet({ items: [] })]} />);

      expect(screen.getByText("メニュー未設定")).toBeVisible();
    });

    it("セットが1件も無いときは使い道が分かる空状態を表示する", () => {
      render(<MenuSetsContent menuSets={[]} />);

      expect(
        screen.getByText(
          "よく組む練習をセットにしておくと、予定登録や週プランでそのまま使えます",
        ),
      ).toBeVisible();
    });

    it("セット名から詳細へ遷移できる", () => {
      render(<MenuSetsContent menuSets={[buildMenuSet({ id: 42 })]} />);

      expect(
        screen.getByRole("link", { name: /オフ日ルーティン/ }),
      ).toHaveAttribute("href", "/practice/menu-sets/42");
    });
  });

  describe("作成導線", () => {
    it("上限未満なら作成画面へ遷移する", async () => {
      const user = userEvent.setup();
      render(<MenuSetsContent menuSets={[twoSets[0]]} />);

      await clickCreate(user);

      expect(mockPush).toHaveBeenCalledWith("/practice/menu-sets/new");
      expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
    });

    it("上限未満では上限の案内を出さない", () => {
      render(<MenuSetsContent menuSets={[twoSets[0]]} />);

      expect(
        screen.queryByText("無料プランで作成できるメニューセットは2件までです"),
      ).toBeNull();
    });
  });

  describe("無料枠の上限", () => {
    it("無料ユーザーが3件目を作ろうとすると遷移せずペイウォールが出る", async () => {
      const user = userEvent.setup();
      render(<MenuSetsContent menuSets={twoSets} />);

      await clickCreate(user);

      expect(mockOpenProUpgradeModal).toHaveBeenCalledWith({
        trigger: "unlimited_menu_sets",
      });
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("上限に達すると Pro 限定ではなく件数上限として案内する", () => {
      render(<MenuSetsContent menuSets={twoSets} />);

      expect(
        screen.getByText("無料プランで作成できるメニューセットは2件までです"),
      ).toBeVisible();
      expect(
        screen.getByText(
          "Pro プランなら3つ目以降のメニューセットも自由に作成・編集できます。",
        ),
      ).toBeVisible();
    });

    it("Pro ユーザーは3件目以降も作成画面へ進める", async () => {
      const user = userEvent.setup();
      mockEntitlement({ granted: true });
      render(<MenuSetsContent menuSets={twoSets} />);

      expect(
        screen.queryByText("無料プランで作成できるメニューセットは2件までです"),
      ).toBeNull();

      await clickCreate(user);

      expect(mockPush).toHaveBeenCalledWith("/practice/menu-sets/new");
      expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
    });

    it("Pro 判定が未確定の間は上限の案内を出さない", () => {
      mockEntitlement({ isLoading: true });
      render(<MenuSetsContent menuSets={twoSets} />);

      expect(
        screen.queryByText("無料プランで作成できるメニューセットは2件までです"),
      ).toBeNull();
    });

    it("Pro 判定が未確定の間はペイウォールも出さない", async () => {
      const user = userEvent.setup();
      mockEntitlement({ isLoading: true });
      render(<MenuSetsContent menuSets={twoSets} />);

      await clickCreate(user);

      expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
    });
  });
});
