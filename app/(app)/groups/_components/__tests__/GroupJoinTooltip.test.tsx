import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { GROUP_JOIN_TOOLTIP_SHOWN_STORAGE_KEY } from "@app/constants/onboarding";
import GroupJoinTooltip from "../GroupJoinTooltip";

const TOOLTIP_TEXT = "チームメイトから招待コードをもらって参加しよう";

describe("GroupJoinTooltip", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it("初回訪問ではツールチップが表示される", () => {
    render(<GroupJoinTooltip />);

    expect(screen.getByText(TOOLTIP_TEXT)).toBeInTheDocument();
  });

  it("2回目の訪問では表示されない", () => {
    const { unmount } = render(<GroupJoinTooltip />);
    expect(screen.getByText(TOOLTIP_TEXT)).toBeInTheDocument();
    unmount();

    render(<GroupJoinTooltip />);

    expect(screen.queryByText(TOOLTIP_TEXT)).not.toBeInTheDocument();
  });

  it("閉じるとその場で消え、再訪問しても表示されない", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<GroupJoinTooltip />);

    await user.click(screen.getByRole("button", { name: "ヒントを閉じる" }));
    expect(screen.queryByText(TOOLTIP_TEXT)).not.toBeInTheDocument();

    unmount();
    render(<GroupJoinTooltip />);

    expect(screen.queryByText(TOOLTIP_TEXT)).not.toBeInTheDocument();
  });

  it("表示済みフラグが保存されている状態では最初から表示されない", () => {
    localStorage.setItem(GROUP_JOIN_TOOLTIP_SHOWN_STORAGE_KEY, "1");

    render(<GroupJoinTooltip />);

    expect(screen.queryByText(TOOLTIP_TEXT)).not.toBeInTheDocument();
  });

  it("SSR 時点では描画されない（localStorage 読み込み前のちらつき防止）", () => {
    const html = renderToStaticMarkup(<GroupJoinTooltip />);

    expect(html).not.toContain(TOOLTIP_TEXT);
  });

  it("localStorage が例外を投げてもクラッシュせず表示もしない", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() => render(<GroupJoinTooltip />)).not.toThrow();
    expect(screen.queryByText(TOOLTIP_TEXT)).not.toBeInTheDocument();
  });

  it("保存に失敗しても初回表示は行われる", () => {
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    render(<GroupJoinTooltip />);

    expect(screen.getByText(TOOLTIP_TEXT)).toBeInTheDocument();
  });
});
