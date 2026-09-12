import type { ReactNode } from "react";

interface LoadingFrameProps {
  /** そのルートの実ヘッダーコンポーネント（`<Header />` / `<HeaderBack />` 等）。 */
  header: ReactNode;
  /** ヘッダー分の余白。実ページの `pt-*` と揃え、実コンテンツ表示時のズレを防ぐ。 */
  paddingTop: string;
  children: ReactNode;
}

/**
 * `loading.tsx` 共通の外枠。認証必須ルートのレイアウト骨格
 * （`buzz-dark` 背景 + ヘッダー + `max-w-[720px]` 中央寄せ）を1箇所に集約する。
 */
export default function LoadingFrame({
  header,
  paddingTop,
  children,
}: LoadingFrameProps) {
  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      {header}
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className={`${paddingTop} px-4 lg:px-6`}>{children}</div>
        </div>
      </main>
    </div>
  );
}
