const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@app/services/v2/baseballNoteService", () => ({
  updateBaseballNote: jest.fn(),
  deleteBaseballNote: jest.fn(),
}));

jest.mock("@app/services/v2/noteTagService", () => ({
  createNoteTag: jest.fn(),
}));

jest.mock("@app/services/v2/gameResultLinkService", () => ({
  searchGameResultOptions: jest.fn(() =>
    Promise.resolve({ status: "ok", data: [] }),
  ),
}));

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({ open: jest.fn(), close: jest.fn() }),
}));

const mockHasEntitlement = jest.fn(() => false);
const mockIsEntitlementLoading = jest.fn(() => false);

jest.mock("@app/hooks/pro/useEntitlement", () => ({
  useEntitlement: () => ({
    isPro: false,
    inTrial: false,
    inGracePeriod: false,
    isLoading: mockIsEntitlementLoading(),
    hasEntitlement: mockHasEntitlement,
  }),
}));

// 実エディタは Slate に依存するため、メモ入力だけを模した textarea に差し替える。
jest.mock("next/dynamic", () => () => {
  // ファクトリ内は外部スコープを参照できないため、React はここで解決する。
  const react = jest.requireActual<typeof ReactModule>("react");
  return function MockNoteEditor({
    memo,
    setMemo,
  }: {
    memo: string;
    setMemo: (value: string) => void;
  }) {
    return react.createElement("textarea", {
      "aria-label": "メモ",
      defaultValue: memo,
      onChange: (event: { target: { value: string } }) =>
        setMemo(event.target.value),
    });
  };
});

import type { BaseballNoteV2, NoteTag } from "@app/interface/baseballNoteV2";
import type { ReflectionTemplate } from "@app/interface/reflectionTemplate";
import type { FetchResult } from "@app/services/v2/requests";
import type ReactModule from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { updateBaseballNote } from "@app/services/v2/baseballNoteService";
import NoteEditForm from "../NoteEditForm";

const mockUpdateBaseballNote = updateBaseballNote as jest.MockedFunction<
  typeof updateBaseballNote
>;

const note: BaseballNoteV2 = {
  id: 12,
  title: "気づき",
  date: "2026-08-01",
  memo: '[{"type":"paragraph","children":[{"text":"外角が詰まる"}]}]',
  memo_preview: "外角が詰まる",
  game_result_ids: [101, 102],
  practice_log_id: null,
  practice_session_id: 5,
  improvement_theme_ids: [201],
  reflection_template_id: 3,
  reflection_answers: [{ question: "課題", answer: "引きつけ" }],
  tags: [{ id: 301, name: "打撃", is_preset: true }],
  media_attachments: [],
};

function sentPayload() {
  return mockUpdateBaseballNote.mock.calls[0][1];
}

const templatesResult: FetchResult<ReflectionTemplate[]> = {
  status: "ok",
  data: [
    {
      id: 3,
      title: "試合の振り返り",
      questions: ["課題"],
      is_preset: true,
      is_default: false,
      sort_order: 1,
    },
  ],
};

const tags: NoteTag[] = [
  { id: 301, name: "打撃", is_preset: true },
  { id: 302, name: "メンタル", is_preset: false },
];

const tagsResult: FetchResult<NoteTag[]> = { status: "ok", data: tags };

function renderForm(overrides: Partial<BaseballNoteV2> = {}) {
  return render(
    <NoteEditForm
      note={{ ...note, ...overrides }}
      templatesResult={templatesResult}
      tagsResult={tagsResult}
      themesResult={{ status: "ok", data: [] }}
      linkedGameResults={[]}
    />,
  );
}

