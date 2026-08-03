import Link from "next/link";
import { CalendarIcon } from "@app/components/icon/CalendarIcon";
import { DetailLinkArrowIcon } from "@app/components/icon/DetailLinkArrowIcon";

interface SeasonManageLinkProps {
  /** 導線の文言。空状態など文脈に応じて差し替える。 */
  label?: string;
  className?: string;
}

/**
 * シーズン管理画面（/seasons）への導線。
 *
 * mobile は Android で `Alert.prompt` が使えずシーズンを作成できないため、
 * Web がその唯一の作成手段になっている。シーズンを扱う画面から必ず辿れるようにする。
 */
export default function SeasonManageLink({
  label = "シーズンを管理",
  className = "",
}: SeasonManageLinkProps) {
  return (
    <Link
      href="/seasons"
      className={`inline-flex items-center gap-x-1.5 text-xs font-semibold text-primary ${className}`}
    >
      <CalendarIcon fill="currentColor" width="15" height="15" />
      {label}
      <DetailLinkArrowIcon stroke="currentColor" width="14" height="14" />
    </Link>
  );
}
