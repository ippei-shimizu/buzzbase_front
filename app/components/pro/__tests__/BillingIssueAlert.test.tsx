import { render, screen } from "@testing-library/react";
import {
  DEFAULT_PRO_STATUS,
  type ProSubscription,
  type SubscriptionStatus,
} from "@app/types/pro";
import BillingIssueAlert from "../BillingIssueAlert";

function subscriptionWith(
  status: SubscriptionStatus,
  overrides: Partial<ProSubscription> = {},
): ProSubscription {
  return {
    ...DEFAULT_PRO_STATUS.subscription,
    status,
    platform: "web",
    pro_active: status !== "free",
    ...overrides,
  };
}

describe("BillingIssueAlert", () => {
  it("billing_issue なら決済情報の更新を促す警告を表示する", () => {
    render(
      <BillingIssueAlert subscription={subscriptionWith("billing_issue")} />,
    );

    expect(screen.getByText("決済情報の更新が必要です")).toBeInTheDocument();
  });

  it("課金中（active）では表示しない", () => {
    render(<BillingIssueAlert subscription={subscriptionWith("active")} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("無料プランでは表示しない", () => {
    render(<BillingIssueAlert subscription={subscriptionWith("free")} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("サブスクリプション管理へ遷移するリンクになっている", () => {
    render(
      <BillingIssueAlert subscription={subscriptionWith("billing_issue")} />,
    );

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/account/subscription",
    );
  });

  it("失効に直結するため role=alert で通知する", () => {
    render(
      <BillingIssueAlert subscription={subscriptionWith("billing_issue")} />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("iOS 加入者も見るため App Store 前提の文言は使わない", () => {
    render(
      <BillingIssueAlert
        subscription={subscriptionWith("billing_issue", { platform: "ios" })}
      />,
    );

    expect(screen.getByRole("alert").textContent).not.toMatch(
      /App Store|Apple ID|Google Play/,
    );
  });
});
