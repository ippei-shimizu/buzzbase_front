const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@app/services/v2/baseballNoteService", () => ({
  createBaseballNote: jest.fn(),
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
import { createBaseballNote } from "@app/services/v2/baseballNoteService";
import NoteCreateForm from "../NoteCreateForm";

const mockCreateBaseballNote = createBaseballNote as jest.MockedFunction<
  typeof createBaseballNote
>;

const templates: ReflectionTemplate[] = [
  {
    id: 3,
    title: "試合の振り返り",
    questions: ["良かった点", "次やること"],
    is_preset: true,
    is_default: false,
    sort_order: 1,
  },
  {
    id: 8,
    title: "練習の振り返り",
    questions: ["意識したこと"],
    is_preset: false,
    is_default: false,
    sort_order: 2,
  },
];

const createdNote = { id: 1 } as BaseballNoteV2;

const tags: NoteTag[] = [
  { id: 11, name: "打撃", is_preset: true },
  { id: 12, name: "メンタル", is_preset: false },
];

const tagsResult: FetchResult<NoteTag[]> = { status: "ok", data: tags };

function renderForm(
  templatesResult: FetchResult<ReflectionTemplate[]> = {
    status: "ok",
    data: templates,
  },
) {
  return render(
    <NoteCreateForm
      templatesResult={templatesResult}
      tagsResult={tagsResult}
      themesResult={{ status: "ok", data: [] }}
    />,
  );
}

/** `note_tags` entitlement を持つ Pro ユーザーとして描画する。 */
function asProUser() {
  mockHasEntitlement.mockReturnValue(true);
}

/** Pro 判定がまだ確定していない状態にする。 */
function asResolvingUser() {
  mockHasEntitlement.mockReturnValue(true);
  mockIsEntitlementLoading.mockReturnValue(true);
}

function sentPayload() {
  return mockCreateBaseballNote.mock.calls[0][0];
}

async function save() {
  fireEvent.click(screen.getByRole("button", { name: "保存" }));
  await waitFor(() => expect(mockCreateBaseballNote).toHaveBeenCalledTimes(1));
}

