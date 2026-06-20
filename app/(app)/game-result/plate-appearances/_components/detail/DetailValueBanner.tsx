"use client";
import { LightBulbIcon } from "@heroicons/react/24/solid";

/** 詳細入力の価値訴求バナー（mobile 同様、記録するメリットを伝える）。 */
export function DetailValueBanner() {
  return (
    <div className="flex items-start gap-x-3 rounded-xl border-2 border-[#d08000] bg-bg_sub p-4">
      <LightBulbIcon className="h-6 w-6 text-[#d08000] shrink-0" />
      <div>
        <p className="text-sm">
          詳細を記録すると、球質別の打率や状況別の分析が見られます
        </p>
        <p className="text-xs text-zinc-400 mt-1">あとから追記もできます</p>
      </div>
    </div>
  );
}
