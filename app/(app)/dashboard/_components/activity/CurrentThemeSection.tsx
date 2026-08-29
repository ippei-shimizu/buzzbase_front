import type { FetchResult } from "@app/services/v2/requests";
import type { ImprovementTheme } from "@app/types/improvementTheme";
import ChevronRightIcon from "@heroicons/react/24/outline/ChevronRightIcon";
import DocumentTextIcon from "@heroicons/react/24/outline/DocumentTextIcon";
import FireIcon from "@heroicons/react/24/outline/FireIcon";
import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
import Link from "next/link";
import { BallIcon } from "@app/components/icon/BallIcon";
import {
  THEMES_ADD_LABEL,
  THEMES_EMPTY,
  THEMES_LOAD_ERROR,
  THEMES_MANAGE_LABEL,
  THEMES_SECTION_TITLE,
} from "./activityCopy";
import SectionCard, { SectionEmpty, SectionError } from "./SectionCard";

interface CurrentThemeSectionProps {
  /** 取組中（status: open）の課題。 */
  themesResult: FetchResult<ImprovementTheme[]>;
}

const CHIP_CLASS =
  "inline-flex items-center gap-1 rounded-md bg-main px-2 py-1 text-[11px] font-bold text-zinc-300";

const MANAGE_LINK_CLASS =
  "mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-[#d08000] bg-[#d08000]/10 py-2.5 text-[13px] font-bold text-[#d08000]";

/** 課題1件の取組状況（取組日数・練習件数・ノート件数）。 */
function ThemeStats({ theme }: { theme: ImprovementTheme }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      <span className={CHIP_CLASS}>
        <FireIcon className="h-3 w-3 shrink-0 text-[#d08000]" aria-hidden />
        取組 {theme.active_days}日
      </span>
      <span className={CHIP_CLASS}>
        <BallIcon fill="#d08000" width="12" height="12" />
        練習 {theme.practice_logs_count}
      </span>
      <span className={CHIP_CLASS}>
        <DocumentTextIcon
          className="h-3 w-3 shrink-0 text-[#d08000]"
          aria-hidden
        />
        ノート {theme.notes_count}
      </span>
    </div>
  );
}

/**
 * いま取り組んでいる課題の一覧。
 * 課題は練習・ノートを束ねる軸なので、記録導線のすぐ下に置いて毎日目に入るようにする。
 */
export default function CurrentThemeSection({
  themesResult,
}: CurrentThemeSectionProps) {
  if (themesResult.status !== "ok") {
    return (
      <SectionCard title={THEMES_SECTION_TITLE}>
        <SectionError message={THEMES_LOAD_ERROR} />
      </SectionCard>
    );
  }

  const themes = themesResult.data;

  return (
    <SectionCard title={THEMES_SECTION_TITLE}>
      {themes.length === 0 ? (
        <>
          <SectionEmpty message={THEMES_EMPTY} />
          <Link href="/themes" className={MANAGE_LINK_CLASS}>
            <PlusIcon className="h-4 w-4 shrink-0" aria-hidden />
            {THEMES_ADD_LABEL}
          </Link>
        </>
      ) : (
        <>
          <ul className="divide-y divide-zinc-700">
            {themes.map((theme) => (
              <li key={theme.id}>
                <Link
                  href={`/themes/${theme.id}`}
                  className="flex items-center gap-2 py-3"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-bold text-white">
                      {theme.title}
                    </span>
                    <ThemeStats theme={theme} />
                  </span>
                  <ChevronRightIcon
                    className="h-4 w-4 shrink-0 text-zinc-500"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/themes" className={MANAGE_LINK_CLASS}>
            <PlusIcon className="h-4 w-4 shrink-0" aria-hidden />
            {THEMES_MANAGE_LABEL}
          </Link>
        </>
      )}
    </SectionCard>
  );
}
