const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@app/services/v2/baseballNoteService", () => ({
  updateBaseballNote: jest.fn(),
  deleteBaseballNote: jest.fn(),
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

import type { BaseballNoteV2 } from "@app/interface/baseballNoteV2";
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

describe("NoteEditForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateBaseballNote.mockResolvedValue({ ok: true, data: note });
  });

  it("ノートの日付・タイトル・メモを初期表示する", () => {
    render(<NoteEditForm note={note} />);

    expect(screen.getByLabelText("タイトル")).toHaveValue("気づき");
    expect(screen.getByLabelText("日付")).toHaveValue("2026-08-01");
    expect(screen.getByLabelText("メモ")).toHaveValue(note.memo);
  });

  it("タイトルだけ変更した場合、title キーだけを送る（紐付けキーは送らない）", async () => {
    render(<NoteEditForm note={note} />);

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
    render(<NoteEditForm note={note} />);

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
    render(<NoteEditForm note={note} />);

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
    render(<NoteEditForm note={note} />);

    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/note"));
    expect(mockUpdateBaseballNote).not.toHaveBeenCalled();
  });

  it("更新失敗時はエラーメッセージを表示し、一覧へ遷移しない", async () => {
    mockUpdateBaseballNote.mockResolvedValue({
      ok: false,
      errors: ["タグ機能は Pro プラン限定です"],
    });
    render(<NoteEditForm note={note} />);

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
    render(<NoteEditForm note={{ ...note, memo: "素振り30分" }} />);

    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/note"));
    expect(mockUpdateBaseballNote).not.toHaveBeenCalled();
  });
});
