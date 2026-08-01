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

describe("GameRecordStorageCleanup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("記録フロー内では localStorage を保持する", () => {
    setRecordingState();
    mockPathname.mockReturnValue("/game-result/plate-appearances/new");

    render(<GameRecordStorageCleanup />);

    expect(localStorage.getItem(GAME_RESULT_ID_STORAGE_KEY)).toBe("42");
    expect(localStorage.getItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY)).toBe(
      "true",
    );
  });

  it("記録フロー外へ遷移すると localStorage をクリアする", () => {
    setRecordingState();
    mockPathname.mockReturnValue("/dashboard");

    render(<GameRecordStorageCleanup />);

    expect(localStorage.getItem(GAME_RESULT_ID_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(RECORD_PATTERN_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY)).toBeNull();
  });
});
