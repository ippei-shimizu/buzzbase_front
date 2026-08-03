// v2 野球ノート API（/api/v2/baseball_notes）の型。
// キー名は back のシリアライザ（V2::BaseballNoteSerializer）に合わせて snake_case のまま扱う。

export type MediaType = "image" | "video";
export type MediaAttachmentStatus = "pending" | "ready" | "failed";

export interface NoteTag {
  id: number;
  name: string;
  is_preset: boolean;
}

/** 振り返りテンプレの問い→回答の1組。 */
export interface ReflectionAnswer {
  question: string;
  answer: string;
}

export interface NoteMediaAttachment {
  id: number;
  media_type: MediaType;
  status: MediaAttachmentStatus;
  file_size_bytes: number | null;
  duration_seconds: number | null;
  width: number | null;
  height: number | null;
  position: number;
  memo: string | null;
  playback_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

export interface BaseballNoteV2 {
  id: number;
  title: string | null;
  date: string;
  /** Slate 互換の JSON 文字列。v1 時代のプレーンテキストが入っている場合もある。 */
  memo: string | null;
  /** back が memo から抽出・120文字で切り詰めた一覧表示用プレビュー。 */
  memo_preview: string;
  game_result_ids: number[];
  practice_log_id: number | null;
  practice_session_id: number | null;
  improvement_theme_ids: number[];
  reflection_template_id: number | null;
  reflection_answers: ReflectionAnswer[];
  tags: NoteTag[];
  media_attachments: NoteMediaAttachment[];
}

/**
 * ノートの送信パラメータ。
 *
 * back は「キーが送られていない＝変更なし」「`[]`＝全解除」という部分更新セマンティクスを取る
 * （`game_result_ids` / `improvement_theme_ids` / `tag_ids`）。そのため各キーは
 * `undefined`（送らない）と `[]`（全解除）を意味的に区別する。
 * `title` も同様で、消したい場合は `null` を明示的に送る（`undefined` では消えない）。
 */
export interface BaseballNoteInput {
  title?: string | null;
  date?: string;
  /** Slate 互換の JSON 文字列で保存する（buildMemoJson を通すこと）。 */
  memo?: string;
  practice_log_id?: number | null;
  practice_session_id?: number | null;
  reflection_template_id?: number | null;
  reflection_answers?: ReflectionAnswer[];
  game_result_ids?: number[];
  improvement_theme_ids?: number[];
  tag_ids?: number[];
}

/** 作成時は日付とメモが必須。 */
export interface BaseballNoteCreateInput extends BaseballNoteInput {
  date: string;
  memo: string;
}

/** 更新時は変更したキーだけを含める（含めなかったキーは back 側で据え置かれる）。 */
export type BaseballNoteUpdateInput = BaseballNoteInput;

/** 一覧の絞り込み条件。未指定のキーはクエリに載せない。 */
export interface BaseballNoteFilters {
  date?: string;
  practiceLogId?: number;
  practiceSessionId?: number;
  gameResultId?: number;
  improvementThemeId?: number;
}

/**
 * 取得系 Server Action の戻り値。
 * 「取得失敗」と「0件」を同じ空配列に丸めると誤った空状態を表示するため区別する。
 */
export type NoteFetchResult<T> =
  | { status: "ok"; data: T }
  | { status: "forbidden" }
  | { status: "error" };
