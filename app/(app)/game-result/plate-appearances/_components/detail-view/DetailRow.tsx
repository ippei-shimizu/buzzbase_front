/**
 * 打席詳細画面の 1 行（ラベル + 値）。未記録の表示ルールをここに集約する。
 * - null / 空文字は「未記録」をグレーで表示する
 * - `0` は未記録ではない（打点 0 は `0` のまま表示する）
 * - 行ごと出し分けたい条件付き項目は、呼び出し側で行自体を描画しない
 */
export function DetailRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string | number | null;
  children?: React.ReactNode;
}) {
  const isUnrecorded =
    children === undefined &&
    (value === null || value === undefined || value === "");
  return (
    <div className="flex items-start justify-between gap-x-4 py-1.5">
      <p className="shrink-0 text-sm text-zinc-400">{label}</p>
      {children !== undefined ? (
        <div className="min-w-0">{children}</div>
      ) : isUnrecorded ? (
        <p className="text-sm text-zinc-500">未記録</p>
      ) : (
        <p className="text-right text-sm font-medium text-zinc-100">{value}</p>
      )}
    </div>
  );
}

/** BSO ボード・ダイヤモンド等、消灯描画の上に重ねる「未記録」バッジ。 */
export function UnrecordedBadgeOverlay({
  isUnrecorded,
  children,
}: {
  isUnrecorded: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      {isUnrecorded ? (
        <span className="absolute right-0 top-0 rounded bg-zinc-700 px-2 py-0.5 text-[11px] text-zinc-300">
          未記録
        </span>
      ) : null}
    </div>
  );
}
