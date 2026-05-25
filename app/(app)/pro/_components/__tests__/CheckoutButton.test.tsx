const openMock = jest.fn();

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({ open: openMock, close: jest.fn() }),
}));

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CheckoutButton from "../CheckoutButton";

describe("CheckoutButton (LP CTA)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ボタンを押すと ProUpgradeModal を開く（trigger 無しの汎用呼び出し）", async () => {
    render(<CheckoutButton label="無料トライアルを始める" />);
    await userEvent.click(
      screen.getByRole("button", { name: "無料トライアルを始める" }),
    );

    expect(openMock).toHaveBeenCalledTimes(1);
    expect(openMock).toHaveBeenCalledWith();
  });
});
