import type { ConditionLog } from "@app/types/practice";
import ExclamationTriangleIcon from "@heroicons/react/24/outline/ExclamationTriangleIcon";
import HeartIcon from "@heroicons/react/24/outline/HeartIcon";
import MoonIcon from "@heroicons/react/24/outline/MoonIcon";
import {
  type ConditionLevelKind,
  conditionLevelLabel,
  conditionLevelMeta,
  parseDecimal,
} from "@app/constants/practice";

/**
 * 描画する範囲。無料項目（疲労度・体調）と Pro 限定項目（睡眠・気分・怪我・メモ）は
 * 呼び出し元が別々に扱えるよう、セクション単位で描き分けられるようにする。
 */
export type ConditionSection = "all" | "basic" | "detail";

interface ConditionCardProps {
  condition: ConditionLog;
  /** 呼び出し元が独自に見出しを描画する場合は false にして二重表示を防ぐ。 */
  showTitle?: boolean;
  section?: ConditionSection;
  className?: string;
}

const SECTION_TITLE = "コンディション";

const LEVEL_TITLES: Record<ConditionLevelKind, string> = {
  fatigue: "疲労度",
  physical: "体調",
};

/** Pro 限定セクションに表示できる値があるか。無いときはサンプルのプレビューへ差し替える。 */
export function hasConditionDetail(condition: ConditionLog): boolean {
  return (
    parseDecimal(condition.sleep_hours) !== null ||
    Boolean(condition.mood) ||
    Boolean(condition.memo) ||
    (condition.injuries ?? []).length > 0
  );
}

interface ConditionLevelTileProps {
  kind: ConditionLevelKind;
  level: number;
}

/** 段階を表情アイコンで示すタイル。色を認識できなくても読めるようラベルを併記する。 */
function ConditionLevelTile({ kind, level }: ConditionLevelTileProps) {
  const meta = conditionLevelMeta(level);
  if (!meta) return null;
  const LevelIcon = meta.icon;

  return (
    <div className="flex flex-1 flex-col items-center gap-1 rounded-[10px] bg-[#3A3A3A] py-3">
      <p className="text-[11px] font-bold text-zinc-400">
        {LEVEL_TITLES[kind]}
      </p>
      <LevelIcon
        className={`h-7 w-7 shrink-0 ${meta.colorClass}`}
        aria-hidden
      />
      <p className="text-[13px] font-bold text-white">
        {conditionLevelLabel(kind, level)}
      </p>
    </div>
  );
}

/**
 * 記録済みコンディションの表示カード。
 * 練習記録の詳細表示と、無料ユーザー向けのプレビューで共通利用する。
 * section で無料項目 / Pro 限定項目のどちらを描くかを選べる。
 */
export default function ConditionCard({
  condition,
  showTitle = true,
  section = "all",
  className,
}: ConditionCardProps) {
  // back の decimal は "7.0" のような文字列で返るため、そのまま出さず数値化して表示する。
  const sleepHours = parseDecimal(condition.sleep_hours);
  const injuries = condition.injuries ?? [];
  const hasLevel =
    conditionLevelMeta(condition.fatigue_level) !== null ||
    conditionLevelMeta(condition.physical_level) !== null;
  const showsBasic = section !== "detail";
  const showsDetail = section !== "basic";

  return (
    <div className={className}>
      {showTitle ? (
        <h3 className="mb-2.5 text-xs font-bold text-zinc-400">
          {SECTION_TITLE}
        </h3>
      ) : null}
      {showsBasic && hasLevel ? (
        <div className="flex gap-2.5">
          {condition.fatigue_level !== null ? (
            <ConditionLevelTile
              kind="fatigue"
              level={condition.fatigue_level}
            />
          ) : null}
          {condition.physical_level !== null ? (
            <ConditionLevelTile
              kind="physical"
              level={condition.physical_level}
            />
          ) : null}
        </div>
      ) : null}
      {showsDetail && (sleepHours !== null || condition.mood) ? (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {sleepHours !== null ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#3A3A3A] px-2.5 py-1.5 text-xs font-bold text-white">
              <MoonIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              睡眠 {sleepHours}時間
            </span>
          ) : null}
          {condition.mood ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#3A3A3A] px-2.5 py-1.5 text-xs font-bold text-white">
              <HeartIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {condition.mood}
            </span>
          ) : null}
        </div>
      ) : null}
      {showsDetail && injuries.length > 0 ? (
        <ul className="mt-2.5 flex flex-wrap gap-2">
          {injuries.map((injury, index) => (
            <li
              key={`${injury.part}-${index}`}
              className="inline-flex items-center gap-1 rounded-full bg-[#ef4444]/15 px-2.5 py-1.5 text-xs font-bold text-[#fca5a5]"
            >
              <ExclamationTriangleIcon
                className="h-3.5 w-3.5 shrink-0"
                aria-hidden
              />
              {injury.memo ? `${injury.part}（${injury.memo}）` : injury.part}
            </li>
          ))}
        </ul>
      ) : null}
      {showsDetail && condition.memo ? (
        <p className="mt-2.5 text-[13px] leading-5 text-zinc-300">
          {condition.memo}
        </p>
      ) : null}
    </div>
  );
}
