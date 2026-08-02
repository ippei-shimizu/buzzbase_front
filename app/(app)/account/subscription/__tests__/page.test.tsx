const mockCookieGet = jest.fn();
const mockRedirect = jest.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});
const mockRefresh = jest.fn();
const mockGetCachedProStatus = jest.fn();

jest.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: mockCookieGet }),
}));

jest.mock("next/navigation", () => ({
  redirect: (path: string) => mockRedirect(path),
  useRouter: () => ({ refresh: mockRefresh }),
}));

jest.mock("@app/(app)/pro/proStatus", () => ({
  getCachedProStatus: () => mockGetCachedProStatus(),
}));

jest.mock("@app/components/header/Header", () => ({
  __esModule: true,
  default: () => <header />,
}));

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DEFAULT_PRO_STATUS,
  type ProStatus,
  type ProSubscription,
  type SubscriptionStatus,
} from "@app/types/pro";
import AccountSubscriptionPage from "../page";

function setAuthCookies() {
  mockCookieGet.mockImplementation((key: string) => {
    const values: Record<string, { value: string }> = {
      "access-token": { value: "test-access-token" },
      client: { value: "test-client" },
      uid: { value: "user@example.com" },
    };
    return values[key];
  });
}

function buildStatus(subscription: Partial<ProSubscription>): ProStatus {
  return {
    ...DEFAULT_PRO_STATUS,
    subscription: { ...DEFAULT_PRO_STATUS.subscription, ...subscription },
  };
}

