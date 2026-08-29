import type { CorrelationInsight } from "@app/types/insight";

/**
 * 無料ユーザーに見せるサンプルカード。
 * ダミー UI ではなく実カードへ流し込み、加入後に何が並ぶのかを実レイアウトのまま伝える。
 * 複数の傾向を発見できる機能だと分かるよう 3 件並べる（mobile の一覧と同じ内容・同じ文言）。
 *
 * id は null 固定。実データの自作カードと違って削除できないことを型のうえでも保証する。
 * 値は実在の記録ではない架空の選手のもので、SampleDataLabel を必ず添えて表示すること。
 */
export const SAMPLE_INSIGHTS: CorrelationInsight[] = [
  {
    key: "sample-1",
    id: null,
    title: "素振りと打率の関係",
    body: "素振りが多い週は、打率が高い傾向があります。",
    metric: "batting_average",
    dimension: "total_swings",
    direction: "positive",
    strength: "strong",
    sample_weeks: 8,
    sufficient: true,
  },
  {
    key: "sample-2",
    id: null,
    title: "睡眠時間とコンディションの関係",
    body: "睡眠時間が短い週は、疲労度の自己評価が高くなる傾向があります。",
    metric: "fatigue_level_avg",
    dimension: "sleep_hours_avg",
    direction: "negative",
    strength: "moderate",
    sample_weeks: 6,
    sufficient: true,
  },
  {
    key: "sample-3",
    id: null,
    title: "練習日数と三振の関係",
    body: "練習日数が多い週は、三振の割合が低くなる傾向があります。",
    metric: "strikeout_rate",
    dimension: "practice_days",
    direction: "negative",
    strength: "strong",
    sample_weeks: 10,
    sufficient: true,
  },
];
