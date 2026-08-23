/** 打席詳細画面のセクションカード（タイトル + 行の集まり）。 */
export function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl bg-bg_sub p-4">
      <h3 className="text-base font-bold">{title}</h3>
      <div className="mt-2 flex flex-col divide-y divide-zinc-700">
        {children}
      </div>
    </section>
  );
}
