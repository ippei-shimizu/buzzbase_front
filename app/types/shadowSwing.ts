/**
 * 素振りカウンターの型定義。
 * back/app/serializers/v2/shadow_swing_session_serializer.rb と
 * Api::V2::ShadowSwingSessionsController#stats のレスポンスに対応する。
 * キー名は back の JSON をそのまま使う（snake_case のまま扱い、変換しない）。
 */

/**
 * 素振りセッション1件。開始時に作成し、完了時に本数を確定させる。
 * completed_at が null の間は未完了（練習ログもまだ作られていない）。
 */
export interface ShadowSwingSession {
  id: number;
  logged_on: string;
  target_count: number;
  swing_count: number;
  completed_at: string | null;
  /** 完了時に自動生成・加算された練習ログの id。未完了なら null。 */
  practice_log_id: number | null;
}

/**
 * 素振りの積み上げ本数。back は practice_logs（source: shadow_swing）から集計するため、
 * 未完了セッションの本数は含まれない。
 */
export interface ShadowSwingStats {
  today_count: number;
  month_count: number;
  total_count: number;
}
