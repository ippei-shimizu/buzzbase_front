/**
 * back の CancellationFeedback::REASONS と一致させる。
 * 範囲外の値は back が 422 invalid_reason で弾くため、値の追加・改名は back と同時に行う。
 */
export const CANCELLATION_REASONS = [
  "expensive",
  "less_usage",
  "feature_missing",
  "competitor",
  "other",
] as const;

export type CancellationReason = (typeof CANCELLATION_REASONS)[number];

/**
 * 自由記述の上限。back の `validates :note, length: { maximum: 1000 }` と一致させる。
 */
export const CANCELLATION_NOTE_MAX_LENGTH = 1000;
