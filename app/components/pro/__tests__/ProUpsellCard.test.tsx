const openMock = jest.fn();
const closeMock = jest.fn();

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({ open: openMock, close: closeMock }),
}));

import { render, screen, fireEvent } from "@testing-library/react";
import { PRO_PAYWALL_COPY } from "../paywallCopy";
import { ProUpsellCard } from "../ProUpsellCard";

const noteTagsCopy = PRO_PAYWALL_COPY.note_tags;

describe("ProUpsellCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("feature を渡すと PRO_PAYWALL_COPY の文言を表示する", () => {
    render(<ProUpsellCard feature="note_tags" />);

    expect(screen.getByText(noteTagsCopy.title)).toBeInTheDocument();
    expect(screen.getByText(noteTagsCopy.description)).toBeInTheDocument();
  });

  it("title / description を渡すと feature の文言より優先して表示する", () => {
    render(
      <ProUpsellCard
        feature="note_tags"
        title="独自タイトル"
        description="独自の説明"
      />,
    );

    expect(screen.getByText("独自タイトル")).toBeInTheDocument();
    expect(screen.getByText("独自の説明")).toBeInTheDocument();
    expect(screen.queryByText(noteTagsCopy.title)).not.toBeInTheDocument();
  });

  it("benefits を渡すと description ではなく箇条書きを表示する", () => {
    render(
      <ProUpsellCard
        feature="note_tags"
        benefits={["タグで分類", "タグから検索"]}
      />,
    );

    expect(screen.getByText("タグで分類")).toBeInTheDocument();
    expect(screen.getByText("タグから検索")).toBeInTheDocument();
    expect(
      screen.queryByText(noteTagsCopy.description),
    ).not.toBeInTheDocument();
  });

  it("CTA を押すと feature を trigger にして ProUpgradeModal が開く", () => {
    render(<ProUpsellCard feature="note_tags" />);

    fireEvent.click(screen.getByRole("button", { name: "Pro プランを見る" }));

    expect(openMock).toHaveBeenCalledWith({ trigger: "note_tags" });
  });

  it("feature を持たない場合は trigger なしで ProUpgradeModal が開く", () => {
    render(<ProUpsellCard title="準備中の機能" ctaLabel="詳しく見る" />);

    fireEvent.click(screen.getByRole("button", { name: "詳しく見る" }));

    expect(openMock).toHaveBeenCalledWith({ trigger: undefined });
  });
});
