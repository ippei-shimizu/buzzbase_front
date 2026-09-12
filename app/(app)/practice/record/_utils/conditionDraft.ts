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

/** 1つでも入力があるか。何も無いまま送ると既存のコンディションを空で上書きしてしまう。 */
export function hasConditionContent(draft: ConditionDraft): boolean {
  return (
    draft.fatigue_level !== null ||
    draft.physical_level !== null ||
    draft.sleep_hours.trim() !== "" ||
    draft.mood !== null ||
    draft.memo.trim() !== "" ||
    draft.injuries.length > 0
  );
}

/** 編集状態を送信値へ変換する。空文字・非数の睡眠時間は未入力（null）として送る。 */
function toConditionInput(draft: ConditionDraft): ConditionInput {
  const sleepHours = Number(draft.sleep_hours);
  return {
    fatigue_level: draft.fatigue_level,
    physical_level: draft.physical_level,
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
  hasConditionEntitlement: boolean;
  /** Pro 判定が未確定か。 */
  isEntitlementLoading: boolean;
}

/**
 * 保存リクエストに載せるコンディションを決める。載せない場合は null。
 *
 * back はコンディション付きの保存を Pro 限定として 403 で弾き、そのとき
 * 練習量やメモを含む更新全体がロールバックされる。Pro から無料へ戻ったユーザーの
 * 編集状態に値が残っていても保存そのものを失敗させないよう、
 * entitlement が無いとき・判定が未確定のときは値の有無に関わらず送らない。
 */
export function buildConditionPayload(
  draft: ConditionDraft,
  { hasConditionEntitlement, isEntitlementLoading }: ConditionPayloadOptions,
): ConditionInput | null {
  if (isEntitlementLoading || !hasConditionEntitlement) return null;
  if (!hasConditionContent(draft)) return null;
  return toConditionInput(draft);
}
