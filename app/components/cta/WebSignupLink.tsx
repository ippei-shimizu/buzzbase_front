"use client";

import Link from "next/link";
import { trackEvent } from "@app/lib/analytics";

type Props = {
  /** GA4 `cta_location`。CTA 配置箇所を識別する */
  ctaLocation: string;
  /** ツール slug。渡すと GA4 `generate_lead` に `source_tool` として付与される */
  sourceTool?: string;
  className?: string;
  /** ボタン文言。未指定時はデフォルト文言を表示する */
  children?: React.ReactNode;
};

/**
 * Web 登録(/signup)への導線リンク。クリック時に GA4 `generate_lead` を
 * `cta_location` / `source_tool` 付きで送信する。
 * App Store バッジが行き止まりになるデスクトップ向けのオンデバイス導線として、
 * CtaBanner / ToolAppCta など各 CTA から共通利用する。
 */
export default function WebSignupLink({
  ctaLocation,
  sourceTool,
  className,
  children,
}: Props) {
  const handleClick = () => {
    trackEvent("generate_lead", {
      cta_location: ctaLocation,
      ...(sourceTool ? { source_tool: sourceTool } : {}),
    });
  };

  return (
    <Link href="/signup" onClick={handleClick} className={className}>
      {children ?? "無料登録して成績を記録する"}
    </Link>
  );
}
