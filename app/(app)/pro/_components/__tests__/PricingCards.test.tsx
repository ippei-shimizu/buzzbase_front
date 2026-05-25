jest.mock("../CheckoutButton", () => {
  return function MockCheckoutButton(props: { plan: string; label: string }) {
    return (
      <button data-testid={`checkout-${props.plan}`}>{props.label}</button>
    );
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

  it("両プランの CheckoutButton にそれぞれ plan が渡されている", () => {
    render(<PricingCards />);

    expect(screen.getByTestId("checkout-monthly")).toBeInTheDocument();
    expect(screen.getByTestId("checkout-yearly")).toBeInTheDocument();
  });

  it("年額プランに「2 ヶ月分お得」のバッジが付く", () => {
    render(<PricingCards />);
    expect(screen.getByText("2 ヶ月分お得")).toBeInTheDocument();
  });
});
