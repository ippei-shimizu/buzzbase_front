import type { ProFeature, ProStatus } from "@app/types/pro";
import { DEFAULT_PRO_STATUS } from "@app/types/pro";

/** 推移グラフのシーズン粒度に必要な entitlement。 */
export const SEASON_TREND_FEATURES: readonly ProFeature[] = [
  "season_transition_graph",
];

/**
 * サーバー側で閲覧可と判定できる Pro 機能を絞り込む。
 * クライアントの Pro 判定が確定するまでの初期値に使い、Pro ユーザーの表示や
 * 粒度切替が一瞬 Paywall に倒れるのを防ぐ。
 *
 * @param proStatus 未認証・取得失敗時は null（無料の entitlements として扱う）
 * @param candidates 判定したい機能
 * @returns candidates のうち閲覧できるものだけ
 */
export function grantedProFeatures(
  proStatus: ProStatus | null,
  candidates: readonly ProFeature[],
): ProFeature[] {
  const entitlements =
    proStatus?.entitlements ?? DEFAULT_PRO_STATUS.entitlements;
  return candidates.filter((feature) => entitlements.includes(feature));
}
