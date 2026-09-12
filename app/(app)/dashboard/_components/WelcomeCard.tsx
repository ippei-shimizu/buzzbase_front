import type { ReactNode } from "react";

type WelcomeCardVariant = "record" | "invite";

interface WelcomeCardProps {
  variant: WelcomeCardVariant;
  /** CTA。記録は Server Action 起点、招待は遷移リンクと起動方法が異なるため呼び出し側が渡す。 */
  action: ReactNode;
  /** 渡した場合のみ閉じるボタンを出す。 */
  onDismiss?: () => void;
}

const CONTENT: Record<
  WelcomeCardVariant,
  { title: string; description: string }
> = {
  record: {
    title: "BUZZ BASEへようこそ",
    description:
      "試合を記録するだけで、打率・OPS から防御率まで自動で計算。打者も投手もまとめて成績を管理できます。",
  },
  invite: {
    title: "チームメイトと競い合おう",
    description: "グループを作って、打率ランキングで仲間と競おう。",
  },
};

function SampleStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 flex flex-col items-center rounded-lg bg-bg_sub py-2.5">
      <span className="text-lg font-bold text-[#d08000]">{value}</span>
      <span className="mt-0.5 text-[11px] text-zinc-400">{label}</span>
    </div>
  );
}

function SampleRankRow({ rank, value }: { rank: number; value: string }) {
  return (
    <div className="flex items-center py-1.5">
      <span className="flex items-center justify-center w-[22px] h-[22px] mr-2.5 rounded-full bg-zinc-700 text-xs font-bold text-white">
        {rank}
      </span>
      <span className="flex-1 h-2 mr-2.5 rounded bg-zinc-700" />
      <span className="text-[13px] font-bold text-[#d08000]">{value}</span>
    </div>
  );
}

const SAMPLE_NOTE = (
  <p className="mt-2 text-right text-[10px] text-zinc-500">※サンプル</p>
);

const STATS_PREVIEW = (
  <div className="mt-4 rounded-[10px] bg-[#1f1f22] p-3.5">
    <p className="mb-2.5 text-xs text-zinc-500">記録するとこう計算されます</p>
    <p className="mb-1.5 text-[11px] font-semibold text-zinc-400">打撃成績</p>
    <div className="flex gap-x-2.5">
      <SampleStat label="打率" value=".333" />
      <SampleStat label="OPS" value=".900" />
      <SampleStat label="本塁打" value="5" />
    </div>
    <p className="mt-3 mb-1.5 text-[11px] font-semibold text-zinc-400">
      投手成績
    </p>
    <div className="flex gap-x-2.5">
      <SampleStat label="防御率" value="2.50" />
      <SampleStat label="奪三振" value="42" />
      <SampleStat label="勝利" value="6" />
    </div>
    {SAMPLE_NOTE}
  </div>
);

const RANKING_PREVIEW = (
  <div className="mt-4 rounded-[10px] bg-[#1f1f22] p-3.5">
    <p className="mb-2.5 text-xs text-zinc-500">グループ内ランキング</p>
    <SampleRankRow rank={1} value=".380" />
    <SampleRankRow rank={2} value=".355" />
    <SampleRankRow rank={3} value=".340" />
    {SAMPLE_NOTE}
  </div>
);

/**
 * オンボーディングの次の一歩を促すカード。
 * record は「まだ試合を記録していない人」、invite は「記録済みだがグループ未所属の人」向け。
 */
export default function WelcomeCard({
  variant,
  action,
  onDismiss,
}: WelcomeCardProps) {
  const { title, description } = CONTENT[variant];

  return (
    <section className="relative rounded-xl border border-sub bg-bg_sub p-5">
      {onDismiss ? (
        <button
          type="button"
          aria-label="このカードを閉じる"
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1 text-zinc-500 text-sm leading-none"
        >
          <span aria-hidden="true">✕</span>
        </button>
      ) : null}
      <h3 className="pr-6 text-lg font-bold text-white">{title}</h3>
      <p className="mt-1.5 text-sm leading-5 text-zinc-400">{description}</p>
      {variant === "record" ? STATS_PREVIEW : RANKING_PREVIEW}
      <div className="mt-5">{action}</div>
    </section>
  );
}
