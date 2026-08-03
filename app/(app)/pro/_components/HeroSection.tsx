import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#3a2e1a] via-[#2E2E2E] to-[#2E2E2E] px-6 py-16 text-center md:py-24">
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 inline-block rounded-full bg-[#d08000]/20 px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#d08000]">
          BUZZ BASE Pro
        </p>
        <h1 className="mb-6 text-3xl font-bold leading-tight text-white md:text-5xl">
          記録を、成長へ。
          <br className="md:hidden" />
          数字で自分を読み解く。
        </h1>
        <p className="mb-8 text-base leading-relaxed text-gray-300 md:text-lg">
          方向別・カウント別・球種別・対戦投手別の打率。シーズンを跨いだ成績推移。
          <br className="hidden md:block" />
          練習と成績のつながりや週次・月次レポートまで、Pro
          プランで解放されます。
        </p>
        <Link
          href="#pricing"
          className="inline-block rounded-lg bg-[#d08000] px-8 py-3 font-bold text-white shadow-lg transition hover:bg-[#b66c00]"
        >
          プランを見る
        </Link>
      </div>
    </section>
  );
}
