import type { OnboardingStep } from "@app/constants/onboarding";
import OnboardingIllustrationView from "./illustrations";

interface Props {
  step: OnboardingStep;
}

export default function OnboardingSlide({ step }: Props) {
  return (
    <div className="flex max-w-[420px] flex-col items-center text-center">
      <div className="flex h-44 w-44 items-center justify-center sm:h-56 sm:w-56">
        <OnboardingIllustrationView name={step.illustration} />
      </div>
      <h2 className="mt-10 text-xl font-bold leading-8 text-white sm:text-2xl">
        {step.title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-zic-400 sm:text-base">
        {step.copy}
      </p>
    </div>
  );
}
