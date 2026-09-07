import type { RunnersState } from "@app/interface/plateAppearanceV2";

// ランナー状況の選択肢。key は back の PlateAppearance#runners_state enum
// （no_runner=0 起点）と一致させる。
export const RUNNERS_STATE_OPTIONS: ReadonlyArray<{
  key: RunnersState;
  label: string;
}> = [
  { key: "no_runner", label: "無走者" },
  { key: "first", label: "一塁" },
  { key: "second", label: "二塁" },
  { key: "third", label: "三塁" },
  { key: "first_second", label: "一・二塁" },
  { key: "first_third", label: "一・三塁" },
  { key: "second_third", label: "二・三塁" },
  { key: "bases_loaded", label: "満塁" },
];

// 各塁の占有状態。RunnersDiamond の入力/表示と enum の相互変換に使う。
export interface RunnersBases {
  first: boolean;
  second: boolean;
  third: boolean;
}

// enum と塁の対応の SSoT。表示・入力の双方でこの2関数を経由する。
const BASES_BY_STATE: Readonly<Record<RunnersState, RunnersBases>> = {
  no_runner: { first: false, second: false, third: false },
  first: { first: true, second: false, third: false },
  second: { first: false, second: true, third: false },
  third: { first: false, second: false, third: true },
  first_second: { first: true, second: true, third: false },
  first_third: { first: true, second: false, third: true },
  second_third: { first: false, second: true, third: true },
  bases_loaded: { first: true, second: true, third: true },
};

/**
 * runners_state enum を塁ごとの占有フラグに変換する。
 * null（未記録）は全塁 OFF として返す（no_runner と同じ見た目になるため、
 * 未記録の区別は呼び出し側でキャプション等により表現する）。
 */
export const runnersStateToBases = (
  state: RunnersState | null,
): RunnersBases =>
  state ? { ...BASES_BY_STATE[state] } : BASES_BY_STATE.no_runner;

/**
 * 塁ごとの占有フラグを runners_state enum に変換する。
 * 全塁 OFF は「無走者を記録した」と解釈して no_runner を返す。
 */
export const basesToRunnersState = (bases: RunnersBases): RunnersState => {
  const found = RUNNERS_STATE_OPTIONS.find(({ key }) => {
    const candidate = BASES_BY_STATE[key];
    return (
      candidate.first === bases.first &&
      candidate.second === bases.second &&
      candidate.third === bases.third
    );
  });
  // BASES_BY_STATE は 3bit 全 8 通りを網羅しているため必ず見つかる。
  return found?.key ?? "no_runner";
};
