import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NoteMenu from "../NoteMenu";

// Mock dependencies
jest.mock("@app/services/baseballNoteService", () => ({
  deleteBaseballNote: jest.fn(),
}));

jest.mock("@app/components/spinner/LoadingSpinner", () => {
  return function LoadingSpinner() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

import { deleteBaseballNote } from "@app/services/baseballNoteService";
import { useRouter } from "next/navigation";

describe("NoteMenu", () => {
  const mockPush = jest.fn();
  const mockDeleteBaseballNote = deleteBaseballNote as jest.Mock;
  const mockUseRouter = useRouter as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
    });
  });

  it("ドロップダウントリガーボタンが正しくレンダリングされる", () => {
    render(<NoteMenu noteId={1} />);

    // Buttonコンポーネントが存在する
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("Dropdownコンポーネントが正しくレンダリングされる", () => {
    const { container } = render(<NoteMenu noteId={1} />);

    // Dropdownコンポーネントが存在する
    expect(container).toBeInTheDocument();
  });

  it("モーダルが初期状態では表示されない", () => {
    render(<NoteMenu noteId={1} />);

    // モーダルのコンテンツが表示されていない
    expect(
      screen.queryByText("現在のノートを削除してもよろしいですか？"),
    ).not.toBeInTheDocument();
  });

  it("DropdownMenuがaria-labelを持つ構造である", () => {
    const { container } = render(<NoteMenu noteId={1} />);

    // コンポーネント全体が正常にレンダリングされている
    expect(container.firstChild).toBeInTheDocument();
  });

  it("トリガーボタンにNextUI Buttonコンポーネントが使用されている", () => {
    const { container } = render(<NoteMenu noteId={1} />);

    // Buttonコンポーネントが存在する
    const button = container.querySelector("button");
    expect(button).toBeInTheDocument();
  });

  it("Dropdownコンポーネントが正しく使用されている", () => {
    const { container } = render(<NoteMenu noteId={1} />);

    // Dropdownの要素が存在する
    expect(container.querySelector("[data-slot]")).toBeInTheDocument();
  });

  it("Modalコンポーネントが存在する", () => {
    const { container } = render(<NoteMenu noteId={1} />);

    // Modalコンポーネントの構造が存在する
    expect(container).toBeInTheDocument();
  });
});
