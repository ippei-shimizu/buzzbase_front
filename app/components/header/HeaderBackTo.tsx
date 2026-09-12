import Link from "next/link";
import { BackIcon } from "@app/components/icon/BackIcon";

interface HeaderBackToProps {
  /** 戻り先のパス。 */
  href: string;
  label?: string;
}

/**
 * 戻り先を固定するヘッダー。
 *
 * HeaderBack（履歴を1つ戻る）と違い、複数の画面から到達しうる一覧・詳細でも
 * 必ず同じ画面へ戻す。深いリンクで開いたときに戻れなくなるのを防ぐ。
 */
export default function HeaderBackTo({
  href,
  label = "戻る",
}: HeaderBackToProps) {
  return (
    <header className="py-2 px-3 border-b border-b-zinc-500 fixed top-[var(--top-banner-offset,0px)] w-full bg-main z-50">
      <div className="flex items-center justify-between h-full max-w-[692px] mx-auto lg:m-[0_auto_0_28%]">
        <Link href={href} aria-label={label}>
          <BackIcon width="24" height="24" fill="" stroke="white" />
        </Link>
      </div>
    </header>
  );
}
