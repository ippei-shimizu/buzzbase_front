import { render, screen } from "@testing-library/react";
import { DEFAULT_PRO_STATUS, type ProSubscription } from "@app/types/pro";
import TrialExpiringBanner from "../TrialExpiringBanner";

function trialSubscription(
  overrides: Partial<ProSubscription> = {},
): ProSubscription {
  return {
    ...DEFAULT_PRO_STATUS.subscription,
    status: "trial",
    platform: "web",
    pro_active: true,
    in_trial: true,
    days_remaining: 3,
    ...overrides,
  };
}

describe("TrialExpiringBanner", () => {
  it("トライアル残り3日なら予告を表示する", () => {
    render(<TrialExpiringBanner subscription={trialSubscription()} />);

    expect(
      screen.getByText("無料トライアルはあと3日で終了します"),
    ).toBeInTheDocument();
  });

  it("トライアル残り1日でも予告を表示する", () => {
    render(
      <TrialExpiringBanner
        subscription={trialSubscription({ days_remaining: 1 })}
      />,
    );

    expect(
      screen.getByText("無料トライアルはあと1日で終了します"),
    ).toBeInTheDocument();
  });

  it("トライアル残り4日では予告を表示しない", () => {
    render(
      <TrialExpiringBanner
        subscription={trialSubscription({ days_remaining: 4 })}
      />,
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("残り0日は日数ではなく本日終了として伝える", () => {
    render(
      <TrialExpiringBanner
        subscription={trialSubscription({ days_remaining: 0 })}
      />,
    );

    expect(
      screen.getByText("無料トライアルは本日で終了します"),
    ).toBeInTheDocument();
  });

  it("days_remaining が null なら終了日を断定できないため表示しない", () => {
    render(
      <TrialExpiringBanner
        subscription={trialSubscription({ days_remaining: null })}
      />,
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("トライアル中でなければ残り日数が少なくても表示しない", () => {
    render(
      <TrialExpiringBanner
        subscription={trialSubscription({
          status: "active",
          in_trial: false,
          days_remaining: 1,
        })}
      />,
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("サブスクリプション管理へ遷移するリンクになっている", () => {
    render(<TrialExpiringBanner subscription={trialSubscription()} />);

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/account/subscription",
    );
  });

  it("リンクの読み上げ名は本文全体ではなく要点と遷移先にする", () => {
    render(<TrialExpiringBanner subscription={trialSubscription()} />);

    expect(
      screen.getByRole("link", {
        name: "無料トライアルはあと3日で終了します。サブスクリプション管理を開く",
      }),
    ).toBeInTheDocument();
  });

  it("緊急度の低い予告として role=status で通知する", () => {
    render(<TrialExpiringBanner subscription={trialSubscription()} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
