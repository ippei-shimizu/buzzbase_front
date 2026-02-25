"use client";

import type { SendButtonProps } from "@app/interface";
import { Button } from "@heroui/react";

export default function SubmitButton({
  className,
  type = "submit",
  text,
  disabled,
}: SendButtonProps) {
  return (
    <>
      <Button
        className={className}
        type={type}
        {...(disabled ? { isDisabled: true } : {})}
      >
        {text}
      </Button>
    </>
  );
}
