import type { ReactNode } from "react";
import Link from "next/link";

export interface GuideLink {
  href: string;
  label: string;
}

export interface GuideContent {
  description: string;
  steps: string[];
  link: GuideLink | null;
}

/**
 * 解約方法・支払い情報の更新先といった手続き案内を共通レイアウトで描画するセクション。
 * title は見出しと同時に region 名にもなるため、画面内で一意な文言を渡すこと。
 * children には案内文の下に置く操作系（アプリ内で完結する解約ボタンなど）を渡す。
 */
export default function GuideSection({
  title,
  content,
  children,
}: {
  title: string;
  content: GuideContent;
  children?: ReactNode;
}) {
  // ストアの管理画面など外部サイトは別タブで開く。内部遷移で開くと戻り導線を失う。
  const isExternal = content.link?.href.startsWith("http") ?? false;

  return (
    <section aria-label={title} className="rounded-xl bg-sub p-4">
      <h2 className="text-sm font-bold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-5 text-zic-300">
        {content.description}
      </p>
      {content.steps.length > 0 ? (
        <ol className="mt-3 list-decimal space-y-1 rounded-lg bg-main p-3 pl-7 text-sm text-zic-200">
          {content.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}
      {children}
      {content.link ? (
        <Link
          href={content.link.href}
          className="mt-3 inline-block text-sm font-semibold text-[#d08000] underline"
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {content.link.label}
        </Link>
      ) : null}
    </section>
  );
}
