import type {
  ConditionInput,
  Injury,
  PracticeSession,
} from "@app/types/practice";
import { parseDecimal } from "@app/constants/practice";

/**
 * コンディション入力の編集状態。
 * 睡眠時間は「7.」のような打鍵途中を数値へ丸めないよう文字列で持つ。
 */
export interface ConditionDraft {
  fatigue_level: number | null;
  physical_level: number | null;
  sleep_hours: string;
  mood: string | null;
  memo: string;
  injuries: Injury[];
}

export const EMPTY_CONDITION_DRAFT: ConditionDraft = {
  fatigue_level: null,
  physical_level: null,
  sleep_hours: "",
  mood: null,
  memo: "",
  injuries: [],
};

/**
 * 既存セッションのコンディションを編集状態へ読み込む。
 * back の decimal は "7.0" のような文字列で返るため、睡眠時間は数値化してから文字列に戻す。
 */
export function buildInitialCondition(
  session: PracticeSession | null,
): ConditionDraft {
  const condition = session?.condition;
  if (!condition) return EMPTY_CONDITION_DRAFT;

  const sleepHours = parseDecimal(condition.sleep_hours);
  return {
    fatigue_level: condition.fatigue_level,
    physical_level: condition.physical_level,
    sleep_hours: sleepHours === null ? "" : String(sleepHours),
    mood: condition.mood,
    memo: condition.memo ?? "",
    injuries: condition.injuries ?? [],
  };
}

/** 疲労度・体調（無料項目）に入力があるか。 */
export function hasBasicConditionContent(draft: ConditionDraft): boolean {
  return draft.fatigue_level !== null || draft.physical_level !== null;
}

/** 睡眠・気分・メモ・怪我（Pro 限定項目）に入力があるか。 */
export function hasDetailConditionContent(draft: ConditionDraft): boolean {
  return (
    draft.sleep_hours.trim() !== "" ||
    draft.mood !== null ||
    draft.memo.trim() !== "" ||
    draft.injuries.length > 0
  );
}

/** 空文字・非数の睡眠時間は未入力（null）として送る。 */
function toDetailConditionInput(draft: ConditionDraft): ConditionInput {
  const sleepHours = Number(draft.sleep_hours);
  return {
    sleep_hours:
      draft.sleep_hours.trim() === "" || Number.isNaN(sleepHours)
        ? null
        : sleepHours,
    mood: draft.mood,
    memo: draft.memo.trim() === "" ? null : draft.memo.trim(),
    injuries: draft.injuries.map((injury) => ({
      part: injury.part,
      memo: injury.memo?.trim() ? injury.memo.trim() : null,
    })),
  };
}

interface ConditionPayloadOptions {
  /** detailed_condition_log を持っているか。 */
  hasDetailEntitlement: boolean;
  /** Pro 判定が未確定か。 */
  isEntitlementLoading: boolean;
}

/**
 * 保存リクエストに載せるコンディションを決める。載せない場合は null。
 *
 * 疲労度・体調は無料でも記録できるので常に載せる。詳細項目は entitlement が無いとき・
 * 判定が未確定のときはキーごと落とす。null を送ると back が既存値を空で上書きしてしまうため、
 * 「送らない」と「空にする」を区別する必要がある。
 */
export function buildConditionPayload(
  draft: ConditionDraft,
  { hasDetailEntitlement, isEntitlementLoading }: ConditionPayloadOptions,
): ConditionInput | null {
  const canSendDetail = !isEntitlementLoading && hasDetailEntitlement;
  const hasDetail = canSendDetail && hasDetailConditionContent(draft);
  if (!hasBasicConditionContent(draft) && !hasDetail) return null;

  return {
    fatigue_level: draft.fatigue_level,
    physical_level: draft.physical_level,
    ...(canSendDetail ? toDetailConditionInput(draft) : {}),
  };
}
