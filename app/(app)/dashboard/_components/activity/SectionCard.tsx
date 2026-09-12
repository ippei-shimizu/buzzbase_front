import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  /** タイトル下に添える1行程度の補足説明。 */
  description?: string;
  children: ReactNode;
}

/**
 * 「練習・活動」面の各セクションの共通カード枠。
 *
 * 面に並ぶセクションは機能ごとに別の PR で足されるため、枠（見出し・余白・空状態・エラー）だけを
 * ここに集約し、各セクションは children に中身を差し込むだけにする。
 * `aria-label` 付きの region にしているので、セクション単位で読み上げ・テストの対象にできる。
 */
export default function SectionCard({
  title,
  description,
  children,
}: SectionCardProps) {
  return (
    <section aria-label={title} className="rounded-xl bg-sub p-4">
      <h3 className="text-[15px] font-bold text-white">{title}</h3>
      {description ? (
        <p className="mt-1 text-xs leading-5 text-zinc-400">{description}</p>
      ) : null}
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

/** データが0件のときの案内。取得失敗とは別の文言を渡すこと。 */
export function SectionEmpty({ message }: { message: string }) {
  return <p className="text-[13px] text-zinc-400">{message}</p>;
}

/**
 * 取得に失敗したときの案内。
 * 0件と同じ見た目にすると「まだ記録がない」と誤って伝わるため、role を分けて明示する。
 */
export function SectionError({ message }: { message: string }) {
  return (
    <p role="alert" className="text-[13px] text-zinc-400">
      {message}
    </p>
  );
}
