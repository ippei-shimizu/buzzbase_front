import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { WALKTHROUGH_COMPLETED_STORAGE_KEY } from "@app/constants/onboarding";
import OnboardingWalkthroughGate from "../OnboardingWalkthroughGate";

const mockReplace = jest.fn();
let mockQueryString = "";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(mockQueryString),
}));

const FIRST_STEP_TITLE = "打者も投手も、入力するだけで自動計算";
const LAST_STEP_TITLE = "成長を1枚のグラフで";

const advanceToLastStep = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: "次へ" }));
  await user.click(screen.getByRole("button", { name: "次へ" }));
};

describe("OnboardingWalkthroughGate", () => {
  beforeEach(() => {
    localStorage.clear();
    mockReplace.mockClear();
    mockQueryString = "";
    jest.restoreAllMocks();
  });

  it("初回訪問ではウォークスルーを表示する", () => {
    render(<OnboardingWalkthroughGate />);

    expect(screen.getByText(FIRST_STEP_TITLE)).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("「はじめる」まで進むと次回訪問では表示されない", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<OnboardingWalkthroughGate />);

    await advanceToLastStep(user);
    expect(screen.getByText(LAST_STEP_TITLE)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "はじめる" }));

    unmount();
    mockReplace.mockClear();
    render(<OnboardingWalkthroughGate />);

    expect(screen.queryByText(FIRST_STEP_TITLE)).not.toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
  });

  it("スキップしても次回訪問では表示されない", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<OnboardingWalkthroughGate />);

    await user.click(screen.getByRole("button", { name: "スキップ" }));

    unmount();
    render(<OnboardingWalkthroughGate />);

    expect(screen.queryByText(FIRST_STEP_TITLE)).not.toBeInTheDocument();
  });

  it("完了すると next で指定されたパスへ遷移する", async () => {
    mockQueryString = `next=${encodeURIComponent("/mypage/buzz_user")}`;
    const user = userEvent.setup();
    render(<OnboardingWalkthroughGate />);

    await user.click(screen.getByRole("button", { name: "スキップ" }));

    expect(mockReplace).toHaveBeenCalledWith("/mypage/buzz_user");
  });

  it("next が未指定ならダッシュボードへ遷移する", async () => {
    const user = userEvent.setup();
    render(<OnboardingWalkthroughGate />);

    await user.click(screen.getByRole("button", { name: "スキップ" }));

    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
  });

  it("外部サイトを指す next は無視してダッシュボードへ遷移する", async () => {
    mockQueryString = `next=${encodeURIComponent("//evil.example.com")}`;
    const user = userEvent.setup();
    render(<OnboardingWalkthroughGate />);

    await user.click(screen.getByRole("button", { name: "スキップ" }));

    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
  });

  it("完了フラグが保存済みなら最初から表示せず遷移する", () => {
    localStorage.setItem(WALKTHROUGH_COMPLETED_STORAGE_KEY, "1");

    render(<OnboardingWalkthroughGate />);

    expect(screen.queryByText(FIRST_STEP_TITLE)).not.toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
  });

  it("SSR 時点では描画されない（読み込み確定前のちらつき防止）", () => {
    const html = renderToStaticMarkup(<OnboardingWalkthroughGate />);

    expect(html).toBe("");
  });

  it("localStorage が例外を投げてもクラッシュしない", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() => render(<OnboardingWalkthroughGate />)).not.toThrow();
    expect(screen.queryByText(FIRST_STEP_TITLE)).not.toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
  });

  it("保存に失敗しても完了操作で遷移する", async () => {
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    const user = userEvent.setup();
    render(<OnboardingWalkthroughGate />);

    await user.click(screen.getByRole("button", { name: "スキップ" }));

    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
  });

  it("遷移は一度きりで、完了操作の直後に重ねて呼ばれない", async () => {
    const user = userEvent.setup();
    render(<OnboardingWalkthroughGate />);

    await advanceToLastStep(user);
    await user.click(screen.getByRole("button", { name: "はじめる" }));

    expect(mockReplace).toHaveBeenCalledTimes(1);
  });
});
