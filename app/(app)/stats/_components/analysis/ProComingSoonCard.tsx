"use client";
import type { ReactNode } from "react";

interface ProComingSoonCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

/**
 * Pro プラン限定機能のリリース前告知カード。
 * タイトル・説明は読める状態のまま、children（ダミー body）をブラーでボカし、
 * その上に「Pro プラン (準備中)」バッジを重ねて機能の事前訴求を行う。
 */
export function ProComingSoonCard({
  title,
  description,
  children,
}: ProComingSoonCardProps) {
  return (
    <section className="rounded-xl bg-[#3A3A3A] p-4">
      <h3 className="text-base font-bold text-[#F4F4F4]">{title}</h3>
      <p className="mt-2 text-xs leading-[18px] text-[#A1A1AA]">
        {description}
      </p>
      <div className="relative mt-3 overflow-hidden rounded-lg">
        <div className="pointer-events-none select-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[3px]">
          <div className="flex items-center gap-1.5 rounded-full bg-[#d08000] px-3.5 py-2">
            <LockIcon />
            <span className="text-[13px] font-semibold text-[#1A1A1A]">
              Pro プラン (準備中)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function LockIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="#1A1A1A"
      aria-hidden="true"
    >
      <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm3 8H9V6a3 3 0 0 1 6 0v3z" />
    </svg>
  );
}
