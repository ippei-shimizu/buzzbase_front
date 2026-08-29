jest.mock("../adConfig", () => ({
  ADSENSE_CLIENT_ID: "ca-pub-test",
  isAdsenseEnabled: true,
}));

jest.mock("@app/(app)/pro/actions", () => ({
  getProStatus: jest.fn(),
}));

import { act, render } from "@testing-library/react";
import { getProStatus } from "@app/(app)/pro/actions";
import { ProStatusProvider } from "@app/components/pro/ProStatusProvider";
import { DEFAULT_PRO_STATUS, type ProStatus } from "@app/types/pro";
import AdBanner from "../AdBanner";

const mockGetProStatus = getProStatus as jest.MockedFunction<
  typeof getProStatus
>;

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

function makeProStatus(entitlements: ProStatus["entitlements"]): ProStatus {
  return {
    subscription: {
      ...DEFAULT_PRO_STATUS.subscription,
      status: "active",
      pro_active: true,
    },
    entitlements,
  };
}

function renderWithProvider() {
  const view = render(
    <ProStatusProvider>
      <AdBanner slot="1234567890" />
    </ProStatusProvider>,
  );

  return {
    ...view,
    hasAd: () => view.container.querySelector("ins.adsbygoogle") !== null,
  };
}

describe("広告の no_ads ゲート（ProStatusProvider 連携）", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAuthCookies();
    (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle = [];
  });

  it("未認証ユーザーには Server Action を待たずに広告を描画する", async () => {
    const { hasAd } = renderWithProvider();

    await act(async () => {});

    expect(mockGetProStatus).not.toHaveBeenCalled();
    expect(hasAd()).toBe(true);
  });

  it("Pro 加入者には判定確定前も確定後も広告を描画しない", async () => {
    setAuthCookies();
    let resolveProStatus!: (status: ProStatus) => void;
    mockGetProStatus.mockReturnValue(
      new Promise<ProStatus>((resolve) => {
        resolveProStatus = resolve;
      }),
    );

    const { hasAd } = renderWithProvider();

    expect(hasAd()).toBe(false);

    await act(async () => {
      resolveProStatus(
        makeProStatus([...DEFAULT_PRO_STATUS.entitlements, "no_ads"]),
      );
    });

    expect(hasAd()).toBe(false);
    expect(
      (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle.length,
    ).toBe(0);
  });

  it("ログイン中の無料ユーザーには判定確定後に広告を描画する", async () => {
    setAuthCookies();
    let resolveProStatus!: (status: ProStatus) => void;
    mockGetProStatus.mockReturnValue(
      new Promise<ProStatus>((resolve) => {
        resolveProStatus = resolve;
      }),
    );

    const { hasAd } = renderWithProvider();

    expect(hasAd()).toBe(false);

    await act(async () => {
      resolveProStatus({
        ...DEFAULT_PRO_STATUS,
        subscription: { ...DEFAULT_PRO_STATUS.subscription },
      });
    });

    expect(hasAd()).toBe(true);
  });
});