async function renderPage(subscription: Partial<ProSubscription>) {
  setAuthCookies();
  mockGetCachedProStatus.mockResolvedValueOnce(buildStatus(subscription));
  render(await AccountSubscriptionPage());
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("未認証", () => {
  it("認証 cookie が無ければ加入状態を取得せずにリダイレクトする", async () => {
    mockCookieGet.mockReturnValue(undefined);

    await expect(AccountSubscriptionPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/signup?auth_required=true");
    expect(mockGetCachedProStatus).not.toHaveBeenCalled();
  });

  it("認証 cookie が一部だけでもリダイレクトする", async () => {
    mockCookieGet.mockImplementation((key: string) =>
      key === "access-token" ? { value: "test-access-token" } : undefined,
    );

    await expect(AccountSubscriptionPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/signup?auth_required=true");
  });
});

describe("status ごとの表示", () => {
  const cases: {
    status: SubscriptionStatus;
    label: string;
    description: string;
    badgeClass: string;
  }[] = [
    {
      status: "free",
      label: "無料プラン",
      description: "Pro に加入するとすべての機能を利用できます。",
      badgeClass: "bg-[#6b7280]",
    },
    {
      status: "trial",
      label: "無料トライアル中",
      description: "期間中はいつでも解約できます。",
      badgeClass: "bg-[#3b82f6]",
    },
    {
      status: "active",
      label: "Pro 加入中",
      description: "Pro 機能をすべてご利用いただけます。",
      badgeClass: "bg-[#10b981]",
    },
    {
      status: "cancelled",
      label: "解約済み（期間内）",
      description: "次回更新日まで Pro 機能を利用できます。",
      badgeClass: "bg-[#f59e0b]",
    },
    {
      status: "billing_issue",
      label: "決済に問題があります",
      description: "お支払い情報を更新してください。",
      badgeClass: "bg-[#ef4444]",
    },
    {
      status: "expired",
      label: "Pro 期間終了",
      description: "再加入すると過去のデータも引き続き閲覧できます。",
      badgeClass: "bg-[#6b7280]",
    },
    {
      status: "pending",
      label: "処理中",
      description: "決済処理が完了するまでお待ちください。",
      badgeClass: "bg-[#6b7280]",
    },
  ];

  it.each(cases)(
    "status=$status は「$label」を表示する",
    async ({ status, label, description, badgeClass }) => {
      await renderPage({ status });

      const badge = screen.getByText(label);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass(badgeClass);
      expect(screen.getByText(description)).toBeInTheDocument();
    },
  );

  it("プラン種別を日本語ラベルで表示する", async () => {
    await renderPage({ status: "active", plan_type: "yearly" });

    expect(screen.getByText("年額プラン")).toBeInTheDocument();
  });
});

describe("加入 CTA", () => {
  it.each<SubscriptionStatus>(["free", "expired"])(
    "status=%s は Pro 加入導線を表示する",
    async (status) => {
      await renderPage({ status });

      expect(
        screen.getByRole("link", { name: "Pro に加入する" }),
      ).toHaveAttribute("href", "/pro");
    },
  );

  it.each<SubscriptionStatus>([
    "trial",
    "active",
    "cancelled",
    "billing_issue",
    "pending",
  ])("status=%s は Pro 加入導線を表示しない", async (status) => {
    await renderPage({ status });

    expect(
      screen.queryByRole("link", { name: "Pro に加入する" }),
    ).not.toBeInTheDocument();
  });
});

describe("期限の表示", () => {
  it("次回更新日と残り日数を表示する", async () => {
    await renderPage({
      status: "active",
      expires_at: "2026-06-30T00:00:00+09:00",
      days_remaining: 5,
    });

    expect(screen.getByText("次回更新日")).toBeInTheDocument();
    expect(screen.getByText("2026/6/30")).toBeInTheDocument();
    expect(screen.getByText("残り5日")).toBeInTheDocument();
  });

  it.each<SubscriptionStatus>(["cancelled", "expired"])(
    "status=%s は「利用期限」として表示する",
    async (status) => {
      await renderPage({ status, expires_at: "2026-06-30T00:00:00+09:00" });

      expect(screen.getByText("利用期限")).toBeInTheDocument();
      expect(screen.queryByText("次回更新日")).not.toBeInTheDocument();
    },
  );

  it("expires_at が無ければプレースホルダを表示し、残り日数は出さない", async () => {
    await renderPage({ status: "free" });

    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.queryByText("残り日数")).not.toBeInTheDocument();
  });
});

describe("加入媒体ごとの解約案内", () => {
  it("platform=ios は Web から解約できないことと Apple の導線を案内する", async () => {
    await renderPage({ status: "active", platform: "ios" });

    expect(
      screen.getByText(/Web からは解約できません/, { exact: false }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Apple のサブスクリプション管理を開く",
      }),
    ).toHaveAttribute("href", "https://apps.apple.com/account/subscriptions");
  });

  it("platform=android は Google Play の導線を案内する", async () => {
    await renderPage({ status: "active", platform: "android" });

    expect(
      screen.getByText(/Web からは解約できません/, { exact: false }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Google Play の定期購入を開く" }),
    ).toHaveAttribute(
      "href",
      "https://play.google.com/store/account/subscriptions",
    );
  });

  it("platform=web はストアへの誘導をせず問い合わせ導線を出す", async () => {
    await renderPage({ status: "active", platform: "web" });

    expect(
      screen.queryByText(/Web からは解約できません/),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "お問い合わせ" })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  it("加入媒体が不明なら解約案内を出さない", async () => {
    await renderPage({ status: "active", platform: null });

    expect(
      screen.queryByRole("region", { name: "解約について" }),
    ).not.toBeInTheDocument();
  });

  it("期限切れなら解約案内を出さない", async () => {
    await renderPage({ status: "expired", platform: "ios" });

    expect(
      screen.queryByRole("region", { name: "解約について" }),
    ).not.toBeInTheDocument();
  });
});

describe("取得失敗", () => {
  it("無料プランとして描画せず、再試行導線を出す", async () => {
    setAuthCookies();
    mockGetCachedProStatus.mockResolvedValueOnce(null);

    render(await AccountSubscriptionPage());

    expect(screen.queryByText("無料プラン")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Pro に加入する" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "加入状態を取得できませんでした",
    );
    expect(screen.getByRole("button", { name: "再試行" })).toBeInTheDocument();
  });

  it("再試行ボタンでサーバー側の再取得を促す", async () => {
    setAuthCookies();
    mockGetCachedProStatus.mockResolvedValueOnce(null);

    render(await AccountSubscriptionPage());
    await userEvent.click(screen.getByRole("button", { name: "再試行" }));

    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });
});
