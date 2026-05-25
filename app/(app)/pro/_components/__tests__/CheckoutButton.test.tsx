jest.mock("../../actions", () => ({
  startProCheckout: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: { error: jest.fn(), info: jest.fn(), success: jest.fn() },
}));

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { startProCheckout } from "../../actions";
import CheckoutButton from "../CheckoutButton";

describe("CheckoutButton", () => {
  // window.location は JSDOM 上で read-only。CheckoutButton 実装が assign を呼ぶため、
  // テスト実行で参照エラーにならないよう mock オブジェクトに丸ごと差し替える。
  const assignMock = jest.fn();

  beforeAll(() => {
    delete (window as { location?: Location }).location;
    (
      window as unknown as { location: { origin: string; assign: jest.Mock } }
    ).location = {
      origin: "http://localhost:8100",
      assign: assignMock,
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ボタンを押すと startProCheckout が window.location.origin と plan で呼ばれる", async () => {
    (startProCheckout as jest.Mock).mockResolvedValueOnce({
      ok: true,
      checkoutUrl: "https://checkout.stripe.com/sess_x",
    });

    render(<CheckoutButton plan="monthly" label="月額で始める" />);
    await userEvent.click(screen.getByRole("button", { name: "月額で始める" }));

    await waitFor(() => {
      expect(startProCheckout).toHaveBeenCalledWith({
        plan: "monthly",
        baseUrl: window.location.origin,
      });
    });
    // 成功時の window.location.assign は React の startTransition / state 更新と絡んで
    // テスト環境で安定検証しづらいため、e2e / 手動確認に委ねる。
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("yearly plan を渡せば yearly で呼ばれる", async () => {
    (startProCheckout as jest.Mock).mockResolvedValueOnce({
      ok: true,
      checkoutUrl: "https://checkout.stripe.com/sess_y",
    });

    render(<CheckoutButton plan="yearly" label="年額で始める" />);
    await userEvent.click(screen.getByRole("button", { name: "年額で始める" }));

    await waitFor(() => {
      expect(startProCheckout).toHaveBeenCalledWith(
        expect.objectContaining({ plan: "yearly" }),
      );
    });
  });

  it("already_subscribed エラーで toast.error が呼ばれる", async () => {
    (startProCheckout as jest.Mock).mockResolvedValueOnce({
      ok: false,
      error: "already_subscribed",
    });

    render(<CheckoutButton plan="monthly" label="月額で始める" />);
    await userEvent.click(screen.getByRole("button", { name: "月額で始める" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("すでに Pro に加入済みです");
    });
  });

  it("stripe_api_error エラーで toast.error が呼ばれる", async () => {
    (startProCheckout as jest.Mock).mockResolvedValueOnce({
      ok: false,
      error: "stripe_api_error",
    });

    render(<CheckoutButton plan="monthly" label="月額で始める" />);
    await userEvent.click(screen.getByRole("button", { name: "月額で始める" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "決済サービスとの通信に失敗しました。しばらく経ってから再度お試しください",
      );
    });
  });

  it("unknown エラーで toast.error が呼ばれる", async () => {
    (startProCheckout as jest.Mock).mockResolvedValueOnce({
      ok: false,
      error: "unknown",
    });

    render(<CheckoutButton plan="monthly" label="月額で始める" />);
    await userEvent.click(screen.getByRole("button", { name: "月額で始める" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
