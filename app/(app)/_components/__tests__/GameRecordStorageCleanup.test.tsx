import { render } from "@testing-library/react";
import {
  GAME_RECORD_EDIT_MODE_STORAGE_KEY,
  GAME_RESULT_ID_STORAGE_KEY,
  RECORD_PATTERN_STORAGE_KEY,
} from "@app/constants/gameRecord";
import GameRecordStorageCleanup from "../GameRecordStorageCleanup";

const mockPathname = jest.fn();
jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

const setRecordingState = () => {
  localStorage.setItem(GAME_RESULT_ID_STORAGE_KEY, "42");
  localStorage.setItem(RECORD_PATTERN_STORAGE_KEY, '"both"');
  localStorage.setItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY, "true");
};

// 記録が終わった（gameResultId が無い）のに残っている派生フラグ。
const setStaleState = () => {
  localStorage.setItem(RECORD_PATTERN_STORAGE_KEY, '"both"');
  localStorage.setItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY, "true");
};

const renderAt = (pathname: string | undefined) => {
  mockPathname.mockReturnValue(pathname);
  return render(<GameRecordStorageCleanup />);
};

const navigateTo = (
  pathname: string,
  rerender: (ui: React.ReactElement) => void,
) => {
  mockPathname.mockReturnValue(pathname);
  rerender(<GameRecordStorageCleanup />);
};

describe("GameRecordStorageCleanup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("記録フロー内では localStorage を保持する", () => {
    setRecordingState();

    renderAt("/game-result/plate-appearances/new");

    expect(localStorage.getItem(GAME_RESULT_ID_STORAGE_KEY)).toBe("42");
    expect(localStorage.getItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY)).toBe(
      "true",
    );
  });

  it("フロー内からフロー内へ遷移しても残骸を掃除しない", () => {
    setStaleState();
    const { rerender } = renderAt("/game-result/record");

    navigateTo("/game-result/batting", rerender);

    expect(localStorage.getItem(RECORD_PATTERN_STORAGE_KEY)).toBe('"both"');
    expect(localStorage.getItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY)).toBe(
      "true",
    );
  });

  it("フロー内からフロー外へ遷移したタイミングで残骸を掃除する", () => {
    setStaleState();
    const { rerender } = renderAt("/game-result/plate-appearances");

    expect(localStorage.getItem(RECORD_PATTERN_STORAGE_KEY)).toBe('"both"');

    navigateTo("/dashboard", rerender);

    expect(localStorage.getItem(RECORD_PATTERN_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY)).toBeNull();
  });

  it("記録中の試合はフロー外へ離脱しても保持する", () => {
    setRecordingState();
    const { rerender } = renderAt("/game-result/plate-appearances");

    navigateTo("/game-result/lists", rerender);

    expect(localStorage.getItem(GAME_RESULT_ID_STORAGE_KEY)).toBe("42");
    expect(localStorage.getItem(RECORD_PATTERN_STORAGE_KEY)).toBe('"both"');
    expect(localStorage.getItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY)).toBe(
      "true",
    );
  });

  it("パスが未確定のときは何もしない", () => {
    setStaleState();

    renderAt(undefined);

    expect(localStorage.getItem(RECORD_PATTERN_STORAGE_KEY)).toBe('"both"');
    expect(localStorage.getItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY)).toBe(
      "true",
    );
  });
});
