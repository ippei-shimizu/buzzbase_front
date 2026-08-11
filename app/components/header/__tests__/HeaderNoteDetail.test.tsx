const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

jest.mock("@app/services/v2/baseballNoteService", () => ({
  deleteBaseballNote: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { NOTE_LIST_PATH } from "@app/constants/note";
import { deleteBaseballNote } from "@app/services/v2/baseballNoteService";
import HeaderNoteDetail from "../HeaderNoteDetail";

const mockDeleteBaseballNote = deleteBaseballNote as jest.MockedFunction<
  typeof deleteBaseballNote
>;

describe("HeaderNoteDetail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("編集リンクがノートの編集画面を指す", () => {
    render(<HeaderNoteDetail noteId={12} />);

    expect(screen.getByRole("link", { name: "ノートを編集" })).toHaveAttribute(
      "href",
      "/note/12/edit",
    );
  });

  it("戻るボタンを押すと前の画面へ戻る", () => {
    render(<HeaderNoteDetail noteId={12} />);

    fireEvent.click(screen.getByRole("button", { name: "戻る" }));

    expect(mockBack).toHaveBeenCalled();
  });

  it("削除ボタンを押すと確認ダイアログが開く", () => {
    render(<HeaderNoteDetail noteId={12} />);

    expect(
      screen.queryByText("現在のノートを削除してもよろしいですか？"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "ノートを削除" }));

    expect(
      screen.getByText("現在のノートを削除してもよろしいですか？"),
    ).toBeInTheDocument();
  });

  it("確認ダイアログで削除するとノート一覧へ遷移する", async () => {
    mockDeleteBaseballNote.mockResolvedValue({ ok: true, data: null });
    render(<HeaderNoteDetail noteId={12} />);

    fireEvent.click(screen.getByRole("button", { name: "ノートを削除" }));
    fireEvent.click(screen.getByRole("button", { name: "削除する" }));

    await waitFor(() =>
      expect(mockDeleteBaseballNote).toHaveBeenCalledWith(12),
    );
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(NOTE_LIST_PATH));
  });

  it("削除に失敗したら遷移しない", async () => {
    mockDeleteBaseballNote.mockResolvedValue({
      ok: false,
      errors: ["削除に失敗しました"],
    });
    render(<HeaderNoteDetail noteId={12} />);

    fireEvent.click(screen.getByRole("button", { name: "ノートを削除" }));
    fireEvent.click(screen.getByRole("button", { name: "削除する" }));

    await waitFor(() =>
      expect(mockDeleteBaseballNote).toHaveBeenCalledTimes(1),
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  // 失敗を黙って飲み込むと、消えたのか失敗したのかが利用者に分からない。
  it("削除に失敗したら理由を通知する", async () => {
    mockDeleteBaseballNote.mockResolvedValue({
      ok: false,
      errors: ["削除に失敗しました"],
    });
    render(<HeaderNoteDetail noteId={12} />);

    fireEvent.click(screen.getByRole("button", { name: "ノートを削除" }));
    fireEvent.click(screen.getByRole("button", { name: "削除する" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("削除に失敗しました"),
    );
  });

  it("キャンセルすると確認ダイアログが閉じる", () => {
    render(<HeaderNoteDetail noteId={12} />);

    fireEvent.click(screen.getByRole("button", { name: "ノートを削除" }));
    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(
      screen.queryByText("現在のノートを削除してもよろしいですか？"),
    ).not.toBeInTheDocument();
    expect(mockDeleteBaseballNote).not.toHaveBeenCalled();
  });
});
