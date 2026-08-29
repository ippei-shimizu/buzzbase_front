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
  it("週次・月次で見出しを出し分ける", () => {
    const { rerender } = render(<PeriodicReviewCard review={buildReview()} />);
    expect(screen.getByText("今週の振り返り")).toBeInTheDocument();

    rerender(
      <PeriodicReviewCard review={buildReview({ period_type: "monthly" })} />,
    );
    expect(screen.getByText("今月の振り返り")).toBeInTheDocument();
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
