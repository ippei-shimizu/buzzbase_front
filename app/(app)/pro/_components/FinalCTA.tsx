import CheckoutButton from "./CheckoutButton";

export default function FinalCTA() {
  return (
    <section className="bg-gradient-to-b from-[#2E2E2E] to-[#3a2e1a] px-6 py-16 text-center md:py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
          まずは 7 日間、無料で試してみる
        </h2>
        <p className="mb-8 text-sm leading-relaxed text-gray-300 md:text-base">
          期間中はいつでも解約可能。Pro 機能をしっかり試してから決められます。
        </p>
        <div className="mx-auto max-w-xs">
          <CheckoutButton plan="monthly" label="月額プランで始める" fullWidth />
        </div>
        <p className="mt-6 text-xs text-gray-500">
          年額プランをご希望の方は{" "}
          <a href="#pricing" className="text-[#d08000] underline">
            プラン一覧
          </a>{" "}
          からお選びください。
        </p>
      </div>
    </section>
  );
}
