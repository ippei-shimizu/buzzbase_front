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

jest.mock("@app/services/v2/reflectionTemplateService", () => ({
  createReflectionTemplate: jest.fn(),
  updateReflectionTemplate: jest.fn(),
  deleteReflectionTemplate: jest.fn(),
}));

import type { ReflectionTemplate } from "@app/interface/reflectionTemplate";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import {
  createReflectionTemplate,
  deleteReflectionTemplate,
  updateReflectionTemplate,
} from "@app/services/v2/reflectionTemplateService";
import ReflectionTemplatesContent from "../_components/ReflectionTemplatesContent";

const mockUseEntitlement = useEntitlement as jest.MockedFunction<
  typeof useEntitlement
>;
const mockCreate = createReflectionTemplate as jest.MockedFunction<
  typeof createReflectionTemplate
>;
const mockUpdate = updateReflectionTemplate as jest.MockedFunction<
  typeof updateReflectionTemplate
>;
const mockDelete = deleteReflectionTemplate as jest.MockedFunction<
  typeof deleteReflectionTemplate
>;

function buildTemplate(
  overrides: Partial<ReflectionTemplate> = {},
): ReflectionTemplate {
  return {
    id: 1,
    title: "試合の振り返り",
    questions: ["良かった点", "次やること"],
    is_preset: false,
    is_default: false,
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
  await user.click(screen.getByRole("button", { name: "テンプレを作る" }));
}

describe("ReflectionTemplatesContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEntitlement();
  });

  describe("一覧表示", () => {
    it("プリセットと自作を区分して表示する", () => {
      render(
        <ReflectionTemplatesContent
          initialTemplates={[
            buildTemplate({ id: 1, title: "運営テンプレ", is_preset: true }),
            buildTemplate({ id: 2, title: "マイテンプレ" }),
          ]}
        />,
      );

      const presetSection = screen.getByRole("region", { name: "プリセット" });
      expect(within(presetSection).getByText("運営テンプレ")).toBeVisible();
      expect(within(presetSection).queryByText("マイテンプレ")).toBeNull();

      const customSection = screen.getByRole("region", {
        name: "自作テンプレ",
      });
      expect(within(customSection).getByText("マイテンプレ")).toBeVisible();
    });

    it("問いを一覧に並べて内容が分かるようにする", () => {
      render(
        <ReflectionTemplatesContent
          initialTemplates={[
            buildTemplate({ questions: ["良かった点", "次やること"] }),
          ]}
        />,
      );

      expect(screen.getByText("良かった点 ・ 次やること")).toBeVisible();
    });

    it("自作が無いときは空状態を伝える", () => {
      render(
        <ReflectionTemplatesContent
          initialTemplates={[buildTemplate({ is_preset: true })]}
        />,
      );

      expect(
        screen.getByText(
          "まだ自作の振り返りテンプレがありません。自分専用の問いかけを作れます。",
        ),
      ).toBeVisible();
    });

    it("プリセットには削除導線を出さない（back が削除を許さないため）", () => {
      render(
        <ReflectionTemplatesContent
          initialTemplates={[
            buildTemplate({ id: 1, title: "運営テンプレ", is_preset: true }),
          ]}
        />,
      );

      expect(
        screen.queryByRole("button", { name: "運営テンプレを削除" }),
      ).toBeNull();
      expect(
        screen.getByRole("button", { name: "運営テンプレを編集" }),
      ).toBeVisible();
    });
  });

  describe("作成", () => {
    it("タイトルと問いを入力して作成できる", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({
        ok: true,
        data: buildTemplate({ id: 9, title: "マイテンプレ" }),
      });
      render(<ReflectionTemplatesContent initialTemplates={[]} />);

      await openCreateForm(user);
      await user.type(screen.getByLabelText(/テンプレ名/), "マイテンプレ");
      await user.type(screen.getByLabelText("問い 1"), "良かった点");
      await user.type(screen.getByLabelText("問い 2"), "次やること");
      await user.click(screen.getByRole("button", { name: "保存" }));

      await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
      expect(mockCreate).toHaveBeenCalledWith({
        title: "マイテンプレ",
        questions: ["良かった点", "次やること"],
      });
      expect(await screen.findByText("マイテンプレ")).toBeVisible();
    });

    it("テンプレ名が未入力なら送信しない", async () => {
      const user = userEvent.setup();
      render(<ReflectionTemplatesContent initialTemplates={[]} />);

      await openCreateForm(user);
      await user.type(screen.getByLabelText("問い 1"), "良かった点");
      await user.click(screen.getByRole("button", { name: "保存" }));

      expect(
        await screen.findByText("テンプレ名を入力してください"),
      ).toBeInTheDocument();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("問いが1つも無ければ送信しない", async () => {
      const user = userEvent.setup();
      render(<ReflectionTemplatesContent initialTemplates={[]} />);

      await openCreateForm(user);
      await user.type(screen.getByLabelText(/テンプレ名/), "マイテンプレ");
      await user.click(screen.getByRole("button", { name: "保存" }));

      expect(
        await screen.findByText("問いを1つ以上入力してください"),
      ).toBeInTheDocument();
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe("問いの可変追加・削除", () => {
    it("問いを追加しても入力済みの問いは残る", async () => {
      const user = userEvent.setup();
      render(<ReflectionTemplatesContent initialTemplates={[]} />);

      await openCreateForm(user);
      await user.type(screen.getByLabelText("問い 1"), "良かった点");
      await user.click(screen.getByRole("button", { name: "問いを追加" }));

      expect(screen.getByLabelText("問い 1")).toHaveValue("良かった点");
      expect(screen.getByLabelText("問い 4")).toHaveValue("");
    });

    it("途中の問いを削除しても他の問いの入力は消えない", async () => {
      const user = userEvent.setup();
      render(<ReflectionTemplatesContent initialTemplates={[]} />);

      await openCreateForm(user);
      await user.type(screen.getByLabelText("問い 1"), "A");
      await user.type(screen.getByLabelText("問い 2"), "B");
      await user.type(screen.getByLabelText("問い 3"), "C");
      await user.click(screen.getByRole("button", { name: "問い 2を削除" }));

      expect(screen.getByLabelText("問い 1")).toHaveValue("A");
      expect(screen.getByLabelText("問い 2")).toHaveValue("C");
      expect(screen.queryByLabelText("問い 3")).toBeNull();
    });

    it("削除した問いは送信されない", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({
        ok: true,
        data: buildTemplate({ id: 9 }),
      });
      render(<ReflectionTemplatesContent initialTemplates={[]} />);

      await openCreateForm(user);
      await user.type(screen.getByLabelText(/テンプレ名/), "マイテンプレ");
      await user.type(screen.getByLabelText("問い 1"), "A");
      await user.type(screen.getByLabelText("問い 2"), "B");
      await user.click(screen.getByRole("button", { name: "問い 1を削除" }));
      await user.click(screen.getByRole("button", { name: "保存" }));

      await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
      expect(mockCreate.mock.calls[0][0].questions).toEqual(["B"]);
    });

    it("問いが1つだけのときは削除できない", async () => {
      const user = userEvent.setup();
      render(
        <ReflectionTemplatesContent
          initialTemplates={[buildTemplate({ questions: ["良かった点"] })]}
        />,
      );

      await user.click(
        screen.getByRole("button", { name: "試合の振り返りを編集" }),
      );

      expect(screen.queryByRole("button", { name: "問い 1を削除" })).toBeNull();
    });
  });

  describe("編集", () => {
    it("既存の値が入ったフォームが開き、更新できる", async () => {
      const user = userEvent.setup();
      const template = buildTemplate({ id: 4, title: "旧テンプレ" });
      mockUpdate.mockResolvedValue({
        ok: true,
        data: buildTemplate({ id: 77, title: "新テンプレ" }),
      });
      render(<ReflectionTemplatesContent initialTemplates={[template]} />);

      await user.click(
        screen.getByRole("button", { name: "旧テンプレを編集" }),
      );

      expect(screen.getByLabelText(/テンプレ名/)).toHaveValue("旧テンプレ");
      expect(screen.getByLabelText("問い 1")).toHaveValue("良かった点");

      await user.clear(screen.getByLabelText(/テンプレ名/));
      await user.type(screen.getByLabelText(/テンプレ名/), "新テンプレ");
      await user.click(screen.getByRole("button", { name: "保存" }));

      await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
      expect(mockUpdate.mock.calls[0][0]).toBe(4);
      expect(await screen.findByText("新テンプレ")).toBeVisible();
      expect(screen.queryByText("旧テンプレ")).toBeNull();
    });

    // back の update は原本を更新せず新バージョンを作るため、以降の操作は新 ID を指す必要がある
    it("更新後は返却された新しい ID を使う（古い ID を使い続けない）", async () => {
      const user = userEvent.setup();
      mockUpdate.mockResolvedValue({
        ok: true,
        data: buildTemplate({ id: 77, title: "新テンプレ" }),
      });
      mockDelete.mockResolvedValue({
        ok: true,
        data: { message: "削除しました" },
      });
      render(
        <ReflectionTemplatesContent
          initialTemplates={[buildTemplate({ id: 4, title: "旧テンプレ" })]}
        />,
      );

      await user.click(
        screen.getByRole("button", { name: "旧テンプレを編集" }),
      );
      await user.click(screen.getByRole("button", { name: "保存" }));
      await screen.findByText("新テンプレ");

      await user.click(
        screen.getByRole("button", { name: "新テンプレを編集" }),
      );
      await user.click(screen.getByRole("button", { name: "保存" }));
      await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(2));
      expect(mockUpdate.mock.calls[1][0]).toBe(77);

      await user.click(
        screen.getByRole("button", { name: "新テンプレを削除" }),
      );
      await user.click(screen.getByRole("button", { name: "削除" }));
      await waitFor(() => expect(mockDelete).toHaveBeenCalledWith(77));
    });

    it("プリセットを編集すると自作テンプレのコピーとして一覧に移る", async () => {
      const user = userEvent.setup();
      mockUpdate.mockResolvedValue({
        ok: true,
        data: buildTemplate({
          id: 50,
          title: "運営テンプレ",
          is_preset: false,
        }),
      });
      render(
        <ReflectionTemplatesContent
          initialTemplates={[
            buildTemplate({ id: 1, title: "運営テンプレ", is_preset: true }),
          ]}
        />,
      );

      await user.click(
        screen.getByRole("button", { name: "運営テンプレを編集" }),
      );
      expect(
        screen.getByText(
          "プリセットを編集すると、自分専用のテンプレとして保存されます（元のプリセットは変わりません）。",
        ),
      ).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "保存" }));

      await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
      const customSection = await screen.findByRole("region", {
        name: "自作テンプレ",
      });
      expect(within(customSection).getByText("運営テンプレ")).toBeVisible();
      const presetSection = screen.getByRole("region", { name: "プリセット" });
      expect(within(presetSection).queryByText("運営テンプレ")).toBeNull();
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
        <ReflectionTemplatesContent
          initialTemplates={[buildTemplate({ id: 7, title: "マイテンプレ" })]}
        />,
      );

      await user.click(
        screen.getByRole("button", { name: "マイテンプレを削除" }),
      );

      expect(
        screen.getByText("「マイテンプレ」を削除しますか？"),
      ).toBeInTheDocument();
      expect(mockDelete).not.toHaveBeenCalled();

      await user.click(screen.getByRole("button", { name: "削除" }));

      await waitFor(() => expect(mockDelete).toHaveBeenCalledWith(7));
      await waitFor(() =>
        expect(screen.queryByText("マイテンプレ")).toBeNull(),
      );
    });

    it("確認をキャンセルすると削除しない", async () => {
      const user = userEvent.setup();
      render(
        <ReflectionTemplatesContent
          initialTemplates={[buildTemplate({ id: 7, title: "マイテンプレ" })]}
        />,
      );

      await user.click(
        screen.getByRole("button", { name: "マイテンプレを削除" }),
      );
      await user.click(screen.getByRole("button", { name: "キャンセル" }));

      expect(mockDelete).not.toHaveBeenCalled();
      expect(screen.getByText("マイテンプレ")).toBeVisible();
    });

    // 使用中テンプレの削除は back が 422 で拒否する。理由を出さないと原因が分からない
    it("使用中で削除できないときはサーバーの理由を表示し、一覧から消さない", async () => {
      const user = userEvent.setup();
      mockDelete.mockResolvedValue({
        ok: false,
        reason: "error",
        errors: ["このテンプレは野球ノートで使用されているため削除できません"],
      });
      render(
        <ReflectionTemplatesContent
          initialTemplates={[buildTemplate({ id: 7, title: "マイテンプレ" })]}
        />,
      );

      await user.click(
        screen.getByRole("button", { name: "マイテンプレを削除" }),
      );
      await user.click(screen.getByRole("button", { name: "削除" }));

      expect(
        await screen.findByText(
          "このテンプレは野球ノートで使用されているため削除できません",
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("マイテンプレ")).toBeVisible();
    });
  });

  describe("無料枠の上限", () => {
    const oneCustom = [buildTemplate({ id: 1, title: "マイテンプレ" })];

    it("無料ユーザーが2件目を作ろうとするとフォームではなくペイウォールが出る", async () => {
      const user = userEvent.setup();
      render(<ReflectionTemplatesContent initialTemplates={oneCustom} />);

      await openCreateForm(user);

      expect(mockOpenProUpgradeModal).toHaveBeenCalledWith({
        trigger: "unlimited_reflection_templates",
      });
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("上限に達すると Pro 限定ではなく件数上限として案内する", () => {
      render(<ReflectionTemplatesContent initialTemplates={oneCustom} />);

      expect(
        screen.getByText("無料プランで作成できる振り返りテンプレは1件までです"),
      ).toBeVisible();
      expect(
        screen.getByText(
          "Pro プランなら2つ目以降の振り返りテンプレも自由に作成・編集できます。",
        ),
      ).toBeVisible();
    });

    it("プリセットは何件見えていても上限に数えない", async () => {
      const user = userEvent.setup();
      render(
        <ReflectionTemplatesContent
          initialTemplates={[
            buildTemplate({ id: 1, title: "運営A", is_preset: true }),
            buildTemplate({ id: 2, title: "運営B", is_preset: true }),
            buildTemplate({ id: 3, title: "運営C", is_preset: true }),
          ]}
        />,
      );

      expect(
        screen.queryByText(
          "無料プランで作成できる振り返りテンプレは1件までです",
        ),
      ).toBeNull();

      await openCreateForm(user);

      expect(
        screen.getByRole("dialog", { name: "テンプレを作る" }),
      ).toBeInTheDocument();
    });

    it("Pro ユーザーは2件目以降も作成フォームを開ける", async () => {
      const user = userEvent.setup();
      mockEntitlement({ granted: true });
      render(<ReflectionTemplatesContent initialTemplates={oneCustom} />);

      expect(
        screen.queryByText(
          "無料プランで作成できる振り返りテンプレは1件までです",
        ),
      ).toBeNull();

      await openCreateForm(user);

      expect(
        screen.getByRole("dialog", { name: "テンプレを作る" }),
      ).toBeInTheDocument();
      expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
    });

    it("Pro 判定が未確定の間は上限の案内を出さない", () => {
      mockEntitlement({ isLoading: true });
      render(<ReflectionTemplatesContent initialTemplates={oneCustom} />);

      expect(
        screen.queryByText(
          "無料プランで作成できる振り返りテンプレは1件までです",
        ),
      ).toBeNull();
    });

    // Pro 解約後も既存テンプレは維持・編集できる（back も自作の再編集は無料枠チェックの対象外）
    it("無料で上限を超えて保有していても自作テンプレは編集できる", async () => {
      const user = userEvent.setup();
      render(
        <ReflectionTemplatesContent
          initialTemplates={[
            buildTemplate({ id: 1, title: "マイA" }),
            buildTemplate({ id: 2, title: "マイB" }),
            buildTemplate({ id: 3, title: "マイC" }),
          ]}
        />,
      );

      await user.click(screen.getByRole("button", { name: "マイBを編集" }));

      expect(
        screen.getByRole("dialog", { name: "テンプレを編集" }),
      ).toBeInTheDocument();
      expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
    });

    // プリセットの編集は自作の新規作成に等しく、back も無料枠を超えていれば 403 を返す
    it("上限に達している無料ユーザーはプリセットを編集できずペイウォールが出る", async () => {
      const user = userEvent.setup();
      render(
        <ReflectionTemplatesContent
          initialTemplates={[
            buildTemplate({ id: 1, title: "マイテンプレ" }),
            buildTemplate({ id: 2, title: "運営テンプレ", is_preset: true }),
          ]}
        />,
      );

      await user.click(
        screen.getByRole("button", { name: "運営テンプレを編集" }),
      );

      expect(mockOpenProUpgradeModal).toHaveBeenCalledWith({
        trigger: "unlimited_reflection_templates",
      });
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe("サーバー側のエラー", () => {
    it("作成が 403 で拒否されたら件数上限の文言とペイウォールを出す", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({
        ok: false,
        reason: "forbidden",
        errors: ["Forbidden"],
      });
      render(<ReflectionTemplatesContent initialTemplates={[]} />);

      await openCreateForm(user);
      await user.type(screen.getByLabelText(/テンプレ名/), "マイテンプレ");
      await user.type(screen.getByLabelText("問い 1"), "良かった点");
      await user.click(screen.getByRole("button", { name: "保存" }));

      expect(
        await screen.findByText(
          "無料プランで作成できる振り返りテンプレは1件までです。Pro プランなら2つ目以降の振り返りテンプレも自由に作成・編集できます。",
        ),
      ).toBeInTheDocument();
      expect(mockOpenProUpgradeModal).toHaveBeenCalledWith({
        trigger: "unlimited_reflection_templates",
      });
    });

    it("作成が 422 で失敗したらサーバーのエラーメッセージを出す", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({
        ok: false,
        reason: "error",
        errors: ["タイトルは50文字以内で入力してください"],
      });
      render(<ReflectionTemplatesContent initialTemplates={[]} />);

      await openCreateForm(user);
      await user.type(screen.getByLabelText(/テンプレ名/), "マイテンプレ");
      await user.type(screen.getByLabelText("問い 1"), "良かった点");
      await user.click(screen.getByRole("button", { name: "保存" }));

      expect(
        await screen.findByText("タイトルは50文字以内で入力してください"),
      ).toBeInTheDocument();
      expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
    });
  });
});
