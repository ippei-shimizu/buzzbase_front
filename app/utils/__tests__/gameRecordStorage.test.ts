import {
  GAME_RECORD_EDIT_MODE_STORAGE_KEY,
  GAME_RESULT_ID_STORAGE_KEY,
  RECORD_PATTERN_STORAGE_KEY,
} from "@app/constants/gameRecord";
import {
  clearGameRecordStorage,
  isGameRecordEditMode,
  isGameRecordFlowPath,
  readGameResultId,
} from "@app/utils/gameRecordStorage";

describe("gameRecordStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("clearGameRecordStorage", () => {
    it("記録フローが使う localStorage のキーを全て削除する", () => {
      localStorage.setItem(GAME_RESULT_ID_STORAGE_KEY, "1");
      localStorage.setItem(RECORD_PATTERN_STORAGE_KEY, '"both"');
      localStorage.setItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY, "true");

      clearGameRecordStorage();

      expect(localStorage.getItem(GAME_RESULT_ID_STORAGE_KEY)).toBeNull();
      expect(localStorage.getItem(RECORD_PATTERN_STORAGE_KEY)).toBeNull();
      expect(
        localStorage.getItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY),
      ).toBeNull();
    });

    it("記録フロー以外のキーは残す", () => {
      localStorage.setItem("smart_app_banner_dismissed_at", "1700000000000");

      clearGameRecordStorage();

      expect(localStorage.getItem("smart_app_banner_dismissed_at")).toBe(
        "1700000000000",
      );
    });
  });

  describe("readGameResultId", () => {
    it("保存された試合IDを数値で返す", () => {
      localStorage.setItem(GAME_RESULT_ID_STORAGE_KEY, "42");

      expect(readGameResultId()).toBe(42);
    });

    it("未保存・壊れた値のときは null を返す", () => {
      expect(readGameResultId()).toBeNull();

      localStorage.setItem(GAME_RESULT_ID_STORAGE_KEY, "{invalid");
      expect(readGameResultId()).toBeNull();

      localStorage.setItem(GAME_RESULT_ID_STORAGE_KEY, '"42"');
      expect(readGameResultId()).toBeNull();
    });
  });

  describe("isGameRecordEditMode", () => {
    it("編集フラグが立っているときだけ true", () => {
      expect(isGameRecordEditMode()).toBe(false);

      localStorage.setItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY, "true");
      expect(isGameRecordEditMode()).toBe(true);
    });
  });

  describe("isGameRecordFlowPath", () => {
    it.each([
      "/game-result/record",
      "/game-result/batting",
      "/game-result/pitching",
      "/game-result/plate-appearances",
      "/game-result/plate-appearances/new",
      "/game-result/plate-appearances/12/edit",
      "/game-result/summary",
      "/game-result/summary/12",
    ])("記録フローのパス %s は true", (pathname) => {
      expect(isGameRecordFlowPath(pathname)).toBe(true);
    });

    it.each(["/dashboard", "/game-result/lists", "/mypage/buzz", "/"])(
      "記録フロー外のパス %s は false",
      (pathname) => {
        expect(isGameRecordFlowPath(pathname)).toBe(false);
      },
    );
  });
});
