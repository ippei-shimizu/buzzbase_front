import Image from "next/image";
import AppStoreLink from "@app/components/cta/AppStoreLink";
import AppStoreQr from "@app/components/cta/AppStoreQr";
import WebSignupLink from "@app/components/cta/WebSignupLink";

type Props = {
  heading?: string;
  body: string;
  className?: string;
  /** ツール slug。渡すと GA4 `app_store_click` に `source_tool` として付与され、送客元を識別できる */
  sourceTool?: string;
};

export default function CtaBanner({
  heading,
  body,
  className = "mt-10",
  sourceTool,
}: Props) {
  return (
    <section
      className={`${className} rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6`}
    >
      <Image
        src="/images/buzz-logo-v2.png"
        alt="BUZZ BASE"
        width={140}
        height={34}
        className="mb-3"
      />
      {heading ? <h2 className="text-lg font-bold mb-2">{heading}</h2> : null}
      <p className="text-sm text-zinc-300 leading-6 mb-4">{body}</p>
      <div className="sm:hidden">
        <AppStoreLink
          ctaLocation="cta_banner"
          className="inline-block"
          extraEventParams={
            sourceTool ? { source_tool: sourceTool } : undefined
          }
        />
      </div>
      <div className="hidden sm:block">
        <WebSignupLink
          ctaLocation="cta_banner"
          sourceTool={sourceTool}
          className="inline-flex items-center justify-center rounded-lg bg-yellow-500 px-6 py-3 text-sm font-bold text-zinc-900 transition-colors hover:bg-yellow-400"
        />
        <AppStoreQr className="mt-3" />
      </div>
      <p className="text-xs text-zinc-400 mt-2">
        登録30秒・クレジットカード不要・完全無料
      </p>
    </section>
  );
}
