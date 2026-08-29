"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useOnboardingWalkthrough } from "@app/hooks/onboarding/useOnboardingWalkthrough";
import { resolveNextPath } from "../_utils/nextPath";
import OnboardingWalkthrough from "./OnboardingWalkthrough";

export default function OnboardingWalkthroughGate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isCompleted, complete } = useOnboardingWalkthrough();
  const hasLeftRef = useRef(false);

  const nextPath = resolveNextPath(searchParams.get("next"));

  const leave = useCallback(() => {
    if (hasLeftRef.current) return;
    hasLeftRef.current = true;
    router.replace(nextPath);
  }, [router, nextPath]);

  // 完了済みのユーザーがこの URL を再訪しても空白のまま留まらせない
  useEffect(() => {
    if (isCompleted === true) leave();
  }, [isCompleted, leave]);

  const finish = () => {
    complete();
    leave();
  };

  if (isCompleted !== false) return null;

  return <OnboardingWalkthrough onFinish={finish} />;
}
