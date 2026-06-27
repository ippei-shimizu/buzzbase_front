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
