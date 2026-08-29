import type { PeriodicReview } from "@app/types/periodicReview";
import { render, screen } from "@testing-library/react";
import PeriodicReviewCard from "../PeriodicReviewCard";

const buildReview = (
  overrides: Partial<PeriodicReview> = {},
): PeriodicReview => ({
  id: 1,
  period_type: "weekly",
  period_start: "2026-07-13",
  period_end: "2026-07-19",
  read: false,
  summary: {
    period_type: "weekly",
    practice_days: 5,
    total_swings: 1200,
    active_days: 5,
    streak_current: 12,
  },
  ...overrides,
});

/** 指標名の隣に出ている値を読む（同じ数値が複数箇所に出ても取り違えない）。 */
function valueOf(label: string): string {
  const labelNode = screen.getByText(label);
  return labelNode.parentElement?.firstElementChild?.textContent ?? "";
}

describe("PeriodicReviewCard", () => {
  it("週次は月内の週番号、月次は年月を見出しにする", () => {
    const { rerender } = render(<PeriodicReviewCard review={buildReview()} />);
    expect(screen.getByText("7月 第2週の振り返り")).toBeInTheDocument();

    rerender(
      <PeriodicReviewCard
        review={buildReview({
          period_type: "monthly",
          period_start: "2026-07-01",
          period_end: "2026-07-31",
        })}
      />,
    );
    expect(screen.getByText("2026年7月の振り返り")).toBeInTheDocument();
  });

  it("練習量と打撃・投手の指標を表示する", () => {
    render(
      <PeriodicReviewCard
        review={buildReview({
          summary: {
            practice_days: 5,
            total_swings: 1200,
            streak_current: 12,
            batting: {
              batting_average: 0.312,
              on_base_percentage: 0.388,
              slugging_percentage: 0.451,
              ops: 0.839,
            },
            pitching: {
              innings_pitched: 7,
              era: 2.57,
              whip: 1.14,
              k_per_9: 9,
            },
          },
        })}
      />,
    );

    expect(valueOf("練習日数")).toBe("5日");
    expect(valueOf("素振り")).toBe("1,200");
    expect(valueOf("連続")).toBe("12日");
    expect(valueOf("打率")).toBe(".312");
    expect(valueOf("出塁率")).toBe(".388");
    expect(valueOf("長打率")).toBe(".451");
    expect(valueOf("OPS")).toBe(".839");
    expect(valueOf("防御率")).toBe("2.57");
    expect(valueOf("WHIP")).toBe("1.14");
    expect(valueOf("K/9")).toBe("9.0");
  });

  it("旧レポートで欠けている指標は 0 ではなく - を表示する", () => {
    render(
      <PeriodicReviewCard
        review={buildReview({
          summary: {
            practice_days: 5,
            // total_swings / streak_current / 出塁率以降は当時のレポートに存在しない
            batting: { batting_average: 0.312 },
          },
        })}
      />,
    );

    expect(valueOf("素振り")).toBe("-");
    expect(valueOf("連続")).toBe("-");
    expect(valueOf("出塁率")).toBe("-");
    expect(valueOf("長打率")).toBe("-");
    expect(valueOf("OPS")).toBe("-");
    expect(screen.queryByText("NaN")).not.toBeInTheDocument();
    expect(valueOf("打率")).toBe(".312");
  });

  it("値が 0 のときは - ではなく 0 を表示する", () => {
    render(
      <PeriodicReviewCard
        review={buildReview({
          summary: {
            practice_days: 0,
            total_swings: 0,
            streak_current: 0,
            batting: { batting_average: 0 },
          },
        })}
      />,
    );

    expect(valueOf("練習日数")).toBe("0日");
    expect(valueOf("素振り")).toBe("0");
    expect(valueOf("打率")).toBe(".000");
  });

  it("decimal が文字列で返っても数値として整形する", () => {
    render(
      <PeriodicReviewCard
        review={buildReview({
          summary: {
            practice_days: "5",
            total_swings: "1200.0",
            batting: { batting_average: "0.312", delta: "0.026" },
            pitching: { era: "2.57", whip: "1.14", k_per_9: "9.0" },
          },
        })}
      />,
    );

    expect(valueOf("練習日数")).toBe("5日");
    expect(valueOf("素振り")).toBe("1,200");
    expect(valueOf("打率")).toBe(".312");
    expect(valueOf("防御率")).toBe("2.57");
    expect(screen.getByText("打率 前期間比 +.026")).toBeInTheDocument();
  });

  it("前期間比は上がった週を + 、下がった週を - で表示する", () => {
    const { rerender } = render(
      <PeriodicReviewCard
        review={buildReview({
          summary: { batting: { batting_average: 0.312, delta: 0.026 } },
        })}
      />,
    );
    expect(screen.getByText("打率 前期間比 +.026")).toBeInTheDocument();

    rerender(
      <PeriodicReviewCard
        review={buildReview({
          summary: { batting: { batting_average: 0.274, delta: -0.012 } },
        })}
      />,
    );
    expect(screen.getByText("打率 前期間比 -.012")).toBeInTheDocument();
  });

  it("前期間比が無いレポートでは前期間比の行を出さない", () => {
    render(
      <PeriodicReviewCard
        review={buildReview({
          summary: { batting: { batting_average: 0.312 } },
        })}
      />,
    );

    expect(screen.queryByText(/前期間比/)).not.toBeInTheDocument();
  });

  it("登板が無い期間は投手ブロックを出さない", () => {
    render(
      <PeriodicReviewCard
        review={buildReview({
          summary: {
            practice_days: 5,
            pitching: {
              innings_pitched: 0,
              era: null,
              whip: null,
              k_per_9: null,
            },
          },
        })}
      />,
    );

    expect(screen.queryByText("投手")).not.toBeInTheDocument();
  });

  it("打撃の実数カウントと得点圏打率を表示する", () => {
    render(
      <PeriodicReviewCard
        review={buildReview({
          summary: {
            batting: {
              batting_average: 0.312,
              hits: 5,
              two_base_hits: 2,
              three_base_hits: 0,
              home_runs: 1,
              stolen_bases: 2,
              strikeouts: 3,
              scoring_position: { batting_average: 0.4, at_bats: 5, hits: 2 },
            },
          },
        })}
      />,
    );

    expect(valueOf("安打")).toBe("5");
    expect(valueOf("二塁打")).toBe("2");
    expect(valueOf("三塁打")).toBe("0");
    expect(valueOf("本塁打")).toBe("1");
    expect(valueOf("盗塁")).toBe("2");
    expect(valueOf("三振")).toBe("3");
    expect(valueOf("得点圏打率")).toBe(".400");
  });

  it("得点圏の母数が無い（打率 null）ときは 0 ではなく - を表示する", () => {
    render(
      <PeriodicReviewCard
        review={buildReview({
          summary: {
            batting: {
              batting_average: 0.312,
              scoring_position: { batting_average: null, at_bats: 0, hits: 0 },
            },
          },
        })}
      />,
    );

    expect(valueOf("得点圏打率")).toBe("-");
  });

  it("投手の登板数と実数カウントを表示する", () => {
    render(
      <PeriodicReviewCard
        review={buildReview({
          summary: {
            pitching: {
              appearances: 2,
              innings_pitched: 9,
              era: 2.0,
              whip: 1.0,
              k_per_9: 8.0,
              strikeouts: 8,
              base_on_balls: 3,
              hit_by_pitch: 1,
              hits_allowed: 6,
              home_runs_allowed: 0,
              runs_allowed: 3,
              earned_runs: 2,
            },
          },
        })}
      />,
    );

    expect(valueOf("登板")).toBe("2");
    expect(valueOf("奪三振")).toBe("8");
    expect(valueOf("与四球")).toBe("3");
    expect(valueOf("与死球")).toBe("1");
    expect(valueOf("被安打")).toBe("6");
    expect(valueOf("被本塁打")).toBe("0");
    expect(valueOf("失点")).toBe("3");
    expect(valueOf("自責点")).toBe("2");
  });

  it("コンディションは summary にあるときだけ平均値を表示する", () => {
    const { rerender } = render(<PeriodicReviewCard review={buildReview()} />);
    expect(screen.queryByText("コンディション")).not.toBeInTheDocument();

    rerender(
      <PeriodicReviewCard
        review={buildReview({
          summary: {
            condition: {
              sleep_hours_avg: 7.2,
              fatigue_level_avg: 2.4,
              physical_level_avg: 3.6,
            },
          },
        })}
      />,
    );

    expect(valueOf("平均睡眠")).toBe("7.2h");
    expect(valueOf("平均疲労度")).toBe("2.4");
    expect(valueOf("平均体調")).toBe("3.6");
  });

  it("練習メニュー別内訳と上限から漏れた件数を表示する", () => {
    render(
      <PeriodicReviewCard
        review={buildReview({
          summary: {
            practice_menus: {
              items: [
                {
                  name: "素振り",
                  count: 5,
                  total_amount: 1200,
                  unit_label: "本",
                },
                {
                  name: "ランニング",
                  count: 2,
                  total_amount: 40,
                  unit_label: "分",
                },
              ],
              other_count: 2,
            },
          },
        })}
      />,
    );

    expect(screen.getByText("ランニング")).toBeInTheDocument();
    expect(screen.getByText("5回・1,200本")).toBeInTheDocument();
    expect(screen.getByText("2回・40分")).toBeInTheDocument();
    expect(screen.getByText("他 2 件のメニュー")).toBeInTheDocument();
  });

  it("野球ノートの記録日数は summary にあるときだけ表示する", () => {
    const { rerender } = render(<PeriodicReviewCard review={buildReview()} />);
    expect(screen.queryByText(/記録した日数/)).not.toBeInTheDocument();

    rerender(
      <PeriodicReviewCard
        review={buildReview({ summary: { note_days: 4 } })}
      />,
    );
    expect(screen.getByText("記録した日数 4日")).toBeInTheDocument();
  });

  it("目標の進捗を kind に応じた形式で表示する", () => {
    render(
      <PeriodicReviewCard
        review={buildReview({
          summary: {
            goals: [
              {
                id: 1,
                title: "今月2000本素振り",
                kind: "numeric",
                metric_key: "total_swing_count",
                current_value: 1450,
                target_value: 2000,
                progress_percent: 72.5,
                achieved: false,
                deadline: "2026-07-31",
              },
              {
                id: 2,
                title: "この大会で優勝する",
                kind: "qualitative",
                metric_key: null,
                current_value: 0,
                target_value: null,
                progress_percent: 100,
                achieved: true,
                deadline: "2026-07-31",
              },
            ],
          },
        })}
      />,
    );

    expect(screen.getByText("今月2000本素振り")).toBeInTheDocument();
    expect(
      screen.getByText("素振り本数 1450 / 2000（73%）"),
    ).toBeInTheDocument();
    expect(screen.getByText("この大会で優勝する")).toBeInTheDocument();
    expect(screen.getByText("達成")).toBeInTheDocument();
  });

  it("課題別内訳とインサイトは summary にあるときだけ表示する", () => {
    const { rerender } = render(<PeriodicReviewCard review={buildReview()} />);
    expect(screen.queryByText("課題")).not.toBeInTheDocument();
    expect(screen.queryByText("インサイト")).not.toBeInTheDocument();

    rerender(
      <PeriodicReviewCard
        review={buildReview({
          summary: {
            practice_days: 5,
            theme_breakdown: [{ id: 1, title: "肩の開き", practice_count: 4 }],
            insight: {
              key: "swings_batting_average",
              id: null,
              title: "素振りと打率の関係",
              body: "素振りが多い週は打率が高い傾向があります。",
              metric: "batting_average",
              dimension: "total_swings",
              direction: "positive",
              strength: "strong",
              sample_weeks: 8,
              sufficient: true,
            },
          },
        })}
      />,
    );

    expect(screen.getByText("肩の開き（4回）")).toBeInTheDocument();
    expect(
      screen.getByText("素振りが多い週は打率が高い傾向があります。"),
    ).toBeInTheDocument();
  });

  it("期間を日付で表示する", () => {
    render(<PeriodicReviewCard review={buildReview()} />);

    expect(screen.getByText(/2026\/07\/13/)).toBeInTheDocument();
    expect(screen.getByText(/2026\/07\/19/)).toBeInTheDocument();
  });
});
