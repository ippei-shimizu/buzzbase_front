"use client";
import React, { useEffect } from "react";
import { BackIcon } from "@app/components/icon/BackIcon";
import { Button } from "@nextui-org/react";

export default function HeaderNote({
  onNoteSave,
  isSubmitting,
  hasChanges,
}: HeaderNoteSaveProps) {
  const handleBackClick = () => {
    if (
      hasChanges &&
      !window.confirm("変更が保存されていません。このページから離れますか？")
    ) {
      return;
    }
    window.history.back();
  };
  useEffect(() => {
    localStorage.removeItem("gameResultId");
  }, []);
  return (
    <>
      <header className="py-2 px-3 border-b border-b-zinc-500 fixed top-0 w-full bg-main z-50">
        <div className="flex items-center justify-between h-full max-w-[692px] mx-auto lg:m-[0_auto_0_28%]">
          <button onClick={handleBackClick}>
            <BackIcon width="24" height="24" fill="" stroke="white" />
          </button>
          <Button
            onClick={onNoteSave}
            color="primary"
            variant="solid"
            size="sm"
            radius="full"
            isDisabled={isSubmitting}
          >
            保存
          </Button>
        </div>
      </header>
    </>
  );
}
