const openMock = jest.fn();
const closeMock = jest.fn();

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({ open: openMock, close: closeMock }),
}));

jest.mock("@app/lib/analytics", () => ({
  trackEvent: jest.fn(),
}));

import { render, screen, fireEvent } from "@testing-library/react";
import { trackEvent } from "@app/lib/analytics";
import { DEFAULT_PAYWALL_COPY, PRO_PAYWALL_COPY } from "../paywallCopy";
import { ProUpsellCard } from "../ProUpsellCard";

const mockTrackEvent = trackEvent as jest.MockedFunction<typeof trackEvent>;

const noteTagsCopy = PRO_PAYWALL_COPY.note_tags;
// benefits を持たない機能。description 経路の検証に使う
const noAdsCopy = PRO_PAYWALL_COPY.no_ads;

const ctaName = (title: string) => `Pro プランを見る（${title}）`;

describe("ProUpsellCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("feature を渡すと PRO_PAYWALL_COPY の文言を表示する", () => {
    render(<ProUpsellCard feature="no_ads" />);

    expect(screen.getByText(noAdsCopy.title)).toBeInTheDocument();
    expect(screen.getByText(noAdsCopy.description)).toBeInTheDocument();
  });

  it("feature の benefits があれば description の代わりに箇条書きを表示する", () => {
    render(<ProUpsellCard feature="note_tags" />);

    for (const benefit of noteTagsCopy.benefits ?? []) {
      expect(screen.getByText(benefit)).toBeInTheDocument();
    }
    expect(
      screen.queryByText(noteTagsCopy.description),
    ).not.toBeInTheDocument();
  });

  it("title / description を渡すと feature の文言より優先して表示する", () => {
    render(
      <ProUpsellCard
        feature="no_ads"
        title="独自タイトル"
        description="独自の説明"
      />,
    );

    expect(screen.getByText("独自タイトル")).toBeInTheDocument();
    expect(screen.getByText("独自の説明")).toBeInTheDocument();
    expect(screen.queryByText(noAdsCopy.title)).not.toBeInTheDocument();
  });

  it("benefits を渡すと description ではなく箇条書きを表示する", () => {
    render(
      <ProUpsellCard
        feature="no_ads"
        benefits={["タグで分類", "タグから検索"]}
      />,
    );

    expect(screen.getByText("タグで分類")).toBeInTheDocument();
    expect(screen.getByText("タグから検索")).toBeInTheDocument();
    expect(screen.queryByText(noAdsCopy.description)).not.toBeInTheDocument();
  });

  it("feature も description も無い場合は共通の既定文言で本文を埋める", () => {
    render(<ProUpsellCard title="準備中の機能" />);

    expect(screen.getByText("準備中の機能")).toBeInTheDocument();
    expect(
      screen.getByText(DEFAULT_PAYWALL_COPY.description),
    ).toBeInTheDocument();
  });

  it("CTA を押すと feature を trigger にして ProUpgradeModal が開く", () => {
    render(<ProUpsellCard feature="note_tags" />);

    fireEvent.click(
      screen.getByRole("button", { name: ctaName(noteTagsCopy.title) }),
    );

    expect(openMock).toHaveBeenCalledWith({
      trigger: "note_tags",
      defaultPlan: undefined,
    });
  });

  it("defaultPlan を渡すとモーダルの初期プランとして引き継がれる", () => {
    render(<ProUpsellCard feature="note_tags" defaultPlan="monthly" />);

    fireEvent.click(
      screen.getByRole("button", { name: ctaName(noteTagsCopy.title) }),
    );

    expect(openMock).toHaveBeenCalledWith({
      trigger: "note_tags",
      defaultPlan: "monthly",
    });
  });

  it("feature を持たない場合は trigger なしで ProUpgradeModal が開く", () => {
    render(<ProUpsellCard title="準備中の機能" ctaLabel="詳しく見る" />);

    fireEvent.click(
      screen.getByRole("button", { name: "詳しく見る（準備中の機能）" }),
    );

    expect(openMock).toHaveBeenCalledWith({
      trigger: undefined,
      defaultPlan: undefined,
    });
  });

  it("onCtaClick を渡すと既定のモーダル起動の代わりに呼ばれる", () => {
    const onCtaClick = jest.fn();
    render(<ProUpsellCard feature="note_tags" onCtaClick={onCtaClick} />);

    fireEvent.click(
      screen.getByRole("button", { name: ctaName(noteTagsCopy.title) }),
    );

    expect(onCtaClick).toHaveBeenCalledTimes(1);
    expect(openMock).not.toHaveBeenCalled();
  });

  it("CTA 押下を feature 付きで計測する", () => {
    render(<ProUpsellCard feature="note_tags" />);

    fireEvent.click(
      screen.getByRole("button", { name: ctaName(noteTagsCopy.title) }),
    );

    expect(mockTrackEvent).toHaveBeenCalledWith("pro_upsell_cta_click", {
      feature: "note_tags",
    });
  });

  it("onCtaClick で挙動を差し替えても計測は発火する", () => {
    render(<ProUpsellCard title="準備中の機能" onCtaClick={jest.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: ctaName("準備中の機能") }),
    );

    expect(mockTrackEvent).toHaveBeenCalledWith("pro_upsell_cta_click", {
      feature: "unspecified",
    });
  });

  it("CTA のアクセシブル名に見出しを含めて他ブロックと区別できる", () => {
    render(
      <>
        <ProUpsellCard feature="hit_direction_average" />
        <ProUpsellCard feature="pitch_type_average" />
      </>,
    );

    expect(
      screen.getByRole("button", { name: ctaName("方向別の打率") }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: ctaName("球種別の打率") }),
    ).toBeInTheDocument();
  });
});
