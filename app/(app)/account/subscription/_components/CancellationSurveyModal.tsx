"use client";

import { useState, useTransition } from "react";
import {
  CANCELLATION_NOTE_MAX_LENGTH,
  CANCELLATION_REASONS,
  type CancellationReason,
} from "@app/types/cancellationFeedback";
import {
  submitCancellationFeedback,
  type CancellationFeedbackError,
} from "../actions";

const REASON_LABELS: Record<CancellationReason, string> = {
  expensive: "料金が高い",
  less_usage: "あまり使わなくなった",
  feature_missing: "必要な機能がなかった",
  competitor: "他のサービスを使うことにした",
  other: "その他",
};

// survey_disabled は「アンケートの受付が止まっている」だけで利用者側に非がない。
// 文言を出さずに畳むため、メッセージを持たせない。
type DisplayableError = Exclude<CancellationFeedbackError, "survey_disabled">;

const ERROR_MESSAGES: Record<DisplayableError, string> = {
  unauthorized:
    "ログインの有効期限が切れているため、アンケートを送信できませんでした。解約手続きは完了しています。",
  reason_required: "解約の理由を選択してください。",
  invalid_reason:
    "選択された解約の理由が正しくありません。もう一度お選びください。",
  note_too_long: `ご意見は${CANCELLATION_NOTE_MAX_LENGTH}文字以内で入力してください。`,
  unknown:
    "アンケートを送信できませんでした。解約手続きは完了していますので、そのまま閉じていただけます。",
};

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

/**
 * フォーカストラップの境界に使う要素を集める。
 * ラジオグループは選択済みの1つだけがタブ順に載るため、未選択の兄弟を除外しないと
 * 先頭・末尾の判定がずれて Tab が外に抜ける。
 */
function focusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => {
    if (!(element instanceof HTMLInputElement) || element.type !== "radio") {
      return true;
    }
    if (element.checked) return true;
    return !container.querySelector(
      `input[type="radio"][name="${element.name}"]:checked`,
    );
  });
}

interface Props {
  /** アンケートを閉じる。スキップ・送信完了・受付停止のいずれでも呼ばれる。 */
  onClose: () => void;
}

/**
 * 解約申請の受理後に表示する任意回答のアンケート。
 *
 * 解約自体はすでに back で受理済みなので、このモーダルの成否は解約結果に影響しない。
 * 送信に失敗しても閉じる導線を常に残し、利用者が先に進めなくならないようにする。
 */
export default function CancellationSurveyModal({ onClose }: Props) {
  const [reason, setReason] = useState<CancellationReason | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<DisplayableError | null>(null);
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, startTransition] = useTransition();

  const remaining = CANCELLATION_NOTE_MAX_LENGTH - note.length;

  const close = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      close();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = focusableElements(event.currentTarget);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleSubmit = () => {
    if (!reason) {
      setError("reason_required");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await submitCancellationFeedback({ reason, note });
      if (result.ok) {
        setIsSent(true);
        return;
      }
      // 受付が止まっている状態は利用者に伝えても行動しようがない。任意回答なので黙って畳む。
      if (result.error === "survey_disabled") {
        onClose();
        return;
      }
      setError(result.error);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
      onKeyDown={handleKeyDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancellation-survey-title"
        className="w-full max-w-[440px] max-h-[90vh] overflow-y-auto rounded-xl bg-main p-6"
      >
        <h3
          id="cancellation-survey-title"
          className="text-base font-bold text-white"
        >
          解約申請を受け付けました
        </h3>

        {isSent ? (
          <>
            <p className="mt-3 text-sm leading-6 text-zic-300">
              ご回答ありがとうございました。次回更新日まで引き続き Pro
              機能をご利用いただけます。
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={close}
                autoFocus
                className="rounded-lg bg-[#d08000] px-4 py-2 text-sm font-bold text-white"
              >
                閉じる
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm leading-6 text-zic-300">
              次回更新日まで引き続き Pro
              機能をご利用いただけます。よろしければ、今後の改善のため解約の理由をお聞かせください（任意）。
            </p>

            <fieldset className="mt-4 border-0 p-0">
              <legend className="text-sm font-bold text-white">
                解約の理由
              </legend>
              <div className="mt-2 flex flex-col gap-2">
                {CANCELLATION_REASONS.map((value, index) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-2 rounded-lg bg-sub px-3 py-2 text-sm text-white"
                  >
                    <input
                      type="radio"
                      name="cancellation-reason"
                      value={value}
                      checked={reason === value}
                      autoFocus={index === 0}
                      onChange={() => setReason(value)}
                      disabled={isSubmitting}
                      className="accent-[#d08000]"
                    />
                    {REASON_LABELS[value]}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-4">
              <label
                htmlFor="cancellation-survey-note"
                className="text-sm font-bold text-white"
              >
                ご意見・ご要望（任意）
              </label>
              <textarea
                id="cancellation-survey-note"
                value={note}
                // maxLength だけでは一部のブラウザの貼り付けを取りこぼすため、値そのものも切り詰める。
                onChange={(event) =>
                  setNote(
                    event.target.value.slice(0, CANCELLATION_NOTE_MAX_LENGTH),
                  )
                }
                maxLength={CANCELLATION_NOTE_MAX_LENGTH}
                rows={4}
                disabled={isSubmitting}
                aria-describedby="cancellation-survey-note-count"
                className="mt-2 w-full rounded-lg bg-sub p-3 text-sm text-white"
              />
              <p
                id="cancellation-survey-note-count"
                className="mt-1 text-right text-xs text-zic-300"
              >
                残り{remaining}文字
              </p>
            </div>

            {error ? (
              <p
                role="alert"
                className="mt-3 rounded-lg bg-[#7f1d1d] p-3 text-sm leading-5 text-white"
              >
                {ERROR_MESSAGES[error]}
              </p>
            ) : null}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={close}
                disabled={isSubmitting}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                回答せずに閉じる
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-lg bg-[#d08000] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {isSubmitting ? "送信中…" : "送信する"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
