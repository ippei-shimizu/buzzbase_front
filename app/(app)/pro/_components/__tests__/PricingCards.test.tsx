jest.mock("../CheckoutButton", () => {
  return function MockCheckoutButton(props: { label: string }) {
    return <button data-testid="checkout-trigger">{props.label}</button>;
  };
});

import { render, screen } from "@testing-library/react";
import PricingCards from "../PricingCards";

describe("PricingCards", () => {
  it("月額プランと年額プランの両方が表示される", () => {
    render(<PricingCards />);

    expect(screen.getByText("月額プラン")).toBeInTheDocument();
    expect(screen.getByText("年額プラン")).toBeInTheDocument();
    expect(screen.getByText("¥980")).toBeInTheDocument();
    expect(screen.getByText("¥9,800")).toBeInTheDocument();
  });

  it("両プランに CheckoutButton（モーダルトリガー）が配置されている", () => {
    render(<PricingCards />);
    expect(screen.getAllByTestId("checkout-trigger").length).toBe(2);
  });

  it("年額プランに「2 ヶ月分お得」のバッジが付く", () => {
    render(<PricingCards />);
    expect(screen.getByText("2 ヶ月分お得")).toBeInTheDocument();
  });
});
