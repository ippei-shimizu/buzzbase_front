"use client";
import React from "react";
import { BackIcon } from "@app/components/icon/BackIcon";

interface HeaderNoteProps {
  hasChanges: boolean;
}

/** 保存ボタンはフォーム最下部にあるため、ヘッダーには戻るボタンのみ置く。 */
export default function HeaderNote({ hasChanges }: HeaderNoteProps) {
  const handleBackClick = () => {
    if (
      hasChanges &&
      !window.confirm("変更が保存されていません。このページから離れますか？")
    ) {
      return;
    }
    window.history.back();
  };
  return (
    <>
      <header className="py-2 px-3 border-b border-b-zinc-500 fixed top-[var(--top-banner-offset,0px)] w-full bg-main z-50">
        <div className="flex items-center h-full max-w-[692px] mx-auto lg:m-[0_auto_0_28%]">
          <button onClick={handleBackClick}>
            <BackIcon width="24" height="24" fill="" stroke="white" />
          </button>
        </div>
      </header>
    </>
  );
}
