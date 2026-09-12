import DeviceAwareAppCta from "@app/components/cta/DeviceAwareAppCta";

type Props = {
  /** ツール slug。GA4 `source_tool` として送信し、どのツールからの送客かを識別する */
  sourceTool?: string;
  /** GA4 `cta_location` および App Store `ct=` キャンペーン名。CTA 配置箇所を識別する */
  ctaLocation: string;
};

/**
 * 計算結果直下に置くアプリ訴求 CTA。
 * 「手計算はもう不要＝アプリが毎試合自動算出」という検索意図に接続した訴求にする。
 * 端末別の導線出し分け（iOS→App Store / Android→Web / Desktop→Web+QR）は
 * DeviceAwareAppCta に委譲する。
 */
export default function ToolAppCta({ sourceTool, ctaLocation }: Props) {
  return (
    <div className="rounded-lg border border-yellow-600/40 bg-yellow-900/20 px-4 py-4 text-center">
      <p className="mb-3 text-sm text-zinc-200 leading-6">
        毎回この計算、手でやってる？
        アプリなら試合の数字を入れるだけで防御率もOPSも自動算出。記録がグラフで残り、チーム内ランキングでも比較できる。完全無料。
      </p>

      <DeviceAwareAppCta ctaLocation={ctaLocation} sourceTool={sourceTool} />
    </div>
  );
}
