const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@app/services/v2/baseballNoteService", () => ({
  createBaseballNote: jest.fn(),
  updateBaseballNote: jest.fn(),
  deleteBaseballNote: jest.fn(),
}));

jest.mock("@app/services/v2/noteTagService", () => ({
  createNoteTag: jest.fn(),
}));

// 紐付け UI のガード（Pro 判定・ピッカー操作）を外し、フォームの送信ペイロード組み立てだけを検証する。
// 「変えていないならキーごと送らない」「全解除は [] を送る」はペイロード組み立ての責務。
jest.mock("@app/components/note/NoteThemeSection", () => {
  const react = jest.requireActual<typeof ReactModule>("react");
  return function StubThemeSection({
    selectedIds,
    onChange,
  }: {
    selectedIds: number[];
    onChange: (ids: number[]) => void;
  }) {
    return react.createElement(
      "div",
      null,
      react.createElement(
        "button",
        { type: "button", onClick: () => onChange([...selectedIds, 999]) },
        "課題を足す",
      ),
      react.createElement(
        "button",
        { type: "button", onClick: () => onChange([]) },
        "課題を全部外す",
      ),
      react.createElement(
        "button",
        { type: "button", onClick: () => onChange([...selectedIds].reverse()) },
        "課題を並べ替える",
      ),
    );
  };
});

jest.mock("@app/components/note/NoteGameResultSection", () => {
  const react = jest.requireActual<typeof ReactModule>("react");
  return function StubGameSection({
    selectedIds,
    onChange,
  }: {
    selectedIds: number[];
    onChange: (ids: number[]) => void;
  }) {
    return react.createElement(
      "div",
      null,
      react.createElement(
        "button",
        { type: "button", onClick: () => onChange([...selectedIds, 888]) },
        "試合を足す",
      ),
      react.createElement(
        "button",
        { type: "button", onClick: () => onChange([]) },
        "試合を全部外す",
      ),
      react.createElement(
        "button",
        { type: "button", onClick: () => onChange(selectedIds.slice(0, -1)) },
        "試合を1件外す",
      ),
    );
  };
});

jest.mock("@app/components/note/NoteTagSection", () => {
  const react = jest.requireActual<typeof ReactModule>("react");
  return function StubTagSection() {
    return react.createElement("div");
  };
});

jest.mock("next/dynamic", () => () => {
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

const mockHasEntitlement = jest.fn(() => false);

jest.mock("@app/hooks/pro/useEntitlement", () => ({
  useEntitlement: () => ({
    isPro: false,
    inTrial: false,
    inGracePeriod: false,
    isLoading: false,
    hasEntitlement: mockHasEntitlement,
  }),
}));

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({ open: jest.fn(), close: jest.fn() }),
}));

import type { BaseballNoteV2, NoteTag } from "@app/interface/baseballNoteV2";
import type { ReflectionTemplate } from "@app/interface/reflectionTemplate";
import type { FetchResult } from "@app/services/v2/requests";
import type ReactModule from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import NoteCreateForm from "@app/(app)/note/new/_components/NoteCreateForm";
import {
  createBaseballNote,
  updateBaseballNote,
} from "@app/services/v2/baseballNoteService";
import NoteEditForm from "../NoteEditForm";

const mockCreate = createBaseballNote as jest.MockedFunction<
  typeof createBaseballNote
>;
const mockUpdate = updateBaseballNote as jest.MockedFunction<
  typeof updateBaseballNote
>;

const note: BaseballNoteV2 = {
  id: 12,
  title: "気づき",
  date: "2026-08-01",
  memo: '[{"type":"paragraph","children":[{"text":"外角が詰まる"}]}]',
  memo_preview: "外角が詰まる",
  game_result_ids: [101, 102, 103],
  practice_log_id: null,
  practice_session_id: null,
  improvement_theme_ids: [201],
  reflection_template_id: null,
  reflection_answers: [],
  tags: [],
  media_attachments: [],
};

const templatesResult: FetchResult<ReflectionTemplate[]> = {
  status: "ok",
  data: [],
};
const tagsResult: FetchResult<NoteTag[]> = { status: "ok", data: [] };
const themesResult: FetchResult<never[]> = { status: "ok", data: [] };

