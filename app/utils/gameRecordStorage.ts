import {
  GAME_RECORD_EDIT_MODE_STORAGE_KEY,
  GAME_RECORD_STORAGE_KEYS,
  GAME_RESULT_ID_STORAGE_KEY,
  RECORD_PATTERN_STORAGE_KEY,
} from "@app/constants/gameRecord";

// 試合記録フローを構成するパス。完全一致で判定する。
// 前方一致にすると /game-result/summary/:id（公開の試合詳細ページ）や
// /game-result/records-... のような別ルートまでフロー扱いになってしまう。
const GAME_RECORD_FLOW_PATHS = [
  "/game-result/record",
  "/game-result/batting",
  "/game-result/pitching",
  "/game-result/plate-appearances",
  "/game-result/summary",
] as const;

// フロー内で子ページを持つのは打席入力だけ（/new, /:id/edit）。
const GAME_RECORD_FLOW_PATH_PREFIXES = [
  "/game-result/plate-appearances",
] as const;

/**
 * 記録フローが localStorage に持つ一時状態をすべて破棄する。
 * 中断・完了など「記録フローを明示的に終わらせた」ときにだけ呼ぶこと。
 * サーバー側で呼ばれても落ちないよう window 不在時は何もしない。
 */
export function clearGameRecordStorage(): void {
  if (typeof window === "undefined") return;
  GAME_RECORD_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

/**
 * 記録中の試合が残っていない場合に限り、取り残された派生フラグを破棄する。
 *
 * gameResultId は「どの試合を記録中か」を指すポインタで、これを消すと
 * 保存済みの試合を見失い、記録画面が新しい空の試合を作り直してしまう。
 * そのため単なるフロー離脱では消さず、gameResultId が既に無いのに
 * 残っている recordPattern / gameRecordEditMode だけを掃除する。
 */
export function clearStaleGameRecordStorage(): void {
  if (typeof window === "undefined") return;
  if (readGameResultId() !== null) return;
  localStorage.removeItem(RECORD_PATTERN_STORAGE_KEY);
  localStorage.removeItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY);
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

/**
 * 記録フローで扱う試合 ID を保存する。
 * @param gameResultId フローの対象にする試合の ID
 */
export function saveGameResultId(gameResultId: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    GAME_RESULT_ID_STORAGE_KEY,
    JSON.stringify(gameResultId),
  );
}

/** 既存試合の編集としてフローに入ったかどうか。 */
export function isGameRecordEditMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY) === "true";
}

/**
 * 指定パスが試合記録フロー内かどうか。
 * @param pathname 判定対象のパス（クエリ・ハッシュを含まない）。
 *   usePathname() はマウント前に値を持たないことがあるため null / undefined を許容する。
 */
export function isGameRecordFlowPath(
  pathname: string | null | undefined,
): boolean {
  if (!pathname) return false;
  if (GAME_RECORD_FLOW_PATHS.some((path) => path === pathname)) return true;
  return GAME_RECORD_FLOW_PATH_PREFIXES.some((path) =>
    pathname.startsWith(`${path}/`),
  );
}