describe("NoteEditForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasEntitlement.mockReturnValue(false);
    mockIsEntitlementLoading.mockReturnValue(false);
    mockUpdateBaseballNote.mockResolvedValue({ ok: true, data: note });
  });

  it("ノートの日付・タイトル・メモを初期表示する", () => {
    renderForm();

    expect(screen.getByLabelText("タイトル")).toHaveValue("気づき");
    expect(screen.getByLabelText("日付")).toHaveValue("2026-08-01");
    expect(screen.getByLabelText("メモ")).toHaveValue(note.memo);
  });

  it("タイトルだけ変更した場合、title キーだけを送る（紐付けキーは送らない）", async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText("タイトル"), {
      target: { value: "更新後タイトル" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() =>
      expect(mockUpdateBaseballNote).toHaveBeenCalledTimes(1),
    );
    expect(mockUpdateBaseballNote.mock.calls[0][0]).toBe(12);
    expect(sentPayload()).toEqual({ title: "更新後タイトル" });
    expect(sentPayload()).not.toHaveProperty("game_result_ids");
    expect(sentPayload()).not.toHaveProperty("improvement_theme_ids");
    expect(sentPayload()).not.toHaveProperty("tag_ids");
    expect(sentPayload()).not.toHaveProperty("reflection_answers");
  });

  it("メモだけ変更した場合、memo キーだけを送る", async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText("メモ"), {
      target: { value: "書き換えたメモ" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() =>
      expect(mockUpdateBaseballNote).toHaveBeenCalledTimes(1),
    );
    expect(sentPayload()).toEqual({ memo: "書き換えたメモ" });
  });

  it("タイトルを空にした場合は null を送る", async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText("タイトル"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() =>
      expect(mockUpdateBaseballNote).toHaveBeenCalledTimes(1),
    );
    expect(sentPayload()).toEqual({ title: null });
  });

  it("変更が無ければ更新リクエストを送らずに一覧へ戻る", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/note"));
    expect(mockUpdateBaseballNote).not.toHaveBeenCalled();
  });

  it("更新失敗時はエラーメッセージを表示し、一覧へ遷移しない", async () => {
    mockUpdateBaseballNote.mockResolvedValue({
      ok: false,
      errors: ["タグ機能は Pro プラン限定です"],
    });
    renderForm();

    fireEvent.change(screen.getByLabelText("タイトル"), {
      target: { value: "更新後" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    expect(
      await screen.findByText("タグ機能は Pro プラン限定です"),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("v1 のプレーンテキスト memo でも、編集しなければ更新を送らない", async () => {
    renderForm({ memo: "素振り30分" });

    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/note"));
    expect(mockUpdateBaseballNote).not.toHaveBeenCalled();
  });

  describe("振り返りテンプレ", () => {
    const synthesizedNote: Partial<BaseballNoteV2> = {
      memo: JSON.stringify([
        {
          type: "paragraph",
          children: [{ text: "【課題】\n引きつけ\n\n【次やること】\n素振り" }],
        },
      ]),
      reflection_answers: [
        { question: "課題", answer: "引きつけ" },
        { question: "次やること", answer: "素振り" },
      ],
    };

    it("保存済みの回答を問いごとに表示する", () => {
      renderForm();

      expect(screen.getByLabelText("課題")).toHaveValue("引きつけ");
    });

    it("テンプレ名を見出しに出し、テンプレ選択チップは出さない（固定する）", () => {
      renderForm();

      expect(screen.getByText("振り返り（試合の振り返り）")).toBeVisible();
      expect(
        screen.queryByRole("group", { name: "振り返りテンプレ" }),
      ).toBeNull();
      expect(screen.queryByRole("button", { name: "なし" })).toBeNull();
    });

    it("合成されたメモは自由メモ欄へ流し込まない（回答欄との二重表示を防ぐ）", () => {
      renderForm(synthesizedNote);

      expect(screen.getByLabelText("メモ")).toHaveValue(
        '[{"type":"paragraph","children":[{"text":""}]}]',
      );
      expect(screen.getByLabelText("課題")).toHaveValue("引きつけ");
      expect(screen.getByLabelText("次やること")).toHaveValue("素振り");
    });

    it("合成メモのノートを開いただけでは更新を送らない", async () => {
      renderForm(synthesizedNote);

      fireEvent.click(screen.getByRole("button", { name: "保存" }));

      await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/note"));
      expect(mockUpdateBaseballNote).not.toHaveBeenCalled();
    });

    it("回答を編集すると reflection_answers を送り、テンプレ ID は送らない", async () => {
      renderForm();

      fireEvent.change(screen.getByLabelText("課題"), {
        target: { value: "体の開き" },
      });
      fireEvent.click(screen.getByRole("button", { name: "保存" }));

      await waitFor(() =>
        expect(mockUpdateBaseballNote).toHaveBeenCalledTimes(1),
      );
      expect(sentPayload().reflection_answers).toEqual([
        { question: "課題", answer: "体の開き" },
      ]);
      expect(sentPayload()).not.toHaveProperty("reflection_template_id");
    });

    it("合成メモのノートは回答を編集するとメモ本文も作り直す（回答との乖離を防ぐ）", async () => {
      renderForm(synthesizedNote);

      fireEvent.change(screen.getByLabelText("次やること"), {
        target: { value: "ティー" },
      });
      fireEvent.click(screen.getByRole("button", { name: "保存" }));

      await waitFor(() =>
        expect(mockUpdateBaseballNote).toHaveBeenCalledTimes(1),
      );
      expect(sentPayload().memo).toBe(
        JSON.stringify([
          {
            type: "paragraph",
            children: [
              { text: "【課題】\n引きつけ\n\n【次やること】\nティー" },
            ],
          },
        ]),
      );
    });

    it("自由メモを書いたノートは回答を編集してもメモ本文を上書きしない", async () => {
      renderForm();

      fireEvent.change(screen.getByLabelText("課題"), {
        target: { value: "体の開き" },
      });
      fireEvent.click(screen.getByRole("button", { name: "保存" }));

      await waitFor(() =>
        expect(mockUpdateBaseballNote).toHaveBeenCalledTimes(1),
      );
      expect(sentPayload()).not.toHaveProperty("memo");
    });

    it("回答を全て消した場合は空配列を明示して送る", async () => {
      renderForm();

      fireEvent.change(screen.getByLabelText("課題"), {
        target: { value: "" },
      });
      fireEvent.click(screen.getByRole("button", { name: "保存" }));

      await waitFor(() =>
        expect(mockUpdateBaseballNote).toHaveBeenCalledTimes(1),
      );
      expect(sentPayload().reflection_answers).toEqual([]);
    });

    it("回答が無いノートでは振り返りの欄自体を出さない", () => {
      renderForm({ reflection_answers: [], reflection_template_id: null });

      expect(screen.queryByLabelText("課題")).toBeNull();
      expect(screen.queryByText(/振り返り/)).toBeNull();
    });
  });

  describe("タグ", () => {
    async function saveAfter(action: () => void) {
      action();
      fireEvent.click(screen.getByRole("button", { name: "保存" }));
      await waitFor(() =>
        expect(mockUpdateBaseballNote).toHaveBeenCalledTimes(1),
      );
    }

    it("ノートに付いているタグは選択済みで表示する（# 付き）", () => {
      mockHasEntitlement.mockReturnValue(true);
      renderForm();

      expect(screen.getByRole("button", { name: "#打撃" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(screen.getByRole("button", { name: "#メンタル" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });

    it("無料ユーザーがタイトルだけ更新しても tag_ids を送らない（既存タグを消さない）", async () => {
      renderForm();

      await saveAfter(() =>
        fireEvent.change(screen.getByLabelText("タイトル"), {
          target: { value: "更新後" },
        }),
      );

      expect(sentPayload()).not.toHaveProperty("tag_ids");
    });

    it("無料ユーザーはタグを外そうとしても tag_ids を送らない", async () => {
      renderForm();

      await saveAfter(() => {
        // 暗幕の裏でも要素自体は描画されるため、押せてしまった場合も送らないことを確かめる。
        fireEvent.click(screen.getByText("#打撃"));
        fireEvent.change(screen.getByLabelText("タイトル"), {
          target: { value: "更新後" },
        });
      });

      expect(sentPayload()).not.toHaveProperty("tag_ids");
    });

    it("Pro 判定が未確定の間は tag_ids を送らない", async () => {
      mockHasEntitlement.mockReturnValue(true);
      mockIsEntitlementLoading.mockReturnValue(true);
      renderForm();

      await saveAfter(() => {
        fireEvent.click(screen.getByText("#メンタル"));
        fireEvent.change(screen.getByLabelText("タイトル"), {
          target: { value: "更新後" },
        });
      });

      expect(sentPayload()).not.toHaveProperty("tag_ids");
    });

    it("Pro ユーザーがタグを追加すると tag_ids を送る", async () => {
      mockHasEntitlement.mockReturnValue(true);
      renderForm();

      await saveAfter(() =>
        fireEvent.click(screen.getByRole("button", { name: "#メンタル" })),
      );

      expect(sentPayload().tag_ids).toEqual([301, 302]);
    });

    it("Pro ユーザーがタグを全て外すと空配列を明示して送る", async () => {
      mockHasEntitlement.mockReturnValue(true);
      renderForm();

      await saveAfter(() =>
        fireEvent.click(screen.getByRole("button", { name: "#打撃" })),
      );

      expect(sentPayload().tag_ids).toEqual([]);
    });

    it("Pro ユーザーでもタグを変えていなければ tag_ids を送らない", async () => {
      mockHasEntitlement.mockReturnValue(true);
      renderForm();

      await saveAfter(() =>
        fireEvent.change(screen.getByLabelText("タイトル"), {
          target: { value: "更新後" },
        }),
      );

      expect(sentPayload()).not.toHaveProperty("tag_ids");
    });
  });
});
