const openMock = jest.fn();
const closeMock = jest.fn();

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({ open: openMock, close: closeMock }),
}));

jest.mock("@app/hooks/pro/useEntitlement", () => ({
  useEntitlement: jest.fn(),
}));

import { render, screen, fireEvent } from "@testing-library/react";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import { ProUpsellOverlay } from "../ProUpsellOverlay";

const mockUseEntitlement = useEntitlement as jest.MockedFunction<
  typeof useEntitlement
>;

function mockEntitlement({
  granted,
  isLoading = false,
}: {
  granted: boolean;
  isLoading?: boolean;
}) {
  mockUseEntitlement.mockReturnValue({
    isPro: granted,
    inTrial: false,
    inGracePeriod: false,
    isLoading,
    hasEntitlement: jest.fn(() => granted),
  });
}

function renderOverlay() {
  return render(
    <ProUpsellOverlay feature="hit_direction_average">
      <p>打率 .333</p>
      <button type="button">詳細を見る</button>
    </ProUpsellOverlay>,
  );
}

const ctaQuery = { name: "Pro プランを見る" } as const;

describe("ProUpsellOverlay", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("entitlement を持つ場合、children をそのまま表示し訴求を出さない", () => {
    mockEntitlement({ granted: true });

    renderOverlay();

    expect(screen.getByText("打率 .333")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "詳細を見る" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", ctaQuery)).not.toBeInTheDocument();
  });

  it("entitlement を持たない場合、暗幕と CTA 付きカードを重ねて表示する", () => {
    mockEntitlement({ granted: false });

    renderOverlay();

    expect(screen.getByRole("button", ctaQuery)).toBeInTheDocument();
    expect(screen.getByText("方向別の打率")).toBeInTheDocument();
  });

  it("覆われた children は支援技術・キーボード操作から隠れる", () => {
    mockEntitlement({ granted: false });

    renderOverlay();

    const hiddenContainer = screen.getByText("打率 .333").parentElement;
    expect(hiddenContainer).toHaveAttribute("aria-hidden", "true");
    expect(hiddenContainer).toHaveAttribute("inert");
    // aria-hidden 配下は role 検索の対象外になる（＝スクリーンリーダーから辿れない）
    expect(
      screen.queryByRole("button", { name: "詳細を見る" }),
    ).not.toBeInTheDocument();
  });

  it("判定確定前は暗幕のみで、訴求カードをフラッシュさせない", () => {
    mockEntitlement({ granted: false, isLoading: true });

    renderOverlay();

    expect(screen.queryByRole("button", ctaQuery)).not.toBeInTheDocument();
    expect(screen.queryByText("方向別の打率")).not.toBeInTheDocument();
    expect(screen.getByText("打率 .333").parentElement).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("CTA を押すと feature を trigger にして ProUpgradeModal が開く", () => {
    mockEntitlement({ granted: false });

    renderOverlay();
    fireEvent.click(screen.getByRole("button", ctaQuery));

    expect(openMock).toHaveBeenCalledWith({ trigger: "hit_direction_average" });
  });

  it("lockedIndicator が badge の場合、CTA カードの代わりにバッジを表示する", () => {
    mockEntitlement({ granted: false });

    render(
      <ProUpsellOverlay feature="hit_direction_average" lockedIndicator="badge">
        <p>打率 .333</p>
      </ProUpsellOverlay>,
    );

    expect(screen.getByText("Pro限定")).toBeInTheDocument();
    expect(screen.queryByRole("button", ctaQuery)).not.toBeInTheDocument();
  });

  it("文言を上書きすると PRO_PAYWALL_COPY より優先される", () => {
    mockEntitlement({ granted: false });

    render(
      <ProUpsellOverlay
        feature="hit_direction_average"
        title="方向別の打率は Pro 限定"
        benefits={["引っ張り・流し打ちの傾向がわかる"]}
      >
        <p>打率 .333</p>
      </ProUpsellOverlay>,
    );

    expect(screen.getByText("方向別の打率は Pro 限定")).toBeInTheDocument();
    expect(
      screen.getByText("引っ張り・流し打ちの傾向がわかる"),
    ).toBeInTheDocument();
  });
});
