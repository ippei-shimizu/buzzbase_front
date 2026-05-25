import CheckoutButton from "./CheckoutButton";

const PLAN_FEATURES = [
  "広告なしで集中",
  "メディアアップロード無制限",
  "メディア長期保管（31日以上前も閲覧可）",
  "シーズン跨ぎの成績推移グラフ",
  "草機能の全期間ヒートマップ",
  "練習メニュー・自主練スケジュール無制限",
  "月次・シーズン目標無制限",
  "カスタム通知メッセージ",
] as const;

export default function PricingCards() {
  return (
    <section id="pricing" className="bg-[#2E2E2E] px-6 py-16 md:py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-2 text-center text-2xl font-bold text-white md:text-3xl">
          プランを選ぶ
        </h2>
        <p className="mb-10 text-center text-sm text-gray-400">
          7 日間の無料トライアル付き。期間中はいつでも解約できます。
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-gray-700 bg-[#424242] p-6 shadow-lg">
            <header className="mb-4">
              <h3 className="text-lg font-bold text-white">月額プラン</h3>
              <p className="mt-2 text-3xl font-bold text-white">
                ¥980
                <span className="text-base font-normal text-gray-400">
                  {" "}
                  / 月
                </span>
              </p>
            </header>
            <ul className="mb-6 space-y-2 text-sm text-gray-200">
              {PLAN_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span className="text-[#d08000]">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <CheckoutButton label="7 日間の無料トライアルを始める" fullWidth />
          </article>

          <article className="relative rounded-2xl border-2 border-[#d08000] bg-[#424242] p-6 shadow-xl">
            <span className="absolute -top-3 right-4 rounded-full bg-[#d08000] px-3 py-0.5 text-xs font-bold text-white">
              2 ヶ月分お得
            </span>
            <header className="mb-4">
              <h3 className="text-lg font-bold text-white">年額プラン</h3>
              <p className="mt-2 text-3xl font-bold text-white">
                ¥9,800
                <span className="text-base font-normal text-gray-400">
                  {" "}
                  / 年
                </span>
              </p>
              <p className="mt-1 text-xs text-gray-400">月あたり ¥817</p>
            </header>
            <ul className="mb-6 space-y-2 text-sm text-gray-200">
              {PLAN_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span className="text-[#d08000]">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <CheckoutButton label="7 日間の無料トライアルを始める" fullWidth />
          </article>
        </div>
      </div>
    </section>
  );
}
