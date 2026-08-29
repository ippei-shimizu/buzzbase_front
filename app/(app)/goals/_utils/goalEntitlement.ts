import type { GoalKind, GoalPeriodType } from "@app/types/goal";
import type { Feature, ProFeature } from "@app/types/pro";

/**
 * Pro 限定になる期間タイプ → entitlement キー。
 * back/app/controllers/api/v2/goals_controller.rb の allowed_to_create? と対応させる。
 * ここに無い期間タイプ（monthly / weekly / yearly）は無料でも作成でき、件数だけが制限される。
 */
const PERIOD_GATE_FEATURES: Partial<Record<GoalPeriodType, ProFeature>> = {
  season: "season_goals",
  tournament: "tournament_goals",
  custom: "custom_period_goals",
};

/** その期間タイプが Pro 限定なら entitlement キー、無料で作れるなら null。 */
export function goalPeriodGateFeature(
  periodType: GoalPeriodType,
): ProFeature | null {
  return PERIOD_GATE_FEATURES[periodType] ?? null;
}

/**
 * 作成が 403 になったとき、back がどのゲートで弾いたか。
 *
 * back/app/controllers/api/v2/goals_controller.rb の render_limit_error と同じ優先順で決める
 * （自由指標 → 期間タイプ → 個人の期間目標の件数上限）。
 * クライアントの entitlement は参照しない。手元の Pro 状態が古いまま 403 を受けたときこそ、
 * 送った内容から原因を特定する必要があるため。
 */
export function goalForbiddenFeature(target: {
  kind: GoalKind;
  periodType: GoalPeriodType;
}): ProFeature {
  if (target.kind === "manual") return "manual_metric_goals";
  return goalPeriodGateFeature(target.periodType) ?? "unlimited_monthly_goals";
}

/**
 * 新規作成をブロックしている Pro 機能。作成できるなら null。
 *
 * 自由指標（manual）を先に見るのは back の allowed_to_create? と同じ順序にするため。
 * 例えば「自由指標 × カスタム期間」を無料で作ろうとしたとき、back が返す 403 は
 * 自由指標の文言なので、フロントの訴求もそれに合わせる。
 *
 * 個人の期間目標の件数上限はここでは扱わない（entitlement ではなく保有件数で決まるため）。
 */
export function lockedGoalFeature(
  target: { kind: GoalKind; periodType: GoalPeriodType },
  hasEntitlement: (feature: Feature) => boolean,
): ProFeature | null {
  if (target.kind === "manual" && !hasEntitlement("manual_metric_goals")) {
    return "manual_metric_goals";
  }
  const periodGate = goalPeriodGateFeature(target.periodType);
  if (periodGate !== null && !hasEntitlement(periodGate)) return periodGate;
  return null;
}
