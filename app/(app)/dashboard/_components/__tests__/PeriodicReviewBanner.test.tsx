import type { FetchResult } from "@app/services/v2/requests";
import type { PeriodicReview } from "@app/types/periodicReview";
import { render, screen } from "@testing-library/react";
import PeriodicReviewBanner from "../PeriodicReviewBanner";

const buildReview = (id: number, read: boolean): PeriodicReview => ({
  id,
  period_type: "weekly",
  period_start: "2026-07-13",
  period_end: "2026-07-19",
  read,
  summary: { practice_days: 5 },
});

const okResult = (data: PeriodicReview[]): FetchResult<PeriodicReview[]> => ({
  status: "ok",
  data,
});

describe("PeriodicReviewBanner", () => {
  it("未読があるときだけ一覧への導線を出す", () => {
    render(
      <PeriodicReviewBanner
        result={okResult([buildReview(1, false), buildReview(2, true)])}
      />,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/review");
    expect(screen.getByText("振り返りレポートが届いています")).toBeVisible();
  });

  it("未読件数は未読のレポートだけを数える", () => {
    render(
      <PeriodicReviewBanner
        result={okResult([
          buildReview(1, false),
          buildReview(2, true),
          buildReview(3, false),
        ])}
      />,
    );

    expect(screen.getByText("未読 2 件・タップで確認")).toBeInTheDocument();
  });

  it("すべて既読ならバナーを出さない", () => {
    const { container } = render(
      <PeriodicReviewBanner result={okResult([buildReview(1, true)])} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("レポートが 0 件ならバナーを出さない", () => {
    const { container } = render(
      <PeriodicReviewBanner result={okResult([])} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("取得失敗は未読なしと同一視せず、一覧へ行ける控えめなバナーを出す", () => {
    render(<PeriodicReviewBanner result={{ status: "error" }} />);

    expect(
      screen.getByText("振り返りレポートを取得できませんでした"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/review");
    expect(
      screen.queryByText("振り返りレポートが届いています"),
    ).not.toBeInTheDocument();
  });
});
