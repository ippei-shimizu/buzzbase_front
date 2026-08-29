"use client";

import { useEffect, useRef, useState } from "react";
import { ONBOARDING_STEPS } from "@app/constants/onboarding";
import OnboardingSlide from "./OnboardingSlide";
import PageIndicator from "./PageIndicator";

// このピクセル未満の横移動はタップ・縦スクロールの巻き添えとみなして無視する
const SWIPE_THRESHOLD_PX = 48;

const LAST_STEP_INDEX = ONBOARDING_STEPS.length - 1;

interface Props {
  /** スキップと「はじめる」の両方から呼ばれる。どちらも完了として扱う。 */
  onFinish: () => void;
}

export default function OnboardingWalkthrough({ onFinish }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  const isLastStep = stepIndex === LAST_STEP_INDEX;

  // 全画面表示なので、どこにフォーカスがあっても左右キーで送れるよう window で拾う
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setStepIndex((prev) => Math.min(prev + 1, LAST_STEP_INDEX));
      } else if (event.key === "ArrowLeft") {
        setStepIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    const startX = touchStartXRef.current;
    touchStartXRef.current = null;
    if (startX === null) return;

    const deltaX = (event.changedTouches[0]?.clientX ?? startX) - startX;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;

    setStepIndex((prev) =>
      deltaX < 0 ? Math.min(prev + 1, LAST_STEP_INDEX) : Math.max(prev - 1, 0),
    );
  };

  return (
    <section
      aria-label="BUZZ BASE の使い方"
      className="buzz-dark fixed inset-0 z-100 flex flex-col bg-main text-white"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex h-14 shrink-0 items-center justify-between px-4">
        {stepIndex > 0 ? (
          <button
            type="button"
            onClick={() => setStepIndex((prev) => Math.max(prev - 1, 0))}
            className="rounded-full px-2 py-1 text-sm font-semibold text-zic-400"
          >
            戻る
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onFinish}
          className="rounded-full px-2 py-1 text-sm font-semibold text-zic-400"
        >
          スキップ
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-y-auto px-8">
        <OnboardingSlide step={ONBOARDING_STEPS[stepIndex]} />
      </div>

      <div className="flex shrink-0 flex-col gap-y-6 px-6 pb-10 pt-4">
        <PageIndicator
          count={ONBOARDING_STEPS.length}
          activeIndex={stepIndex}
        />
        {isLastStep ? (
          <button
            type="button"
            onClick={onFinish}
            className="mx-auto block w-full max-w-[420px] rounded-full bg-[#d08000] py-3 text-base font-bold text-white"
          >
            はじめる
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              setStepIndex((prev) => Math.min(prev + 1, LAST_STEP_INDEX))
            }
            className="mx-auto block w-full max-w-[420px] rounded-full bg-[#d08000] py-3 text-base font-bold text-white"
          >
            次へ
          </button>
        )}
      </div>
    </section>
  );
}
