type PersonalBattingAverages = {
  number_of_matches: number;
  base_on_balls: number;
  caught_stealing: number;
  error: number;
  hit: number;
  hit_by_pitch: number;
  home_run: number;
  id: number;
  run: number;
  runs_batted_in: number;
  sacrifice_hit: number;
  sacrifice_fly: number;
  stealing_base: number;
  strike_out: number;
  three_base_hit: number;
  times_at_bat: number;
  total_bases: number;
  two_base_hit: number;
  at_bats: number;
};

type PersonalBattingStatus = {
  total_hits: number;
  batting_average: number;
  bb_per_k: number;
  iso: number;
  isod: number;
  on_base_percentage: number;
  ops: number;
  slugging_percentage: number;
};

type Props = {
  personalBattingAverages: PersonalBattingAverages[];
  personalBattingStatus: PersonalBattingStatus | undefined;
};

export default function BattingAverageTable(props: Props) {
  const { personalBattingAverages, personalBattingStatus } = props;
  const battingAverage =
    personalBattingAverages.length > 0 ? personalBattingAverages[0] : undefined;
  const battingStatus = personalBattingStatus
    ? personalBattingStatus
    : undefined;

  function formatNumber(value: number): string {
    if (value < 1 && value > -1) {
      return value.toFixed(3).replace("0", "");
    }
    return value.toFixed(3);
  }

  const displayValue = (value: number | undefined | null) =>
    value == null ? "-" : value.toString();
  const displayFormattedValue = (value: number | undefined | null) =>
    value == null ? "-" : formatNumber(value);

  const styleTableBox = "grid grid-cols-2 text-center";
  const styleTableTitle =
    "border-r-1 border-b-1 border-r-zinc-500 border-b-zinc-500 text-sm py-2.5 font-normal text-zic-300";
  const styleTableData =
    "bg-sub text-sm py-2.5 font-medium border-b-1 border-b-zinc-500";
  return (
    <>
      <div className="mt-4 border-x-1 border-t-1 border-zinc-500 rounded-md overflow-hidden">
        <div className="grid grid-cols-2">
          <div>
            <div className={styleTableBox}>
              <p className={styleTableTitle}>打率</p>
              <span className={styleTableData}>
                {displayFormattedValue(battingStatus?.batting_average)}
              </span>
            </div>
            <div className={styleTableBox}>
              <p className={styleTableTitle}>打席</p>
              <span className={styleTableData}>
                {displayValue(battingAverage?.times_at_bat)}
              </span>
            </div>
            <div className={styleTableBox}>
              <p className={styleTableTitle}>安打</p>
              <span className={styleTableData}>
                {displayValue(battingStatus?.total_hits)}
              </span>
            </div>
            <div className={styleTableBox}>
              <p className={styleTableTitle}>三塁打</p>
              <span className={styleTableData}>
                {displayValue(battingAverage?.three_base_hit)}
              </span>
            </div>
            <div className={styleTableBox}>
              <p className={styleTableTitle}>塁打</p>
              <span className={styleTableData}>
                {displayValue(battingAverage?.total_bases)}
              </span>
            </div>
            <div className={styleTableBox}>
              <p className={styleTableTitle}>得点</p>
              <span className={styleTableData}>
                {displayValue(battingAverage?.run)}
              </span>
            </div>
            <div className={styleTableBox}>
              <p className={styleTableTitle}>四球</p>
              <span className={styleTableData}>
                {displayValue(battingAverage?.base_on_balls)}
              </span>
            </div>
            <div className={styleTableBox}>
              <p className={styleTableTitle}>犠打</p>
              <span className={styleTableData}>
                {displayValue(battingAverage?.sacrifice_hit)}
              </span>
            </div>
            <div className={styleTableBox}>
              <p className={styleTableTitle}>盗塁</p>
              <span className={styleTableData}>
                {displayValue(battingAverage?.stealing_base)}
              </span>
            </div>
            <div className={styleTableBox}>
              <p className={styleTableTitle}>出塁率</p>
              <span className={styleTableData}>
                {displayFormattedValue(battingStatus?.on_base_percentage)}
              </span>
            </div>
            <div className={styleTableBox}>
              <p className={styleTableTitle}>OPS</p>
              <span className={styleTableData}>
                {displayFormattedValue(battingStatus?.ops)}
              </span>
            </div>
            <div className={styleTableBox}>
              <p className={`${styleTableTitle} rounded-bl-md`}>ISOD</p>
              <span className={styleTableData}>
                {displayFormattedValue(battingStatus?.isod)}
              </span>
            </div>
          </div>

          <div>
            <div className={styleTableBox}>
              <p className={styleTableTitle}>試合</p>
              <span className={styleTableData}>
                {displayValue(battingAverage?.number_of_matches)}
              </span>
            </div>
            <div className={styleTableBox}>
              <p className={styleTableTitle}>打数</p>
              <span className={styleTableData}>
                {displayValue(battingAverage?.at_bats)}
              </span>
            </div>
            <div className={styleTableBox}>
              <p className={styleTableTitle}>二塁打</p>
              <span className={styleTableData}>
                {displayValue(battingAverage?.two_base_hit)}
              </span>
            </div>
            <div className={styleTableBox}>
              <p className={styleTableTitle}>本塁打</p>
              <span className={styleTableData}>
                {displayValue(battingAverage?.home_run)}
              </span>
            </div>
            <div className={styleTableBox}>
              <p className={styleTableTitle}>打点</p>
              <span className={styleTableData}>
                {displayValue(battingAverage?.runs_batted_in)}
              </span>
            </div>
            <div className={styleTableBox}>
              <p className={styleTableTitle}>三振</p>
              <span className={styleTableData}>
                {displayValue(battingAverage?.strike_out)}
              </span>
            </div>
            <div className={styleTableBox}>
              <p className={styleTableTitle}>死球</p>
              <span className={styleTableData}>
                {displayValue(battingAverage?.hit_by_pitch)}
              </span>
            </div>
            <div className={styleTableBox}>
              <p className={styleTableTitle}>犠飛</p>
              <span className={styleTableData}>
                {displayValue(battingAverage?.sacrifice_fly)}
              </span>
            </div>
            <div className={styleTableBox}>
              <p className={styleTableTitle}>盗塁死</p>
              <span className={styleTableData}>
                {displayValue(battingAverage?.caught_stealing)}
              </span>
            </div>
            <div className={styleTableBox}>
              <p className={styleTableTitle}>長打率</p>
              <span className={styleTableData}>
                {displayFormattedValue(battingStatus?.slugging_percentage)}
              </span>
            </div>
            <div className={styleTableBox}>
              <p className={styleTableTitle}>ISO</p>
              <span className={styleTableData}>
                {displayFormattedValue(battingStatus?.iso)}
              </span>
            </div>
            <div className={styleTableBox}>
              <p className={styleTableTitle}>BB/K</p>
              <span className={`${styleTableData} rounded-br-md`}>
                {displayFormattedValue(battingStatus?.bb_per_k)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
