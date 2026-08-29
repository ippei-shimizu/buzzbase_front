"use server";

import type {
  ShadowSwingSession,
  ShadowSwingStats,
} from "@app/types/shadowSwing";
import {
  type FetchResult,
  type MutationResult,
  fetchV2,
  mutateV2,
} from "./requests";

const BASE_PATH = "/api/v2/shadow_swing_sessions";

/**
 * 素振りセッションを開始する（POST /api/v2/shadow_swing_sessions）。
 * 素振りカウンター自体は無料機能（entitlement: shadow_swing_basic）なので 403 は返らない。
 * 作成したセッションは完了するまで practice_log を持たないため、
 * 開始しただけで積み上げ本数（stats）は変化しない。
 *
 * @param targetCount 目標本数（back で 0 より大きいことを検証する）
 */
export async function startShadowSwingSession(
  targetCount: number,
): Promise<MutationResult<ShadowSwingSession>> {
  return mutateV2<ShadowSwingSession>(BASE_PATH, {
    method: "POST",
    body: { shadow_swing_session: { target_count: targetCount } },
    action: "startShadowSwingSession",
    fallbackMessage: "素振りを開始できませんでした",
  });
}

/**
 * 素振りセッションを完了し、本数を練習ログへ保存する
 * （POST /api/v2/shadow_swing_sessions/:id/complete）。
 * back の complete! は completed_at があるセッションを素通りさせる冪等な実装なので、
 * 通信失敗時にそのまま再送してよい（本数が二重計上されることはない）。
 *
 * @param id 開始時に受け取ったセッション id
 * @param swingCount 実際に振った本数
 */
export async function completeShadowSwingSession(
  id: number,
  swingCount: number,
): Promise<MutationResult<ShadowSwingSession>> {
  return mutateV2<ShadowSwingSession>(`${BASE_PATH}/${id}/complete`, {
    method: "POST",
    body: { shadow_swing_session: { swing_count: swingCount } },
    action: "completeShadowSwingSession",
    fallbackMessage: "素振りの記録を保存できませんでした",
  });
}

/**
 * 今日・今月・通算の素振り本数を取得する（GET /api/v2/shadow_swing_sessions/stats）。
 * 記録が無ければ 0 が返る（status:"ok"）。取得に失敗したときは status:"error" で、
 * 「まだ0本」と「取得できなかった」を呼び出し側が取り違えないようにする。
 */
export async function getShadowSwingStats(): Promise<
  FetchResult<ShadowSwingStats>
> {
  return fetchV2<ShadowSwingStats>(`${BASE_PATH}/stats`, "getShadowSwingStats");
}
