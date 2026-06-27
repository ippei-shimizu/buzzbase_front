"use client";

import Link from "next/link";
import { SITE_URL } from "@app/constants/app";
import { trackEvent } from "@app/lib/analytics";

type Props = {
  ops: number;
  obp: number;
  slg: number;
};

type Level = {
  key: "S" | "A" | "B" | "C" | "D";
  label: string;
  comment: string;
  badgeClass: string;
};

function classifyOps(ops: number): Level {
  if (ops >= 1.0) {
    return {
      key: "S",
      label: "リーグ代表級",
      comment: "OPS 1.000超え。シーズン通算で達成できるのは数人レベル。",
      badgeClass: "bg-amber-400 text-zinc-900",
    };
  }
  if (ops >= 0.9) {
    return {
      key: "A",
      label: "中心打者",
      comment: "OPS .900以上。クリーンアップを任される強打者。",
      badgeClass: "bg-yellow-500 text-zinc-900",
    };
  }
  if (ops >= 0.8) {
    return {
      key: "B",
      label: "好打者",
      comment: "OPS .800以上。レギュラー上位の安定したバッティング。",
      badgeClass: "bg-yellow-600 text-white",
    };
  }
  if (ops >= 0.7) {
    return {
      key: "C",
      label: "平均的",
      comment: "OPS .700以上。リーグ平均前後。",
      badgeClass: "bg-zinc-500 text-white",
    };
  }
  return {
    key: "D",
    label: "要改善",
    comment: "OPS .700未満。出塁率と長打率の両方を伸ばす余地あり。",
    badgeClass: "bg-zinc-700 text-zinc-200",
  };
}

function formatRate(value: number): string {
  if (Number.isNaN(value)) return "-";
  const fixed = value.toFixed(3);
  return value < 1 ? fixed.replace(/^0/, "") : fixed;
}

function buildShareText(opsText: string, obpText: string, slgText: string) {
  return `OPS ${opsText}（出塁率 ${obpText} / 長打率 ${slgText}）
あなたも BUZZ BASE で OPS を計算してシェアしよう。`;
}

export default function OpsResultCard({ ops, obp, slg }: Props) {
  const level = classifyOps(ops);
  const opsText = formatRate(ops);
  const obpText = formatRate(obp);
  const slgText = formatRate(slg);

  // SNS シェア時に Twitter / LINE が取得する URL。
  // /tools/ops の generateMetadata がこのクエリから動的に og:image を組み立てるので、
  // share URL 側に必ずクエリを含める。
  const toolUrl = `${SITE_URL}/tools/ops?ops=${ops.toFixed(3)}&obp=${obp.toFixed(3)}&slg=${slg.toFixed(3)}`;
  const shareText = buildShareText(opsText, obpText, slgText);
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(toolUrl)}`;
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(toolUrl)}&text=${encodeURIComponent(shareText)}`;

  const handleTwitterShare = () => {
    trackEvent("share", { method: "twitter", content_type: "ops_result" });
  };
  const handleLineShare = () => {
    trackEvent("share", { method: "line", content_type: "ops_result" });
  };
  const handleSignupClick = () => {
    trackEvent("generate_lead", { source_tool: "ops" });
  };

  return (
    <div className="rounded-xl border border-yellow-700/40 bg-gradient-to-br from-zinc-900 via-zinc-900 to-yellow-950/30 p-5 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-400">あなたのOPS評価</p>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${level.badgeClass}`}
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
          BUZZ BASE に無料登録すると、試合ごとに
          OPS・打率・出塁率・長打率をまとめて記録できます。
          グラフで成績推移を確認したり、チーム内ランキングで比較したりも可能です。
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
