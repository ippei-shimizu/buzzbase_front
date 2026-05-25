const VOICES = [
  {
    role: "高校 2 年・外野手",
    body: "去年の打率と比べられるグラフで、自分の成長が一目で分かるようになりました。練習のモチベになります。",
  },
  {
    role: "中学 3 年・投手",
    body: "シーズン目標を細かく追えるのが嬉しい。月ごとに達成度が見えるので、ペース配分しやすいです。",
  },
  {
    role: "大学 1 年・内野手",
    body: "草機能を 1 年通して見られるのが気持ちいい。サボった日が一目で分かるので、続ける癖がつきました。",
  },
] as const;

export default function Testimonials() {
  return (
    <section className="bg-[#262626] px-6 py-16 md:py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-10 text-center text-2xl font-bold text-white md:text-3xl">
          ユーザーの声
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {VOICES.map((voice) => (
            <blockquote
              key={voice.role}
              className="rounded-2xl border border-gray-700 bg-[#424242] p-5"
            >
              <p className="mb-3 text-sm leading-relaxed text-gray-100">
                「{voice.body}」
              </p>
              <footer className="text-xs text-gray-400">{voice.role}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
