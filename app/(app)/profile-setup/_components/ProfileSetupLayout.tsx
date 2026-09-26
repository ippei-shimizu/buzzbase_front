import type { ReactNode } from "react";
import { Button } from "@heroui/react";

interface Props {
  isSkipDisabled?: boolean;
  onSkip: () => void;
  children: ReactNode;
}

export default function ProfileSetupLayout({
  isSkipDisabled = false,
  onSkip,
  children,
}: Props) {
  return (
    <div className="px-4 pt-16 pb-24 w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
      <div className="flex justify-end">
        <Button
          variant="light"
          size="sm"
          className="text-zinc-400 font-semibold"
          isDisabled={isSkipDisabled}
          onPress={onSkip}
        >
          スキップ
        </Button>
      </div>
      <h1 className="mt-4 text-xl font-bold">あなたのことを教えてください</h1>
      <p className="mt-3 text-sm leading-6 text-zinc-400">
        登録しておくと、試合の記録を始めるときに自チームや守備位置が自動で入ります。あとから変更できます。
      </p>
      <div className="mt-8">{children}</div>
    </div>
  );
}
