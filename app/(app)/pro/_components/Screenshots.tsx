const SHOTS = [
  {
    title: "シーズン跨ぎの成績推移",
    description:
      "複数シーズンの打率・出塁率・防御率を 1 つのグラフで比較。長期の成長を可視化します。",
  },
  {
    title: "草機能の全期間ヒートマップ",
    description:
      "日々の練習・試合記録を 1 年単位の草で振り返り。継続を実感できます。",
  },
  {
    title: "シーズン目標と月次目標の連動",
    description:
      "年単位の目標を月次目標に分解。達成度の推移を細かく追跡できます。",
  },
] as const;

export default function Screenshots() {
  return (
    <section className="bg-[#2E2E2E] px-6 py-16 md:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-10 text-center text-2xl font-bold text-white md:text-3xl">
          Pro で広がる体験
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {SHOTS.map((shot) => (
            <article
              key={shot.title}
              className="rounded-2xl border border-gray-700 bg-[#424242] p-5"
            >
              <div className="mb-4 flex h-40 items-center justify-center rounded-lg bg-[#2E2E2E] text-xs text-gray-600">
                スクリーンショット
              </div>
              <h3 className="mb-2 text-base font-bold text-white">
                {shot.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-300">
                {shot.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
