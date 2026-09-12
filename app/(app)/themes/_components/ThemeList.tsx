import type { ImprovementTheme } from "@app/types/improvementTheme";
import Link from "next/link";
import { themeCategoryLabel } from "@app/constants/improvementTheme";

interface ThemeListProps {
  themes: ImprovementTheme[];
  /** 0件のときに出す文言。タブごとに異なるため呼び出し元から渡す。 */
  emptyMessage: string;
}

/**
 * 課題カードの一覧。
 * 統計（取組日数・練習・ノート）は back が集計した値をそのまま表示する
 * （紐づく記録の件数から数え直すと、一覧に載せていない記録の分だけずれる）。
 */
export default function ThemeList({ themes, emptyMessage }: ThemeListProps) {
  if (themes.length === 0) {
    return (
      <p className="rounded-lg bg-sub p-4 text-sm text-zinc-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {themes.map((theme) => (
        <li key={theme.id}>
          <Link
            href={`/themes/${theme.id}`}
            className="block rounded-xl bg-sub p-4 transition-colors hover:bg-zinc-700"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-white">{theme.title}</p>
                <span className="mt-1.5 inline-block rounded bg-main px-2 py-0.5 text-[11px] font-semibold text-zinc-400">
                  {themeCategoryLabel(theme.category)}
                </span>
              </div>
              {theme.status === "achieved" ? (
                <span className="shrink-0 rounded-full bg-[#d08000] px-2.5 py-1 text-[11px] font-bold text-white">
                  克服
                </span>
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-zinc-300">
              <span className="rounded-lg bg-main px-2.5 py-1.5">
                取組 {theme.active_days}日
              </span>
              <span className="rounded-lg bg-main px-2.5 py-1.5">
                練習 {theme.practice_logs_count}件
              </span>
              <span className="rounded-lg bg-main px-2.5 py-1.5">
                ノート {theme.notes_count}件
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
