"use client";

import Link from "next/link";
import { SITE_URL } from "@app/constants/app";
import { classifyWhip } from "@app/data/baseball-stats/whipLevel";
import { trackEvent } from "@app/lib/analytics";

type Props = {
  whip: number;
};

function formatWhip(value: number): string {
  if (Number.isNaN(value)) return "-";
  return value.toFixed(2);
}

function buildShareText(whipText: string) {
  return `WHIP ${whipText}
あなたも BUZZ BASE で WHIP を計算してシェアしよう。`;
}

export default function WhipResultCard({ whip }: Props) {
  const level = classifyWhip(whip);
  const whipText = formatWhip(whip);

  const whipQuery = whip.toFixed(2);
  const toolUrl = `${SITE_URL}/tools/whip?whip=${whipQuery}`;
  const shareText = buildShareText(whipText);
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(toolUrl)}`;
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(toolUrl)}&text=${encodeURIComponent(shareText)}`;

  const handleTwitterShare = () => {
    trackEvent("share", { method: "twitter", content_type: "whip_result" });
  };
  const handleLineShare = () => {
    trackEvent("share", { method: "line", content_type: "whip_result" });
  };
  const handleSignupClick = () => {
    trackEvent("generate_lead", { source_tool: "whip" });
  };

  const badgeClass: Record<typeof level.key, string> = {
    S: "bg-amber-400 text-zinc-900",
    A: "bg-yellow-500 text-zinc-900",
    B: "bg-yellow-600 text-white",
    C: "bg-zinc-500 text-white",
    D: "bg-zinc-700 text-zinc-200",
  };

  return (
    <div className="space-y-5 rounded-xl border border-yellow-700/40 bg-gradient-to-br from-zinc-900 via-zinc-900 to-yellow-950/30 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-400">あなたの WHIP 評価</p>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${badgeClass[level.key]}`}
        >
          {level.key} ／ {level.label}
        </span>
      </div>

      <p className="text-sm text-zinc-300 leading-6">{level.comment}</p>

      <div className="rounded-lg border border-zinc-700/70 bg-zinc-950/50 px-4 py-3">
        <p className="mb-1 text-xs text-zinc-500">シェアプレビュー</p>
        <p className="text-sm whitespace-pre-line text-zinc-200 leading-6">
          {shareText}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleTwitterShare}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-zinc-800"
        >
          X でシェア
        </a>
        <a
          href={lineUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLineShare}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#06C755] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#04a346]"
        >
          LINEでシェア
        </a>
      </div>

      <div className="rounded-lg border border-yellow-600/40 bg-yellow-900/20 px-4 py-4">
        <p className="text-sm text-zinc-200 leading-6">
          BUZZ BASE に無料登録すると、試合ごとに WHIP・防御率・K/BB・K/9
          をまとめて記録できます。グラフで成績推移を確認したり、チーム内ランキングで比較したりも可能です。
        </p>
        <Link
          href="/signup"
          onClick={handleSignupClick}
          className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-yellow-500 px-4 py-2.5 text-sm font-bold text-zinc-900 transition-colors hover:bg-yellow-400"
        >
          無料登録して成績を記録する &rarr;
        </Link>
      </div>
    </div>
  );
}
