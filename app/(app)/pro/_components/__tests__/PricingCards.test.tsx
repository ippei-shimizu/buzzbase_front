jest.mock("../CheckoutButton", () => {
  return function MockCheckoutButton(props: {
    label: string;
    defaultPlan?: string;
  }) {
    return (
      <button data-testid="checkout-trigger" data-plan={props.defaultPlan}>
        {props.label}
      </button>
    );
  };
});

import { render, screen, within } from "@testing-library/react";
import { PLAN_HIGHLIGHT_FEATURES } from "@app/components/pro/proFeatureCatalog";
import { PRO_PLAN_PRICES } from "@app/components/pro/proPricing";
import PricingCards from "../PricingCards";

describe("PricingCards", () => {
  it("月額プランと年額プランの両方が表示される", () => {
    render(<PricingCards />);

    expect(screen.getByText("月額プラン")).toBeInTheDocument();
    expect(screen.getByText("年額プラン")).toBeInTheDocument();
    expect(screen.getByText("¥300")).toBeInTheDocument();
    expect(screen.getByText("¥2,980")).toBeInTheDocument();
  });

  it("価格表示が PRO_PLAN_PRICES の単一情報源に一致する", () => {
    render(<PricingCards />);

    expect(
      screen.getByText(PRO_PLAN_PRICES.monthly.amount),
    ).toBeInTheDocument();
    expect(screen.getByText(PRO_PLAN_PRICES.yearly.amount)).toBeInTheDocument();
    expect(screen.getByText("月あたり ¥248")).toBeInTheDocument();
  });

  it("両プランに CheckoutButton（モーダルトリガー）が配置されている", () => {
    render(<PricingCards />);

    const triggers = screen.getAllByTestId("checkout-trigger");
    expect(triggers).toHaveLength(2);
    expect(triggers.map((trigger) => trigger.dataset.plan)).toEqual([
      "monthly",
      "yearly",
    ]);
  });

  it("年額プランに「2 ヶ月分お得」のバッジが付く", () => {
    render(<PricingCards />);
    expect(screen.getByText("2 ヶ月分お得")).toBeInTheDocument();
  });

  it("両プランに同じ代表機能を掲載する", () => {
    render(<PricingCards />);

    // 月額・年額のカードで機能差を付けていないため、各機能はカードの数だけ現れる。
    expect(screen.getAllByText("方向別の打率")).toHaveLength(2);
    expect(screen.getAllByText("カウント別の打率")).toHaveLength(2);
    expect(screen.getAllByText("球種別の打率")).toHaveLength(2);
    expect(screen.getAllByText("対戦投手別")).toHaveLength(2);
    expect(screen.getAllByText("練習と成績の関係を発見")).toHaveLength(2);
    expect(
      screen.getAllByText("週次・月次の振り返りレポートを受け取る"),
    ).toHaveLength(2);
  });

  it("カード内の機能数が PLAN_HIGHLIGHT_FEATURES と一致する", () => {
    render(<PricingCards />);

    const monthlyCard = screen.getByText("月額プラン").closest("article");
    expect(
      within(monthlyCard as HTMLElement).getAllByRole("listitem"),
    ).toHaveLength(PLAN_HIGHLIGHT_FEATURES.length);
  });

  it("アプリ版でのみ使える機能に「アプリ版」を明記する", () => {
    render(<PricingCards />);

    const adsItem = screen
      .getAllByText("広告を非表示にして集中する")[0]
      .closest("li");
    expect(
      within(adsItem as HTMLElement).getByText("アプリ版"),
    ).toBeInTheDocument();

    const directionItem = screen.getAllByText("方向別の打率")[0].closest("li");
    expect(
      within(directionItem as HTMLElement).queryByText("アプリ版"),
    ).not.toBeInTheDocument();
  });

  it("Web とアプリで共通の契約であることを伝える", () => {
    render(<PricingCards />);

    expect(
      screen.getByText(/Web\s*版とアプリ版で共通の1つの契約/),
    ).toBeInTheDocument();
  });
});
