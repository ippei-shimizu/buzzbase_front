import type { CorrelationInsight, InsightDirection } from "@app/types/insight";
import ArrowTrendingDownIcon from "@heroicons/react/24/outline/ArrowTrendingDownIcon";
import ArrowTrendingUpIcon from "@heroicons/react/24/outline/ArrowTrendingUpIcon";
import QuestionMarkCircleIcon from "@heroicons/react/24/outline/QuestionMarkCircleIcon";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import {
  insightBody,
  insightDirection,
  insightMeta,
  isPresetInsight,
} from "../_utils/insightDisplay";

/**
 * 向きの表示。back の direction は「成績が良くなる側か」なので、
 * ラベルも良し悪しを断定せず、向きだけを述べる語にする。
 */
const DIRECTION_META: Record<
  InsightDirection,
  {
    Icon: typeof ArrowTrendingUpIcon;
    label: string;
    className: string;
  }
> = {
  positive: {
    Icon: ArrowTrendingUpIcon,
    label: "上向きの傾向",
    className: "text-[#d08000]",
  },
  negative: {
    Icon: ArrowTrendingDownIcon,
    label: "下向きの傾向",
    className: "text-sky-400",
  },
  unknown: {
    Icon: QuestionMarkCircleIcon,
    label: "傾向は不明",
    className: "text-zinc-400",
  },
};

interface InsightCardProps {
  insight: CorrelationInsight;
  /** 自作カードの削除。おすすめ（プリセット）に渡しても削除ボタンは出ない。 */
  onDelete?: (insight: CorrelationInsight) => void;
}

/**
 * インサイトカード1件の表示。
 * 文言・向き・週数の出し分けは insightDisplay に集約し、ここでは配置だけを担う。
 */
export default function InsightCard({ insight, onDelete }: InsightCardProps) {
  const direction = DIRECTION_META[insightDirection(insight)];
  // おすすめは組み合わせレコードを持たず削除できないため、呼び出し側の指定に関わらず出さない。
  const canDelete = onDelete !== undefined && !isPresetInsight(insight);

  return (
    <article className="rounded-[10px] bg-sub p-4">
      <div className="flex items-center gap-2">
        <direction.Icon
          className={`h-[18px] w-[18px] shrink-0 ${direction.className}`}
          role="img"
          aria-label={direction.label}
        />
        <h4 className="flex-1 text-[15px] font-bold text-white">
          {insight.title}
        </h4>
        {canDelete ? (
          <button
            type="button"
            aria-label={`${insight.title}を削除`}
            onClick={() => onDelete(insight)}
            className="shrink-0 rounded p-1 text-zinc-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d08000]"
          >
            <TrashIcon className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>
      <p className="mt-2.5 text-sm leading-[21px] text-white">
        {insightBody(insight)}
      </p>
      <p className="mt-2.5 text-xs text-zinc-400">{insightMeta(insight)}</p>
    </article>
  );
}
