import { EyeIcon } from "@heroicons/react/24/outline";

interface SampleDataLabelProps {
  className?: string;
}

/**
 * サンプル UI の上に表示する見出し。
 * 無料ユーザー向けの Pro 機能プレビューであり、本人の記録ではないことを明示する。
 */
export function SampleDataLabel({ className }: SampleDataLabelProps) {
  return (
    <p
      className={`flex items-center gap-1.5 text-xs font-semibold text-zic-400 ${className ?? ""}`}
    >
      <EyeIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      サンプルデータ（実際の記録ではありません）
    </p>
  );
}
