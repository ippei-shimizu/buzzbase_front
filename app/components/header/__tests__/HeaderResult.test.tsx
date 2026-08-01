import { fireEvent, render, screen } from "@testing-library/react";
import HeaderResult from "@app/components/header/HeaderResult";
import {
  GAME_RECORD_EDIT_MODE_STORAGE_KEY,
  GAME_RESULT_ID_STORAGE_KEY,
  RECORD_PATTERN_STORAGE_KEY,
} from "@app/constants/gameRecord";

const mockPush = jest.fn();
const mockPathname = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname(),
}));

const setRecordingState = () => {
  localStorage.setItem(GAME_RESULT_ID_STORAGE_KEY, "42");
  localStorage.setItem(RECORD_PATTERN_STORAGE_KEY, '"both"');
};

const renderAt = (pathname: string) => {
  mockPathname.mockReturnValue(pathname);
  return render(<HeaderResult />);
};

const clickAbort = () => {
  fireEvent.click(screen.getByRole("button", { name: "中断" }));
};

describe("HeaderResult", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockPathname.mockReturnValue("/game-result/record");
  });

  it("中断ボタンを押すまで確認ダイアログは表示されない", () => {
    renderAt("/game-result/record");

    expect(screen.queryByText("入力を中断しますか？")).not.toBeInTheDocument();
  });

  it("試合情報入力中は保存されない旨を伝える", () => {
    setRecordingState();
    renderAt("/game-result/record");

    clickAbort();

    expect(screen.getByText("入力を中断しますか？")).toBeInTheDocument();
    expect(
      screen.getByText("入力中の試合情報は保存されません。"),
    ).toBeInTheDocument();
  });

  it.each([
    "/game-result/batting",
    "/game-result/pitching",
    "/game-result/plate-appearances",
    "/game-result/plate-appearances/new",
  ])("試合情報の保存後（%s）は保存済みが残ることを伝える", (pathname) => {
    setRecordingState();
    renderAt(pathname);

    clickAbort();

    expect(
      screen.getByText(
        "保存済みの試合結果は試合一覧に残ります。入力途中の内容は破棄されます。",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("入力中の試合情報は保存されません。"),
    ).not.toBeInTheDocument();
  });

  it("試合情報が保存済みなら試合情報入力画面でも保存済みが残ることを伝える", () => {
    setRecordingState();
    mockPathname.mockReturnValue("/game-result/record");
    render(<HeaderResult isMatchResultSaved />);

    clickAbort();

    expect(
      screen.getByText(
        "保存済みの試合結果は試合一覧に残ります。入力途中の内容は破棄されます。",
      ),
    ).toBeInTheDocument();
  });

  it("中断を確定すると記録フローの localStorage が全てクリアされ試合一覧へ遷移する", () => {
    setRecordingState();
    renderAt("/game-result/record");

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
    renderAt("/game-result/record");

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
    renderAt("/game-result/batting");

    clickAbort();

    expect(screen.getByText("編集を中断しますか？")).toBeInTheDocument();
    expect(
      screen.getByText(
        "保存済みの内容は残りますが、編集中の内容は破棄されます。",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "中断する" }));

    expect(mockPush).toHaveBeenCalledWith("/game-result/summary/42");
    expect(localStorage.getItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY)).toBeNull();
  });

  describe("リロード警告", () => {
    // jsdom の Event.returnValue は defaultPrevented の別名（boolean）で文字列を保持しないため、
    // 登録されたハンドラを直接取り出して引数への副作用を検証する。
    const captureBeforeUnloadHandler = () => {
      const addSpy = jest.spyOn(window, "addEventListener");
      const removeSpy = jest.spyOn(window, "removeEventListener");
      const { unmount } = renderAt("/game-result/record");
      const registered = addSpy.mock.calls.filter(
        ([type]) => type === "beforeunload",
      );

      return { registered, removeSpy, unmount };
    };

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("マウント時に beforeunload を登録し、離脱をキャンセル扱いにする", () => {
      const { registered } = captureBeforeUnloadHandler();

      expect(registered).toHaveLength(1);

      const handler = registered[0][1] as (event: BeforeUnloadEvent) => void;
      const event = {
        preventDefault: jest.fn(),
        returnValue: "untouched",
      } as unknown as BeforeUnloadEvent;
      handler(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.returnValue).toBe("");
    });

    it("アンマウント時に beforeunload を解除する", () => {
      const { registered, removeSpy, unmount } = captureBeforeUnloadHandler();
      const handler = registered[0][1];

      unmount();

      expect(removeSpy).toHaveBeenCalledWith("beforeunload", handler);
    });

    it("記録フロー表示中はブラウザの離脱確認が有効になる", () => {
      renderAt("/game-result/record");

      const event = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
    });
  });
});
