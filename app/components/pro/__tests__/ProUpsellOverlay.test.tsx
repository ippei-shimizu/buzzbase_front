const openMock = jest.fn();
const closeMock = jest.fn();

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({ open: openMock, close: closeMock }),
}));

jest.mock("@app/(app)/pro/actions", () => ({
  getProStatus: jest.fn(),
}));

import { act, render, screen, fireEvent } from "@testing-library/react";
import { type ReactElement, type ReactNode } from "react";
import { getProStatus } from "@app/(app)/pro/actions";
import { ProStatusProvider } from "@app/components/pro/ProStatusProvider";
import { DEFAULT_PRO_STATUS, type ProStatus } from "@app/types/pro";
import { ProUpsellOverlay } from "../ProUpsellOverlay";

const mockGetProStatus = getProStatus as jest.MockedFunction<
  typeof getProStatus
>;

const FEATURE = "hit_direction_average";

const ctaQuery = { name: "Pro プランを見る（方向別の打率）" } as const;

const Wrapper = ({ children }: { children: ReactNode }) => (
  <ProStatusProvider>{children}</ProStatusProvider>
);

function setAuthCookies() {
  document.cookie = "access-token=test-access-token";
  document.cookie = "client=test-client";
  document.cookie = "uid=user@example.com";
}

