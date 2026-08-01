import {
  GAME_RECORD_EDIT_MODE_STORAGE_KEY,
  GAME_RECORD_STORAGE_KEYS,
  GAME_RESULT_ID_STORAGE_KEY,
} from "@app/constants/gameRecord";

// 試合記録フローを構成するパス。ここから外れたら記録の一時状態は不要になる。
const GAME_RECORD_FLOW_PATHS = [
  "/game-result/record",
  "/game-result/batting",
  "/game-result/pitching",
  "/game-result/plate-appearances",
  "/game-result/summary",
] as const;

/**
 * 記録フローが localStorage に持つ一時状態をすべて破棄する。
 * サーバー側で呼ばれても落ちないよう window 不在時は何もしない。
 */
export function clearGameRecordStorage(): void {
  if (typeof window === "undefined") return;
  GAME_RECORD_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

/**
 * 記録中の試合 ID を取得する。
 * @returns 保存されていない、または壊れた値が入っている場合は null
 */
export function readGameResultId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(GAME_RESULT_ID_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "number" ? parsed : null;
  } catch {
    return null;
  }
}

/** 既存試合の編集としてフローに入ったかどうか。 */
export function isGameRecordEditMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY) === "true";
}

/**
 * 指定パスが試合記録フロー内かどうか。
 * @param pathname 判定対象のパス（クエリ・ハッシュを含まない）
 */
export function isGameRecordFlowPath(pathname: string): boolean {
  return GAME_RECORD_FLOW_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}
