import type { ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

/** 設定画面の1セクション。見出し＋項目リストをカード枠で囲む。 */
export default function SettingsSection({
  title,
  children,
}: SettingsSectionProps) {
  return (
    <section aria-label={title} className="rounded-xl bg-sub">
      <h2 className="px-4 pt-4 text-xs font-bold text-zinc-400">{title}</h2>
      <ul className="mt-2 divide-y divide-zinc-600">{children}</ul>
    </section>
  );
}