function renderEditForm(overrides: Partial<BaseballNoteV2> = {}) {
  render(
    <NoteEditForm
      note={{ ...note, ...overrides }}
      templatesResult={templatesResult}
      tagsResult={tagsResult}
      themesResult={themesResult}
      linkedGameResults={[]}
    />,
  );
}

function renderCreateForm() {
  render(
    <NoteCreateForm
      templatesResult={templatesResult}
      tagsResult={tagsResult}
      themesResult={themesResult}
    />,
  );
  fireEvent.change(screen.getByLabelText("タイトル"), {
    target: { value: "気づき" },
  });
}

function save() {
  fireEvent.click(screen.getByRole("button", { name: "保存" }));
}

async function sentUpdate() {
  await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
  return mockUpdate.mock.calls[0][1];
}

async function sentCreate() {
  await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
  return mockCreate.mock.calls[0][0];
}

describe("ノート更新時の紐付けペイロード", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasEntitlement.mockReturnValue(false);
    mockCreate.mockResolvedValue({ ok: true, data: note });
    mockUpdate.mockResolvedValue({ ok: true, data: note });
  });

  it("紐付けを触らなければ紐付けのキーを一切送らない（既存の紐付けを消さない）", async () => {
    renderEditForm();
    fireEvent.change(screen.getByLabelText("タイトル"), {
      target: { value: "更新後" },
    });

    save();

    const payload = await sentUpdate();
    expect(payload).not.toHaveProperty("improvement_theme_ids");
    expect(payload).not.toHaveProperty("game_result_ids");
    expect(payload.title).toBe("更新後");
  });

  it("課題を全解除したときは空配列を明示して送る", async () => {
    renderEditForm();

    fireEvent.click(screen.getByRole("button", { name: "課題を全部外す" }));
    save();

    const payload = await sentUpdate();
    expect(payload.improvement_theme_ids).toEqual([]);
    // 触っていない試合の紐付けは巻き込まない。
    expect(payload).not.toHaveProperty("game_result_ids");
  });

  it("試合を全解除したときは空配列を明示して送る", async () => {
    renderEditForm();

    fireEvent.click(screen.getByRole("button", { name: "試合を全部外す" }));
    save();

    const payload = await sentUpdate();
    expect(payload.game_result_ids).toEqual([]);
    expect(payload).not.toHaveProperty("improvement_theme_ids");
  });

  it("課題を足したときはその内容を送る", async () => {
    renderEditForm();

    fireEvent.click(screen.getByRole("button", { name: "課題を足す" }));
    save();

    expect((await sentUpdate()).improvement_theme_ids).toEqual([201, 999]);
  });

  it("並び替えただけならキーを送らない（集合として同じなら変更なし）", async () => {
    renderEditForm({ improvement_theme_ids: [201, 202] });
    fireEvent.change(screen.getByLabelText("タイトル"), {
      target: { value: "更新後" },
    });

    fireEvent.click(screen.getByRole("button", { name: "課題を並べ替える" }));
    save();

    expect(await sentUpdate()).not.toHaveProperty("improvement_theme_ids");
  });

  it("無料ユーザーでも既存の複数紐付けを減らして保存できる（グランドファザリング）", async () => {
    renderEditForm();

    fireEvent.click(screen.getByRole("button", { name: "試合を1件外す" }));
    save();

    expect((await sentUpdate()).game_result_ids).toEqual([101, 102]);
  });

  it("紐付けだけを変えた場合も保存できる", async () => {
    renderEditForm();

    fireEvent.click(screen.getByRole("button", { name: "課題を足す" }));
    save();

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
    expect(mockPush).toHaveBeenCalledWith("/note");
  });
});

describe("ノート作成時の紐付けペイロード", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasEntitlement.mockReturnValue(false);
    mockCreate.mockResolvedValue({ ok: true, data: note });
  });

  it("紐付けが無ければ紐付けのキーを送らない", async () => {
    renderCreateForm();

    save();

    const payload = await sentCreate();
    expect("improvement_theme_ids" in payload).toBe(false);
    expect("game_result_ids" in payload).toBe(false);
  });

  it("選んだ課題・試合を送る", async () => {
    renderCreateForm();

    fireEvent.click(screen.getByRole("button", { name: "課題を足す" }));
    fireEvent.click(screen.getByRole("button", { name: "試合を足す" }));
    save();

    const payload = await sentCreate();
    expect(payload.improvement_theme_ids).toEqual([999]);
    expect(payload.game_result_ids).toEqual([888]);
  });
});