function clearAuthCookies() {
  for (const name of ["access-token", "client", "uid"]) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

function makeProStatus(entitlements: string[]): ProStatus {
  return {
    subscription: {
      ...DEFAULT_PRO_STATUS.subscription,
      status: "active",
      pro_active: true,
    },
    entitlements: [
      ...DEFAULT_PRO_STATUS.entitlements,
      ...entitlements,
    ] as ProStatus["entitlements"],
  };
}

/**
 * ProStatusProvider の Server Action 解決を待って描画する。
 * proStatus に null を渡すと未認証（＝無料確定）として扱う。
 */
async function renderResolved(ui: ReactElement, proStatus: ProStatus | null) {
  if (proStatus) {
    setAuthCookies();
    mockGetProStatus.mockResolvedValue(proStatus);
  }

  let rendered!: ReturnType<typeof render>;
  await act(async () => {
    rendered = render(ui, { wrapper: Wrapper });
  });
  return rendered;
}

/** Pro 判定が未確定のまま止まっている状態で描画する。 */
async function renderPending(ui: ReactElement) {
  setAuthCookies();
  mockGetProStatus.mockReturnValue(new Promise(() => {}));

  let rendered!: ReturnType<typeof render>;
  await act(async () => {
    rendered = render(ui, { wrapper: Wrapper });
  });
  return rendered;
}

const overlay = (
  props: Partial<React.ComponentProps<typeof ProUpsellOverlay>> = {},
) => (
  <ProUpsellOverlay feature={FEATURE} {...props}>
    <p>打率 .333</p>
    <button type="button">詳細を見る</button>
  </ProUpsellOverlay>
);

describe("ProUpsellOverlay", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAuthCookies();
  });

  it("entitlement を持つ場合、children をそのまま表示し訴求を出さない", async () => {
    await renderResolved(overlay(), makeProStatus([FEATURE]));

    expect(screen.getByText("打率 .333")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "詳細を見る" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", ctaQuery)).not.toBeInTheDocument();
    expect(screen.queryByTestId("pro-upsell-scrim")).not.toBeInTheDocument();
  });

  it("entitlement を持たない場合、暗幕と CTA 付きカードを重ねて表示する", async () => {
    await renderResolved(overlay(), null);

    expect(screen.getByTestId("pro-upsell-scrim")).toBeInTheDocument();
    expect(screen.getByRole("button", ctaQuery)).toBeInTheDocument();
    expect(screen.getByText("方向別の打率")).toBeInTheDocument();
  });

  it("覆われた children は支援技術・キーボード操作から隠れる", async () => {
    await renderResolved(overlay(), null);

    const hiddenContainer = screen.getByText("打率 .333").parentElement;
    expect(hiddenContainer).toHaveAttribute("aria-hidden", "true");
    expect(hiddenContainer).toHaveAttribute("inert");
    expect(hiddenContainer).toHaveClass("pointer-events-none");
    // aria-hidden 配下は role 検索の対象外になる（＝スクリーンリーダーから辿れない）
    expect(
      screen.queryByRole("button", { name: "詳細を見る" }),
    ).not.toBeInTheDocument();
  });

  describe("暗幕", () => {
    it("children の全面を覆い、ポインタ操作を奪わない", async () => {
      await renderResolved(overlay(), null);

      const scrim = screen.getByTestId("pro-upsell-scrim");
      expect(scrim).toHaveClass("absolute", "inset-0", "pointer-events-none");
      expect(scrim).toHaveAttribute("aria-hidden", "true");
    });

    it("既定の不透明度で実データを読み取れないように塗る", async () => {
      await renderResolved(overlay(), null);

      expect(screen.getByTestId("pro-upsell-scrim")).toHaveStyle({
        backgroundColor: "rgba(26, 26, 26, 0.68)",
      });
    });

    it("scrimOpacity を指定すると不透明度に反映される", async () => {
      await renderResolved(overlay({ scrimOpacity: 0.95 }), null);

      expect(screen.getByTestId("pro-upsell-scrim")).toHaveStyle({
        backgroundColor: "rgba(26, 26, 26, 0.95)",
      });
    });

    it("訴求カードを出さない場合でも暗幕は残る", async () => {
      await renderResolved(overlay({ lockedIndicator: "none" }), null);

      expect(screen.getByTestId("pro-upsell-scrim")).toBeInTheDocument();
    });
  });

  it("判定確定前は暗幕のみで、訴求カードをフラッシュさせない", async () => {
    const { container } = await renderPending(overlay());

    expect(screen.getByTestId("pro-upsell-scrim")).toBeInTheDocument();
    expect(screen.queryByRole("button", ctaQuery)).not.toBeInTheDocument();
    expect(screen.queryByText("方向別の打率")).not.toBeInTheDocument();
    expect(
      screen.queryByText("この内容は Pro プラン限定です"),
    ).not.toBeInTheDocument();
    // 判定確定後にカードが差し込まれても高さが変わらないようにしておく
    expect(container.firstChild).toHaveClass("min-h-[200px]");
  });

  it("判定確定後もカード表示分の高さを維持したまま訴求へ切り替わる", async () => {
    const { container } = await renderResolved(overlay(), null);

    expect(container.firstChild).toHaveClass("min-h-[200px]");
    expect(screen.getByRole("button", ctaQuery)).toBeInTheDocument();
  });

  it("CTA を押すと feature を trigger にして ProUpgradeModal が開く", async () => {
    await renderResolved(overlay(), null);

    fireEvent.click(screen.getByRole("button", ctaQuery));

    expect(openMock).toHaveBeenCalledWith({
      trigger: FEATURE,
      defaultPlan: undefined,
    });
  });

  it("onCtaClick を渡すと既定のモーダル起動の代わりに呼ばれる", async () => {
    const onCtaClick = jest.fn();
    await renderResolved(overlay({ onCtaClick }), null);

    fireEvent.click(screen.getByRole("button", ctaQuery));

    expect(onCtaClick).toHaveBeenCalledTimes(1);
    expect(openMock).not.toHaveBeenCalled();
  });

  it("lockedIndicator が badge の場合、CTA カードの代わりにバッジを表示する", async () => {
    await renderResolved(overlay({ lockedIndicator: "badge" }), null);

    expect(screen.getByText("Pro限定")).toBeInTheDocument();
    expect(screen.queryByRole("button", ctaQuery)).not.toBeInTheDocument();
  });

  it("lockedIndicator が none の場合でもロック中であることを支援技術へ伝える", async () => {
    await renderResolved(overlay({ lockedIndicator: "none" }), null);

    expect(
      screen.getByText("この内容は Pro プラン限定です"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", ctaQuery)).not.toBeInTheDocument();
    expect(screen.queryByText("Pro限定")).not.toBeInTheDocument();
  });

  it("文言を上書きすると PRO_PAYWALL_COPY より優先される", async () => {
    await renderResolved(
      overlay({
        title: "方向別の打率は Pro 限定",
        benefits: ["引っ張り・流し打ちの傾向がわかる"],
      }),
      null,
    );

    expect(screen.getByText("方向別の打率は Pro 限定")).toBeInTheDocument();
    expect(
      screen.getByText("引っ張り・流し打ちの傾向がわかる"),
    ).toBeInTheDocument();
  });

  describe("unlocked を明示した場合", () => {
    it("false なら entitlement を持つユーザーにもロックを見せる", async () => {
      await renderResolved(
        overlay({ unlocked: false }),
        makeProStatus([FEATURE]),
      );

      expect(screen.getByTestId("pro-upsell-scrim")).toBeInTheDocument();
      expect(screen.getByRole("button", ctaQuery)).toBeInTheDocument();
    });

    it("false なら判定確定を待たずに訴求カードを出す", async () => {
      await renderPending(overlay({ unlocked: false }));

      expect(screen.getByRole("button", ctaQuery)).toBeInTheDocument();
    });

    it("true なら entitlement を持たないユーザーにも children を素通しする", async () => {
      await renderResolved(overlay({ unlocked: true }), null);

      expect(screen.getByText("打率 .333")).toBeInTheDocument();
      expect(screen.queryByTestId("pro-upsell-scrim")).not.toBeInTheDocument();
    });
  });
});
