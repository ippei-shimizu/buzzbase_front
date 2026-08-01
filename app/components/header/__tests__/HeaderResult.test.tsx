import { fireEvent, render, screen } from "@testing-library/react";
import HeaderResult from "@app/components/header/HeaderResult";
import {
  GAME_RECORD_EDIT_MODE_STORAGE_KEY,
  GAME_RESULT_ID_STORAGE_KEY,
  RECORD_PATTERN_STORAGE_KEY,
} from "@app/constants/gameRecord";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const setRecordingState = () => {
  localStorage.setItem(GAME_RESULT_ID_STORAGE_KEY, "42");
  localStorage.setItem(RECORD_PATTERN_STORAGE_KEY, '"both"');
};

const clickAbort = () => {
  fireEvent.click(screen.getByRole("button", { name: "中断" }));
};

describe("HeaderResult", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("中断ボタンを押すまで確認ダイアログは表示されない", () => {
    render(<HeaderResult />);

    expect(screen.queryByText("入力を中断しますか？")).not.toBeInTheDocument();
  });

  it("中断ボタンを押すと確認ダイアログが表示される", () => {
    setRecordingState();
    render(<HeaderResult />);

    clickAbort();

    expect(screen.getByText("入力を中断しますか？")).toBeInTheDocument();
    expect(
      screen.getByText("入力中のデータは破棄されます。"),
    ).toBeInTheDocument();
  });

  it("中断を確定すると記録フローの localStorage が全てクリアされ試合一覧へ遷移する", () => {
    setRecordingState();
    render(<HeaderResult />);

    clickAbort();
    fireEvent.click(screen.getByRole("button", { name: "中断する" }));

    expect(localStorage.getItem(GAME_RESULT_ID_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(RECORD_PATTERN_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY)).toBeNull();
    expect(mockPush).toHaveBeenCalledWith("/game-result/lists");
  });

  it("キャンセルすると localStorage は保持され遷移もしない", () => {
    setRecordingState();
    localStorage.setItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY, "true");
    render(<HeaderResult />);

    clickAbort();
    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(localStorage.getItem(GAME_RESULT_ID_STORAGE_KEY)).toBe("42");
    expect(localStorage.getItem(RECORD_PATTERN_STORAGE_KEY)).toBe('"both"');
    expect(localStorage.getItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY)).toBe(
      "true",
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("編集モードでは編集向けの文言を出し、中断すると試合詳細へ戻る", () => {
    setRecordingState();
    localStorage.setItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY, "true");
    render(<HeaderResult />);

    clickAbort();

    expect(screen.getByText("編集を中断しますか？")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "中断する" }));

    expect(mockPush).toHaveBeenCalledWith("/game-result/summary/42");
    expect(localStorage.getItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY)).toBeNull();
  });

  it("編集中に中断した後は次の記録が編集モード扱いにならない", () => {
    setRecordingState();
    localStorage.setItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY, "true");
    render(<HeaderResult />);

    clickAbort();
    fireEvent.click(screen.getByRole("button", { name: "中断する" }));

    // 記録画面は編集フラグの有無で編集モードを判定するため、残っていないことを担保する。
    expect(localStorage.getItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY)).not.toBe(
      "true",
    );
  });
});