describe("NoteCreateForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasEntitlement.mockReturnValue(false);
    mockIsEntitlementLoading.mockReturnValue(false);
    mockCreateBaseballNote.mockResolvedValue({ ok: true, data: createdNote });
  });

  it("テンプレを選ぶとその問いが回答欄として並ぶ", () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "試合の振り返り" }));

    expect(screen.getByLabelText("良かった点")).toBeVisible();
    expect(screen.getByLabelText("次やること")).toBeVisible();
  });

  it("テンプレを選んで回答すると reflection_template_id と reflection_answers を送る", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "試合の振り返り" }));
    fireEvent.change(screen.getByLabelText("良かった点"), {
      target: { value: "初球から振れた" },
    });
    await save();

    expect(sentPayload().reflection_template_id).toBe(3);
    expect(sentPayload().reflection_answers).toEqual([
      { question: "良かった点", answer: "初球から振れた" },
    ]);
  });

  it("メモ未入力ならテンプレ回答からメモ本文を合成する", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "試合の振り返り" }));
    fireEvent.change(screen.getByLabelText("良かった点"), {
      target: { value: "初球から振れた" },
    });
    fireEvent.change(screen.getByLabelText("次やること"), {
      target: { value: "ティー" },
    });
    await save();

    expect(sentPayload().memo).toBe(
      JSON.stringify([
        {
          type: "paragraph",
          children: [
            {
              text: "【良かった点】\n初球から振れた\n\n【次やること】\nティー",
            },
          ],
        },
      ]),
    );
  });

  it("メモを入力していればテンプレ回答で上書きしない", async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText("メモ"), {
      target: {
        value: '[{"type":"paragraph","children":[{"text":"自分の言葉"}]}]',
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "試合の振り返り" }));
    fireEvent.change(screen.getByLabelText("良かった点"), {
      target: { value: "初球から振れた" },
    });
    await save();

    expect(sentPayload().memo).toBe(
      '[{"type":"paragraph","children":[{"text":"自分の言葉"}]}]',
    );
  });

  it("テンプレを切り替えて戻しても入力済みの回答は残る", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "試合の振り返り" }));
    fireEvent.change(screen.getByLabelText("良かった点"), {
      target: { value: "初球から振れた" },
    });
    fireEvent.click(screen.getByRole("button", { name: "練習の振り返り" }));
    fireEvent.click(screen.getByRole("button", { name: "試合の振り返り" }));

    expect(screen.getByLabelText("良かった点")).toHaveValue("初球から振れた");
  });

  it("テンプレを「なし」に戻すと回答欄が消え、テンプレ ID も送らない", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "試合の振り返り" }));
    fireEvent.click(screen.getByRole("button", { name: "なし" }));

    expect(screen.queryByLabelText("良かった点")).toBeNull();

    fireEvent.change(screen.getByLabelText("タイトル"), {
      target: { value: "気づき" },
    });
    await save();

    expect(sentPayload().reflection_template_id).toBeNull();
    expect(sentPayload().reflection_answers).toEqual([]);
  });

  it("未入力の問いは送らない", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "試合の振り返り" }));
    fireEvent.change(screen.getByLabelText("良かった点"), {
      target: { value: "初球から振れた" },
    });
    await save();

    expect(sentPayload().reflection_answers).toEqual([
      { question: "良かった点", answer: "初球から振れた" },
    ]);
  });

  it("タイトルもメモも空でもテンプレ回答があれば保存できる", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "練習の振り返り" }));
    fireEvent.change(screen.getByLabelText("意識したこと"), {
      target: { value: "低い姿勢" },
    });
    await save();

    expect(mockPush).toHaveBeenCalledWith("/note");
  });

  it("タイトル・メモ・回答が全て空なら保存しない", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    expect(
      await screen.findByText(
        "タイトルとメモ内容のどちらかを入力してください。",
      ),
    ).toBeInTheDocument();
    expect(mockCreateBaseballNote).not.toHaveBeenCalled();
  });

  it("テンプレの取得に失敗したらチップを出さず、テンプレ未作成とは伝えない", () => {
    renderForm({ status: "error" });

    expect(
      screen.getByText(
        "振り返りテンプレを取得できませんでした。メモはそのまま入力できます。",
      ),
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: "試合の振り返り" })).toBeNull();
  });
});

describe("NoteCreateForm のタグ送信", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasEntitlement.mockReturnValue(false);
    mockIsEntitlementLoading.mockReturnValue(false);
    mockCreateBaseballNote.mockResolvedValue({ ok: true, data: createdNote });
  });

  async function fillTitleAndSave() {
    fireEvent.change(screen.getByLabelText("タイトル"), {
      target: { value: "気づき" },
    });
    await save();
  }

  it("無料ユーザーはタグを選ぼうとしても tag_ids キー自体を送らない", async () => {
    renderForm();
    // 暗幕の裏でも要素自体は描画されるため、押せてしまった場合も送らないことを確かめる。
    fireEvent.click(screen.getByText("#打撃"));

    await fillTitleAndSave();

    expect("tag_ids" in sentPayload()).toBe(false);
  });

  it("Pro 判定が未確定の間は tag_ids キー自体を送らない", async () => {
    asResolvingUser();
    renderForm();
    fireEvent.click(screen.getByText("#打撃"));

    await fillTitleAndSave();

    expect("tag_ids" in sentPayload()).toBe(false);
  });

  it("Pro ユーザーは選択したタグを tag_ids で送る", async () => {
    asProUser();
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: "#打撃" }));
    fireEvent.click(screen.getByRole("button", { name: "#メンタル" }));

    await fillTitleAndSave();

    expect(sentPayload().tag_ids).toEqual([11, 12]);
  });

  it("Pro ユーザーが何も選ばなければ空配列を送る", async () => {
    asProUser();
    renderForm();

    await fillTitleAndSave();

    expect(sentPayload().tag_ids).toEqual([]);
  });
});
