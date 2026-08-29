import type {
  BattingStatsAggregate,
  BattingStatsCalculated,
} from "@app/interface/dashboardStats";
import { formatRate } from "@app/utils/formatStats";

type Props = {
  aggregate: BattingStatsAggregate | null;
  calculated: BattingStatsCalculated | null;
};

/**
 * 打撃成績の一覧テーブル（左右 2 組のラベル/値ペア）。
 *
 * 率系（打率・出塁率など）は `calculated`、実数は `aggregate` から取る。
 * `aggregate.hit` はバックエンドが NPB 標準の全安打（単打 + 2B + 3B + HR）として
 * 集計済みのため、フロントで合算し直さない。
 * 項目・並び・ラベルは mobile の ProfileStatsTab と揃えている。
 */
export default function BattingAverageTable({ aggregate, calculated }: Props) {
  const displayValue = (value: number | undefined | null) =>
    value == null ? "-" : value.toString();
  const displayFormattedValue = (value: number | undefined | null) =>
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
            <p className={styleTableTitle}>打率</p>
            <span className={styleTableData}>
              {displayFormattedValue(calculated?.batting_average)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>打席</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.times_at_bat)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>安打</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.hit)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>三塁打</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.three_base_hit)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>塁打</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.total_bases)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>得点</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.run)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>四球</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.base_on_balls)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>犠打</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.sacrifice_hit)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>盗塁</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.stealing_base)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>出塁率</p>
            <span className={styleTableData}>
              {displayFormattedValue(calculated?.on_base_percentage)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>OPS</p>
            <span className={styleTableData}>
              {displayFormattedValue(calculated?.ops)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={`${styleTableTitle} rounded-bl-md`}>ISOD</p>
            <span className={styleTableData}>
              {displayFormattedValue(calculated?.isod)}
            </span>
          </div>
        </div>

        <div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>試合</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.number_of_matches)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>打数</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.at_bats)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>二塁打</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.two_base_hit)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>本塁打</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.home_run)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>打点</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.runs_batted_in)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>三振</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.strike_out)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>死球</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.hit_by_pitch)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>犠飛</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.sacrifice_fly)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>盗塁死</p>
            <span className={styleTableData}>
              {displayValue(aggregate?.caught_stealing)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>長打率</p>
            <span className={styleTableData}>
              {displayFormattedValue(calculated?.slugging_percentage)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>ISO</p>
            <span className={styleTableData}>
              {displayFormattedValue(calculated?.iso)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>BB/K</p>
            <span className={`${styleTableData} rounded-br-md`}>
              {displayFormattedValue(calculated?.bb_per_k)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
