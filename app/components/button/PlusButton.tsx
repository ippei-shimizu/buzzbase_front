"use client";

import { PlusIcon } from "@app/components/icon/PlusIcon";
import { Button } from "@heroui/react";

export default function PlusButton({
  className,
  type,
  onPress,
}: PlusButtonProps) {
  return (
    <>
      <Button
        isIconOnly
        className={`${className} p-0 h-auto w-auto min-w-max block`}
        type={type}
        onPress={onPress}
      >
        <PlusIcon width="30" height="30" fill="#C4841D" />
      </Button>
    </>
  );
}
