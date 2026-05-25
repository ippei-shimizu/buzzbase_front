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
          全機能で野球を極める。
        </h1>
        <p className="mb-8 text-base leading-relaxed text-gray-300 md:text-lg">
          広告なし、無制限のメディア保存、シーズン跨ぎの成績推移、
          シーズン目標、カスタム通知。
          <br className="hidden md:block" />
          Pro プランで、BUZZ BASE をフル活用しよう。
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
