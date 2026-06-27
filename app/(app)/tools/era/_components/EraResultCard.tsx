"use client";

import Link from "next/link";
import { SITE_URL } from "@app/constants/app";
import { classifyEra } from "@app/data/baseball-stats/eraLevel";
import { trackEvent } from "@app/lib/analytics";

type Props = {
  era: number;
};

const BADGE_CLASS = {
  S: "bg-amber-400 text-zinc-900",
  A: "bg-yellow-500 text-zinc-900",
  B: "bg-yellow-600 text-white",
  C: "bg-zinc-500 text-white",
  D: "bg-zinc-700 text-zinc-200",
} as const;

function formatEra(value: number): string {
  if (Number.isNaN(value)) return "-";
  return value.toFixed(2);
}

function buildShareText(eraText: string) {
  return `防御率（ERA） ${eraText}
あなたも BUZZ BASE で防御率を計算してシェアしよう。`;
}

export default function EraResultCard({ era }: Props) {
  const level = classifyEra(era);
  const eraText = formatEra(era);

  const toolUrl = `${SITE_URL}/tools/era?era=${era.toFixed(2)}`;
  const shareText = buildShareText(eraText);
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(toolUrl)}`;
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(toolUrl)}&text=${encodeURIComponent(shareText)}`;

  const handleTwitterShare = () => {
    trackEvent("share", { method: "twitter", content_type: "era_result" });
  };
  const handleLineShare = () => {
    trackEvent("share", { method: "line", content_type: "era_result" });
  };
  const handleSignupClick = () => {
    trackEvent("generate_lead", { source_tool: "era" });
  };

  return (
    <div className="rounded-xl border border-yellow-700/40 bg-gradient-to-br from-zinc-900 via-zinc-900 to-yellow-950/30 p-5 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-400">あなたの防御率評価</p>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${BADGE_CLASS[level.key]}`}
        >
          {level.key} ／ {level.label}
        </span>
      </div>

      <p className="text-sm text-zinc-300 leading-6">{level.comment}</p>

      <div className="rounded-lg border border-zinc-700/70 bg-zinc-950/50 px-4 py-3">
        <p className="text-xs text-zinc-500 mb-1">シェアプレビュー</p>
        <p className="text-sm text-zinc-200 whitespace-pre-line leading-6">
          {shareText}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleTwitterShare}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black hover:bg-zinc-800 transition-colors px-4 py-2.5 text-sm font-bold text-white"
        >
          X でシェア
        </a>
        <a
          href={lineUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLineShare}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#06C755] hover:bg-[#04a346] transition-colors px-4 py-2.5 text-sm font-bold text-white"
        >
          LINEでシェア
        </a>
      </div>

      <div className="rounded-lg border border-yellow-600/40 bg-yellow-900/20 px-4 py-4">
        <p className="text-sm text-zinc-200 leading-6">
          BUZZ BASE に無料登録すると、試合ごとに 防御率・WHIP・K/9・BB/9
          を含む全投手指標をまとめて記録できます。グラフで成績推移を確認したり、チーム内ランキングで比較したりも可能です。
        </p>
        <Link
          href="/signup"
          onClick={handleSignupClick}
          className="mt-3 inline-flex items-center justify-center w-full rounded-lg bg-yellow-500 hover:bg-yellow-400 transition-colors px-4 py-2.5 text-sm font-bold text-zinc-900"
        >
          無料登録して成績を記録する &rarr;
        </Link>
      </div>
    </div>
  );
}
