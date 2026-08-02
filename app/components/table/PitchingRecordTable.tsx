import type {
  PitchingStatsAggregate,
  PitchingStatsCalculated,
} from "@app/interface/dashboardStats";
import { INNING_FORMAT_TOOLTIP } from "@app/constants/pitchingTooltips";
import { formatEra, formatRate } from "@app/utils/formatStats";
import StatTooltipLabel from "./StatTooltipLabel";

type Props = {
  aggregate: PitchingStatsAggregate | null;
  calculated: PitchingStatsCalculated | null;
};

/**
 * 投手成績の一覧テーブル（左右 2 組のラベル/値ペア）。
 *
 * 率系（防御率・WHIP など）は `calculated`、実数は `aggregate` から取る。
 * 完投・完封は率系ではなく `aggregate` 側にある点に注意。
 * 項目・並び・ラベルは mobile の ProfileStatsTab と揃えている。
 */
export default function PitchingRecordTable({ aggregate, calculated }: Props) {
  const displayValue = (value: number | undefined | null) =>
    value == null ? "-" : value.toString();
  const displayEraValue = (value: number | undefined | null) =>
    value == null ? "-" : formatEra(value);
  const displayRateValue = (value: number | undefined | null) =>
    value == null ? "-" : formatRate(value);

  const styleTableBox = "grid grid-cols-2 text-center";
  const styleTableTitle =
    "border-r-1 border-b-1 border-r-zinc-500 border-b-zinc-500 text-sm py-2.5 font-normal text-zic-300";
  const styleTableData =
    "bg-sub text-sm py-2.5 font-medium border-b-1 border-b-zinc-500";

  return (
    <div className="mt-4 border-x-1 border-t-1 border-zinc-500 rounded-md overflow-hidden">
      <div className="grid grid-cols-2">
        <div>
          <div className={styleTableBox}>
            <StatTooltipLabel
              label="防御率"
              tooltip={INNING_FORMAT_TOOLTIP}
              className={styleTableTitle}
            />
            <span className={styleTableData}>
              {displayEraValue(calculated?.era)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>勝</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.win)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>投球回</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.innings_pitched)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>完封</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.shutouts)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>ホールド</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.hold)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>与四球</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.base_on_balls)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>被安打</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.hits_allowed)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>失点</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.run_allowed)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>勝率</p>
            <span className={styleTableData}>
              {displayRateValue(calculated?.win_percentage)}
            </span>
          </div>
          <div className={styleTableBox}>
            <StatTooltipLabel
              label="K/9"
              tooltip={INNING_FORMAT_TOOLTIP}
              className={styleTableTitle}
            />
            <span className={styleTableData}>
              {displayEraValue(calculated?.k_per_nine)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={`${styleTableTitle} rounded-bl-md`}>K/BB</p>
            <span className={styleTableData}>
              {displayEraValue(calculated?.k_bb)}
            </span>
          </div>
        </div>
        <div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>登板</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.number_of_appearances)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>敗</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.loss)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>完投</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.complete_games)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>セーブ</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.saves)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>奪三振</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.strikeouts)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>与死球</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.hit_by_pitch)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>被本塁打</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.home_runs_hit)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>自責点</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.earned_run)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>WHIP</p>
            <span className={styleTableData}>
              {displayEraValue(calculated?.whip)}
            </span>
          </div>
          <div className={styleTableBox}>
            <StatTooltipLabel
              label="BB/9"
              tooltip={INNING_FORMAT_TOOLTIP}
              className={styleTableTitle}
            />
            <span className={styleTableData}>
              {displayEraValue(calculated?.bb_per_nine)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>総投球数</p>
            <span className={`${styleTableData} rounded-br-md`}>
              {displayValue(aggregate?.number_of_pitches)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
