const mockCookieGet = jest.fn();
const mockRedirect = jest.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});
const mockRefresh = jest.fn();
const mockGetCachedProStatusResult = jest.fn();
const mockCancelWebSubscription = jest.fn();
const mockChangeProPlan = jest.fn();
const mockSyncProStatus = jest.fn();
const mockSubmitCancellationFeedback = jest.fn();
const mockGetCachedFeatureFlagDecision = jest.fn();

jest.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: mockCookieGet }),
}));

jest.mock("next/navigation", () => ({
  redirect: (path: string) => mockRedirect(path),
  useRouter: () => ({ refresh: mockRefresh }),
}));

jest.mock("@app/(app)/pro/proStatus", () => ({
  getCachedProStatusResult: () => mockGetCachedProStatusResult(),
}));

jest.mock("@app/(app)/pro/actions", () => ({
  syncProStatus: () => mockSyncProStatus(),
}));

jest.mock("@app/featureFlags/cachedFeatureFlags", () => ({
  getCachedFeatureFlagDecision: (key: string) =>
    mockGetCachedFeatureFlagDecision(key),
}));

jest.mock("../actions", () => ({
  cancelWebSubscription: () => mockCancelWebSubscription(),
  changeProPlan: (plan: string) => mockChangeProPlan(plan),
  submitCancellationFeedback: (input: unknown) =>
    mockSubmitCancellationFeedback(input),
}));

jest.mock("@app/components/header/Header", () => ({
  __esModule: true,
  default: () => <header />,
}));

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({ open: jest.fn(), close: jest.fn() }),
}));

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DEFAULT_PRO_STATUS,
  type Platform,
  type ProStatus,
  type ProSubscription,
  type SubscriptionStatus,
} from "@app/types/pro";
import AccountSubscriptionPage, { metadata } from "../page";

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
  mockGetCachedProStatusResult.mockResolvedValueOnce({
    status: "ok",
    proStatus: buildStatus(subscription),
  });
  render(await AccountSubscriptionPage());
}

async function renderLoadFailure(reason: "unauthorized" | "error") {
  setAuthCookies();
  mockGetCachedProStatusResult.mockResolvedValueOnce({ status: reason });
  render(await AccountSubscriptionPage());
}

const cancelSection = () =>
  screen.queryByRole("region", { name: "解約について" });

const billingSection = () =>
  screen.queryByRole("region", { name: "お支払い情報の更新" });

const planChangeSection = () =>
  screen.queryByRole("region", { name: "プラン変更について" });

beforeEach(() => {
  jest.clearAllMocks();
  // 既定は同期成功。プラン変更の成功パスは必ずここを通るため、
  // 明示しないテストが「同期できていない」表示に引きずられないようにする。
  mockSyncProStatus.mockResolvedValue(DEFAULT_PRO_STATUS);
  // アンケートは opt-in の flag。既定を無効にして、明示したテストだけがモーダルを見る。
  mockGetCachedFeatureFlagDecision.mockResolvedValue("disabled");
});

describe("メタデータ", () => {
  it("加入内容を含むため検索エンジンに登録させない", () => {
    expect(metadata.robots).toEqual({ index: false });
  });

  it("タイトルを設定する", () => {
    expect(metadata.title).toBe("サブスクリプション管理");
  });
});

describe("未認証", () => {
  it("認証 cookie が無ければ加入状態を取得せずにリダイレクトする", async () => {
    mockCookieGet.mockReturnValue(undefined);

    await expect(AccountSubscriptionPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/signup?auth_required=true");
    expect(mockGetCachedProStatusResult).not.toHaveBeenCalled();
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
    pro_active: boolean;
    label: string;
    description: string;
    badgeClass: string;
  }[] = [
    {
      status: "free",
      pro_active: false,
      label: "無料プラン",
      description: "Pro に加入するとすべての機能を利用できます。",
      badgeClass: "bg-[#6b7280]",
    },
    {
      status: "trial",
      pro_active: true,
      label: "無料トライアル中",
      description: "期間中はいつでも解約できます。",
      badgeClass: "bg-[#3b82f6]",
    },
    {
      status: "active",
      pro_active: true,
      label: "Pro 加入中",
      description: "Pro 機能をすべてご利用いただけます。",
      badgeClass: "bg-[#10b981]",
    },
    {
      status: "cancelled",
      pro_active: true,
      label: "解約済み（期間内）",
      description: "次回更新日まで Pro 機能を利用できます。",
      badgeClass: "bg-[#f59e0b]",
    },
    {
      status: "billing_issue",
      pro_active: true,
      label: "決済に問題があります",
      description: "お支払い情報を更新してください。",
      badgeClass: "bg-[#ef4444]",
    },
    {
      status: "expired",
      pro_active: false,
      label: "Pro 期間終了",
      description: "再加入すると過去のデータも引き続き閲覧できます。",
      badgeClass: "bg-[#6b7280]",
    },
    {
      status: "pending",
      pro_active: false,
      label: "処理中",
      description: "決済処理が完了するまでお待ちください。",
      badgeClass: "bg-[#6b7280]",
    },
  ];

  it.each(cases)(
    "status=$status は「$label」を表示する",
    async ({ status, pro_active, label, description, badgeClass }) => {
      await renderPage({ status, pro_active });

      const badge = screen.getByText(label);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass(badgeClass);
      expect(screen.getByText(description)).toBeInTheDocument();
    },
  );

  it.each([
    { plan_type: "monthly" as const, label: "月額プラン" },
    { plan_type: "yearly" as const, label: "年額プラン" },
  ])(
    "plan_type=$plan_type を「$label」と表示する",
    async ({ plan_type, label }) => {
      await renderPage({ status: "active", pro_active: true, plan_type });

      expect(screen.getByText(label)).toBeInTheDocument();
    },
  );
});

// status は加入中のままでも pro_active が落ちている状態は webhook 到達前・失敗時に必ず通る。
describe("pro_active=false のときの表示", () => {
  const cases: {
    status: SubscriptionStatus;
    description: string;
  }[] = [
    {
      status: "trial",
      description:
        "無料トライアル期間は終了しています。引き続き利用するには Pro に加入してください。",
    },
    {
      status: "active",
      description:
        "ご利用期間は終了しています。お支払い後の反映には時間がかかる場合があります。",
    },
    {
      status: "cancelled",
      description:
        "ご利用期間は終了しています。再加入すると引き続き Pro 機能を利用できます。",
    },
    {
      status: "billing_issue",
      description:
        "お支払いを確認できず、Pro 機能のご利用は停止しています。お支払い情報を更新してください。",
    },
  ];

  it.each(cases)(
    "status=$status + pro_active=false は利用終了として説明する",
    async ({ status, description }) => {
      await renderPage({
        status,
        pro_active: false,
        expires_at: "2025-01-01T00:00:00+09:00",
        days_remaining: 0,
      });

      expect(screen.getByText(description)).toBeInTheDocument();
    },
  );

  it("status=cancelled + 期限切れでも「次回更新日まで利用できます」とは言わない", async () => {
    await renderPage({
      status: "cancelled",
      pro_active: false,
      expires_at: "2025-01-01T00:00:00+09:00",
      days_remaining: 0,
    });

    expect(
      screen.queryByText("次回更新日まで Pro 機能を利用できます。"),
    ).not.toBeInTheDocument();
  });

  it.each<SubscriptionStatus>(["trial", "active", "cancelled"])(
    "status=%s でも pro_active=false なら残り日数を出さない",
    async (status) => {
      await renderPage({
        status,
        pro_active: false,
        expires_at: "2025-01-01T00:00:00+09:00",
        days_remaining: 12,
      });

      expect(screen.queryByText("残り日数")).not.toBeInTheDocument();
      expect(screen.queryByText("12日")).not.toBeInTheDocument();
    },
  );
});

describe("加入 CTA", () => {
  it.each<SubscriptionStatus>(["free", "expired"])(
    "status=%s は Pro 加入導線を表示する",
    async (status) => {
      await renderPage({ status });

      expect(
        screen.getByRole("button", { name: "Pro に加入する" }),
      ).toBeInTheDocument();
    },
  );

  it.each<SubscriptionStatus>([
    "trial",
    "active",
    "cancelled",
    "billing_issue",
    "pending",
  ])("status=%s は Pro 加入導線を表示しない", async (status) => {
    await renderPage({ status, pro_active: true });

    expect(
      screen.queryByRole("button", { name: "Pro に加入する" }),
    ).not.toBeInTheDocument();
  });
});

describe("期限の表示", () => {
  it("次回更新日と残り日数を表示する", async () => {
    await renderPage({
      status: "active",
      pro_active: true,
      expires_at: "2026-06-30T00:00:00+09:00",
      days_remaining: 5,
    });

    expect(screen.getByText("次回更新日")).toBeInTheDocument();
    expect(screen.getByText("2026/6/30")).toBeInTheDocument();
    expect(screen.getByText("残り日数")).toBeInTheDocument();
    expect(screen.getByText("5日")).toBeInTheDocument();
  });

  it("残り日数が 0 でも行を出す（back は下限 0 を返す）", async () => {
    await renderPage({
      status: "active",
      pro_active: true,
      expires_at: "2026-06-30T00:00:00+09:00",
      days_remaining: 0,
    });

    expect(screen.getByText("残り日数")).toBeInTheDocument();
    expect(screen.getByText("0日")).toBeInTheDocument();
  });

  it("「残り日数: 残り0日」のように二重表現しない", async () => {
    await renderPage({
      status: "active",
      pro_active: true,
      expires_at: "2026-06-30T00:00:00+09:00",
      days_remaining: 0,
    });

    expect(screen.queryByText("残り0日")).not.toBeInTheDocument();
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

  it("expires_at が壊れていればプレースホルダを表示する", async () => {
    await renderPage({ status: "active", pro_active: true, expires_at: "－" });

    expect(screen.getByText("—")).toBeInTheDocument();
  });
});

describe("加入媒体ごとの解約案内", () => {
  it("platform=ios は Apple の解約手順を4ステップで案内する", async () => {
    await renderPage({ status: "active", pro_active: true, platform: "ios" });

    const section = cancelSection();
    expect(section).toBeInTheDocument();
    expect(
      within(section!).getByText(/Web からは解約できません/, { exact: false }),
    ).toBeInTheDocument();

    const steps = within(section!).getAllByRole("listitem");
    expect(steps.map((step) => step.textContent)).toEqual([
      "「設定」アプリを開く",
      "上部のあなたの名前（Apple ID）をタップ",
      "「サブスクリプション」をタップ",
      "「BUZZ BASE Pro」を選び、解約を完了",
    ]);
  });

  it("platform=ios は Apple の管理画面を別タブで開く", async () => {
    await renderPage({ status: "active", pro_active: true, platform: "ios" });

    const link = screen.getByRole("link", {
      name: "Apple のサブスクリプション管理を開く",
    });
    expect(link).toHaveAttribute(
      "href",
      "https://apps.apple.com/account/subscriptions",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("platform=android は Google Play の解約手順を4ステップで案内する", async () => {
    await renderPage({
      status: "active",
      pro_active: true,
      platform: "android",
    });

    const section = cancelSection();
    expect(section).toBeInTheDocument();
    expect(
      within(section!).getByText(/Web からは解約できません/, { exact: false }),
    ).toBeInTheDocument();

    const steps = within(section!).getAllByRole("listitem");
    expect(steps.map((step) => step.textContent)).toEqual([
      "Google Play ストアを開く",
      "右上のプロフィールアイコンをタップ",
      "「お支払いと定期購入」→「定期購入」をタップ",
      "「BUZZ BASE Pro」を選び、解約を完了",
    ]);
  });

  it("platform=android は Google Play を別タブで開く", async () => {
    await renderPage({
      status: "active",
      pro_active: true,
      platform: "android",
    });

    const link = screen.getByRole("link", {
      name: "Google Play の定期購入を開く",
    });
    expect(link).toHaveAttribute(
      "href",
      "https://play.google.com/store/account/subscriptions",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("platform=web はこの画面で解約できることを案内する（特商法表記と一致）", async () => {
    await renderPage({ status: "active", pro_active: true, platform: "web" });

    const section = cancelSection();
    expect(section).toBeInTheDocument();
    expect(
      within(section!).getByText(/この画面からいつでも解約できます/),
    ).toBeInTheDocument();
    expect(
      within(section!).queryByText(/準備中/, { exact: false }),
    ).not.toBeInTheDocument();
    expect(
      within(section!).getByRole("button", { name: "この画面で解約する" }),
    ).toBeInTheDocument();
  });

  it("加入媒体が不明でも案内を消さず、問い合わせ導線を出す", async () => {
    await renderPage({ status: "active", pro_active: true, platform: null });

    const section = cancelSection();
    expect(section).toBeInTheDocument();
    expect(
      within(section!).getByText(/ご加入の媒体を判別できませんでした/),
    ).toBeInTheDocument();

    const link = within(section!).getByRole("link", { name: "お問い合わせ" });
    expect(link).toHaveAttribute("href", "/contact");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
    expect(
      within(section!).queryByRole("button", { name: "この画面で解約する" }),
    ).not.toBeInTheDocument();
  });

  it.each<SubscriptionStatus>([
    "free",
    "cancelled",
    "billing_issue",
    "expired",
    "pending",
  ])("status=%s には解約案内を出さない", async (status) => {
    await renderPage({ status, platform: "ios" });

    expect(cancelSection()).not.toBeInTheDocument();
  });
});

describe("Web 解約", () => {
  async function openCancelDialog() {
    await renderPage({ status: "active", pro_active: true, platform: "web" });
    await userEvent.click(
      screen.getByRole("button", { name: "この画面で解約する" }),
    );
  }

  it("確認ダイアログを開くまでは解約 API を叩かない", async () => {
    await renderPage({ status: "active", pro_active: true, platform: "web" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mockCancelWebSubscription).not.toHaveBeenCalled();
  });

  it("確認ダイアログで次回更新日まで使えることを明示する", async () => {
    await openCancelDialog();

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText(/次回更新日までは引き続きご利用いただけます/),
    ).toBeInTheDocument();
    expect(mockCancelWebSubscription).not.toHaveBeenCalled();
  });

  it("閉じるボタンで解約せずにダイアログを閉じる", async () => {
    await openCancelDialog();
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "閉じる",
      }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mockCancelWebSubscription).not.toHaveBeenCalled();
  });

  it("解約を確定すると API を呼び、完了と再取得を行う", async () => {
    mockCancelWebSubscription.mockResolvedValue({ ok: true });
    await openCancelDialog();

    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "解約する",
      }),
    );

    expect(mockCancelWebSubscription).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByText("解約申請を受け付けました"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("次回更新日まで引き続き Pro 機能をご利用いただけます。"),
    ).toBeInTheDocument();
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("有効な契約が無いときは解約済み・別媒体の可能性を伝える", async () => {
    mockCancelWebSubscription.mockResolvedValue({
      ok: false,
      error: "no_active_subscription",
    });
    await openCancelDialog();

    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "解約する",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "解約できるご契約が見つかりませんでした",
    );
    expect(
      screen.queryByText("解約申請を受け付けました"),
    ).not.toBeInTheDocument();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it("決済サービス障害のときは課金が継続していることを伝える", async () => {
    mockCancelWebSubscription.mockResolvedValue({
      ok: false,
      error: "stripe_api_error",
    });
    await openCancelDialog();

    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "解約する",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "決済サービスとの通信に失敗しました",
    );
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it("トークン失効のときは再ログインを促す", async () => {
    mockCancelWebSubscription.mockResolvedValue({
      ok: false,
      error: "unauthorized",
    });
    await openCancelDialog();

    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "解約する",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "ログインの有効期限が切れています",
    );
  });
});

describe("プラン変更の出し分け", () => {
  const webActive = {
    status: "active" as const,
    pro_active: true,
    platform: "web" as const,
  };

  it.each([
    { plan_type: "monthly" as const, buttonLabel: "年額プランに変更する" },
    { plan_type: "yearly" as const, buttonLabel: "月額プランに変更する" },
  ])(
    "plan_type=$plan_type の Web 加入者には「$buttonLabel」を出す",
    async ({ plan_type, buttonLabel }) => {
      await renderPage({ ...webActive, plan_type });

      const section = planChangeSection();
      expect(section).toBeInTheDocument();
      expect(
        within(section!).getByRole("button", { name: buttonLabel }),
      ).toBeInTheDocument();
    },
  );

  // 部分一致だけだと文の途中を書き換えても素通りするため、案内文は一言一句そのまま照合する。
  // 期待値はコンポーネント側の定数を import せずテストに直書きし、文言変更を必ず失敗させる。
  it("切り替え前の案内は請求サイクルの変化・日割り・返金なしを一言一句そのまま伝える", async () => {
    await renderPage({ ...webActive, plan_type: "monthly" });

    expect(
      within(planChangeSection()!).getByText(
        "月額プランと年額プランはいつでも切り替えられます。切り替えた時点で請求サイクルが新しいプランの周期に変わり、お支払い済みの未使用期間分は日割りで差額に反映されます（現金でのご返金は行いません）。",
      ),
    ).toBeInTheDocument();
  });

  it("切り替え前の案内で請求サイクルが変わらないとは言わない", async () => {
    await renderPage({ ...webActive, plan_type: "monthly" });

    expect(
      within(planChangeSection()!).queryByText(
        /請求サイクルは現在の更新日のまま変わらず/,
      ),
    ).not.toBeInTheDocument();
  });

  it.each<"ios" | "android">(["ios", "android"])(
    "platform=%s のストア課金には出さない",
    async (platform) => {
      await renderPage({ ...webActive, platform, plan_type: "monthly" });

      expect(planChangeSection()).not.toBeInTheDocument();
    },
  );

  it("加入媒体が不明なときは出さない", async () => {
    await renderPage({ ...webActive, platform: null, plan_type: "monthly" });

    expect(planChangeSection()).not.toBeInTheDocument();
  });

  it("Pro 未加入には出さない", async () => {
    await renderPage({ status: "free", platform: "web" });

    expect(planChangeSection()).not.toBeInTheDocument();
  });

  it("status=active でも pro_active=false なら出さない", async () => {
    await renderPage({ ...webActive, pro_active: false, plan_type: "monthly" });

    expect(planChangeSection()).not.toBeInTheDocument();
  });

  it("現在のプランが不明なときは出さない", async () => {
    await renderPage({ ...webActive, plan_type: null });

    expect(planChangeSection()).not.toBeInTheDocument();
  });

  it.each<SubscriptionStatus>([
    "trial",
    "cancelled",
    "billing_issue",
    "expired",
    "pending",
  ])("status=%s には出さない", async (status) => {
    await renderPage({
      status,
      pro_active: true,
      platform: "web",
      plan_type: "monthly",
    });

    expect(planChangeSection()).not.toBeInTheDocument();
  });
});

describe("プラン変更", () => {
  async function openPlanChangeDialog(plan_type: "monthly" | "yearly") {
    await renderPage({
      status: "active",
      pro_active: true,
      platform: "web",
      plan_type,
    });
    await userEvent.click(
      screen.getByRole("button", {
        name:
          plan_type === "monthly"
            ? "年額プランに変更する"
            : "月額プランに変更する",
      }),
    );
  }

  const confirm = () =>
    userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "変更する",
      }),
    );

  it("確認ダイアログを開くまではプラン変更 API を叩かない", async () => {
    await renderPage({
      status: "active",
      pro_active: true,
      platform: "web",
      plan_type: "monthly",
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mockChangeProPlan).not.toHaveBeenCalled();
  });

  // 支払いタイミングと差額の扱いは消費者保護上いちばん重い説明なので、
  // 部分一致ではなく全文一致で固定する。期待文字列はコンポーネントから import せず直書きする。
  it("月額→年額の説明を一言一句そのまま表示する", async () => {
    await openPlanChangeDialog("monthly");

    expect(
      within(screen.getByRole("dialog")).getByText(
        "年額プランに変更すると、請求サイクルが変更時点から 1 年周期に切り替わり、年額料金がすぐに請求されます。お支払い済みの月額プランの未使用期間分は日割りで計算され、その請求から差し引かれます。",
      ),
    ).toBeInTheDocument();
    expect(mockChangeProPlan).not.toHaveBeenCalled();
  });

  it("月額→年額は年額料金が「すぐに」請求されると伝え、次回更新日まで待てるとは言わない", async () => {
    await openPlanChangeDialog("monthly");

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText(/年額料金がすぐに請求されます/),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByText(/年額料金は次回更新日に請求されます/),
    ).not.toBeInTheDocument();
  });

  it("年額→月額の説明を一言一句そのまま表示する", async () => {
    await openPlanChangeDialog("yearly");

    expect(
      within(screen.getByRole("dialog")).getByText(
        "月額プランに変更すると、請求サイクルが変更時点から 1 か月周期に切り替わります。お支払い済みの年額プランの未使用期間分は日割りでクレジットとして計上され、次回以降のお支払いに充当されます（現金でのご返金は行いません）。クレジットを使い切るまでは請求額が 0 円になる場合があります。",
      ),
    ).toBeInTheDocument();
  });

  it("年額→月額はクレジットを使い切るまで請求 0 円になりうると伝え、残額失効とは言わない", async () => {
    await openPlanChangeDialog("yearly");

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText(
        /クレジットを使い切るまでは請求額が 0 円になる場合があります/,
      ),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByText(/翌月分のみに充当され、残額は失効します/),
    ).not.toBeInTheDocument();
  });

  it("月額→年額の説明で「返金します」とは言わない", async () => {
    await openPlanChangeDialog("monthly");

    expect(
      within(screen.getByRole("dialog")).queryByText(/返金します/),
    ).not.toBeInTheDocument();
  });

  it("閉じるボタンで変更せずにダイアログを閉じる", async () => {
    await openPlanChangeDialog("monthly");
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "閉じる",
      }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mockChangeProPlan).not.toHaveBeenCalled();
  });

  it.each([
    { plan_type: "monthly" as const, sentPlan: "yearly" },
    { plan_type: "yearly" as const, sentPlan: "monthly" },
  ])(
    "plan_type=$plan_type の確定で plan=$sentPlan を送る",
    async ({ plan_type, sentPlan }) => {
      mockChangeProPlan.mockResolvedValue({ ok: true });
      await openPlanChangeDialog(plan_type);

      await confirm();

      expect(mockChangeProPlan).toHaveBeenCalledTimes(1);
      expect(mockChangeProPlan).toHaveBeenCalledWith(sentPlan);
    },
  );

  it("変更を確定すると完了を伝えて状態を再取得する", async () => {
    mockChangeProPlan.mockResolvedValue({ ok: true });
    await openPlanChangeDialog("monthly");

    await confirm();

    expect(
      await screen.findByText("プラン変更を受け付けました"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "日割りの差額は決済サービスから届く請求書メールでご確認ください。",
      ),
    ).toBeInTheDocument();
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  // back のプラン変更 API は expires_at を書き戻さないため、同期しないと旧プランの
  // 期限のまま pro_active が落ちる。金銭的な損失に直結するので変更成功ごとに必ず叩く。
  it("変更成功後は再取得の前に Pro 状態を同期する", async () => {
    mockChangeProPlan.mockResolvedValue({ ok: true });
    await openPlanChangeDialog("monthly");

    await confirm();

    expect(
      await screen.findByText("プラン変更を受け付けました"),
    ).toBeInTheDocument();
    expect(mockSyncProStatus).toHaveBeenCalledTimes(1);
    expect(mockSyncProStatus.mock.invocationCallOrder[0]).toBeLessThan(
      mockRefresh.mock.invocationCallOrder[0],
    );
  });

  it("同期に成功したときは反映待ちの注意書きを出さない", async () => {
    mockChangeProPlan.mockResolvedValue({ ok: true });
    await openPlanChangeDialog("monthly");

    await confirm();

    expect(
      await screen.findByText("プラン変更を受け付けました"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/反映されるまで少し時間がかかる場合があります/),
    ).not.toBeInTheDocument();
  });

  // 変更自体は Stripe が受理済みなので、同期の失敗で変更を失敗扱いにしてはいけない。
  it("同期に失敗しても変更は成功として扱い、反映の遅れだけを伝える", async () => {
    mockChangeProPlan.mockResolvedValue({ ok: true });
    mockSyncProStatus.mockResolvedValue(null);
    await openPlanChangeDialog("monthly");

    await confirm();

    expect(
      await screen.findByText("プラン変更を受け付けました"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "この画面の表示に反映されるまで少し時間がかかる場合があります。",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("変更が失敗したときは同期しない", async () => {
    mockChangeProPlan.mockResolvedValue({
      ok: false,
      error: "stripe_api_error",
    });
    await openPlanChangeDialog("monthly");

    await confirm();

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(mockSyncProStatus).not.toHaveBeenCalled();
  });

  it.each([
    {
      error: "no_active_subscription",
      message: "変更できるご契約が見つかりませんでした",
    },
    { error: "invalid_plan", message: "このプランへは変更できません" },
    {
      error: "stripe_api_error",
      message: "決済サービスとの通信に失敗しました",
    },
    { error: "unauthorized", message: "ログインの有効期限が切れています" },
  ])(
    "$error は「$message」として区別して伝える",
    async ({ error, message }) => {
      mockChangeProPlan.mockResolvedValue({ ok: false, error });
      await openPlanChangeDialog("monthly");

      await confirm();

      expect(await screen.findByRole("alert")).toHaveTextContent(message);
      expect(
        screen.queryByText("プラン変更を受け付けました"),
      ).not.toBeInTheDocument();
      expect(mockRefresh).not.toHaveBeenCalled();
    },
  );

  // 課金に関わる操作なので、失敗したときに現状維持であることを毎回明示する。
  // cookie 欠落・401・契約なしも「変更は一切起きていない」ケースなので例外にしない。
  it.each([
    "unauthorized",
    "no_active_subscription",
    "invalid_plan",
    "stripe_api_error",
    "unknown",
  ])("%s の失敗ではプランが変わっていないことを明示する", async (error) => {
    mockChangeProPlan.mockResolvedValue({ ok: false, error });
    await openPlanChangeDialog("monthly");

    await confirm();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "プランは変更されていません",
    );
  });

  // 到達するのは契約データが壊れているときだけで、再試行しても永久に直らない。
  it("invalid_plan は再試行ではなく問い合わせへ誘導する", async () => {
    mockChangeProPlan.mockResolvedValue({ ok: false, error: "invalid_plan" });
    await openPlanChangeDialog("monthly");

    await confirm();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("お手数ですがお問い合わせください");
    expect(alert).not.toHaveTextContent("時間をおいて再度お試しください");
  });

  it("エラーのあとに開き直したダイアログに前回のエラーを残さない", async () => {
    mockChangeProPlan.mockResolvedValue({
      ok: false,
      error: "stripe_api_error",
    });
    await openPlanChangeDialog("monthly");
    await confirm();
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "閉じる",
      }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "年額プランに変更する" }),
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("成功のあとに開き直したダイアログは完了表示ではなく確認内容から始まる", async () => {
    mockChangeProPlan.mockResolvedValue({ ok: true });
    await openPlanChangeDialog("monthly");
    await confirm();
    expect(
      await screen.findByText("プラン変更を受け付けました"),
    ).toBeInTheDocument();

    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "閉じる",
      }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "年額プランに変更する" }),
    );

    expect(
      screen.queryByText("プラン変更を受け付けました"),
    ).not.toBeInTheDocument();
    expect(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "変更する",
      }),
    ).toBeInTheDocument();
  });

  describe("変更処理中", () => {
    async function startPendingChange() {
      let settle: (result: { ok: true }) => void = () => {};
      mockChangeProPlan.mockReturnValue(
        new Promise<{ ok: true }>((resolve) => {
          settle = resolve;
        }),
      );
      await openPlanChangeDialog("monthly");
      await confirm();
      await screen.findByRole("button", { name: "変更手続き中…" });
      return async () => {
        await act(async () => {
          settle({ ok: true });
        });
      };
    }

    it("処理中は確定ボタンを無効化して二重送信させない", async () => {
      const finish = await startPendingChange();

      const button = screen.getByRole("button", { name: "変更手続き中…" });
      expect(button).toBeDisabled();
      await userEvent.click(button);
      expect(mockChangeProPlan).toHaveBeenCalledTimes(1);

      await finish();
    });

    it("処理中は Escape でダイアログを閉じない", async () => {
      const finish = await startPendingChange();

      fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      await finish();
    });

    it("処理中でなければ Escape でダイアログを閉じる", async () => {
      await openPlanChangeDialog("monthly");

      fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(mockChangeProPlan).not.toHaveBeenCalled();
    });
  });
});

describe("支払い情報の更新案内", () => {
  it.each<SubscriptionStatus>([
    "free",
    "trial",
    "active",
    "cancelled",
    "expired",
    "pending",
  ])("status=%s には出さない", async (status) => {
    await renderPage({ status, platform: "web" });

    expect(billingSection()).not.toBeInTheDocument();
  });

  it("platform=web はメールからのカード更新を案内する", async () => {
    await renderPage({ status: "billing_issue", platform: "web" });

    const section = billingSection();
    expect(section).toBeInTheDocument();
    expect(
      within(section!).getByText(/クレジットカードの決済に失敗しています/),
    ).toBeInTheDocument();
    expect(
      within(section!).getByRole("link", {
        name: "メールが見つからない場合はお問い合わせ",
      }),
    ).toHaveAttribute("href", "/contact");
  });

  it("platform=ios は Apple のお支払い情報へ誘導する", async () => {
    await renderPage({ status: "billing_issue", platform: "ios" });

    const link = screen.getByRole("link", {
      name: "Apple のお支払い情報を開く",
    });
    expect(link).toHaveAttribute(
      "href",
      "https://apps.apple.com/account/billing",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("platform=android は Google Play のお支払い方法へ誘導する", async () => {
    await renderPage({ status: "billing_issue", platform: "android" });

    const link = screen.getByRole("link", {
      name: "Google Play のお支払い方法を開く",
    });
    expect(link).toHaveAttribute(
      "href",
      "https://play.google.com/store/paymentmethods",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("媒体不明でも行き止まりにせず問い合わせ導線を出す", async () => {
    await renderPage({ status: "billing_issue", platform: null });

    const section = billingSection();
    expect(section).toBeInTheDocument();
    expect(
      within(section!).getByRole("link", { name: "お問い合わせ" }),
    ).toHaveAttribute("href", "/contact");
  });
});

describe("取得失敗", () => {
  it("無料プランとして描画せず、再試行導線を出す", async () => {
    await renderLoadFailure("error");

    expect(screen.queryByText("無料プラン")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Pro に加入する" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "加入状態を取得できませんでした",
    );
    expect(screen.getByRole("button", { name: "再試行" })).toBeInTheDocument();
  });

  it("再試行ボタンでサーバー側の再取得を促す", async () => {
    await renderLoadFailure("error");
    await userEvent.click(screen.getByRole("button", { name: "再試行" }));

    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("通信障害でも再ログイン導線を併記する", async () => {
    await renderLoadFailure("error");

    expect(
      screen.getByRole("link", { name: "ログインし直す" }),
    ).toHaveAttribute("href", "/signin");
  });

  it("トークン失効なら再試行させず再ログインへ誘導する", async () => {
    await renderLoadFailure("unauthorized");

    expect(screen.getByRole("alert")).toHaveTextContent(
      "ログインの有効期限が切れています",
    );
    expect(
      screen.queryByRole("button", { name: "再試行" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "ログインし直す" }),
    ).toHaveAttribute("href", "/signin");
  });
});

describe("加入状態の再同期", () => {
  const syncSection = () =>
    screen.getByRole("region", { name: "加入状態の再同期" });

  const clickSync = () =>
    userEvent.click(screen.getByRole("button", { name: "状態を再同期" }));

  // 「Webhook がまだ届かず無料プランと表示されている」状態からの復旧手段なので、
  // 加入していない状態でも必ず出す。
  it.each<SubscriptionStatus>([
    "free",
    "trial",
    "active",
    "cancelled",
    "billing_issue",
    "expired",
    "pending",
  ])("status=%s でも再同期ボタンを出す", async (status) => {
    await renderPage({ status });

    expect(
      within(syncSection()).getByRole("button", { name: "状態を再同期" }),
    ).toBeInTheDocument();
  });

  // back の同期はストア課金・Web 課金のどちらも RevenueCat の subscriber から
  // 再構築するため、媒体で出し分けない。
  it.each<Platform>(["web", "ios", "android"])(
    "platform=%s でも再同期ボタンを出す",
    async (platform) => {
      await renderPage({ status: "active", pro_active: true, platform });

      expect(
        screen.getByRole("button", { name: "状態を再同期" }),
      ).toBeInTheDocument();
    },
  );

  it("加入媒体が不明でも再同期ボタンを出す", async () => {
    await renderPage({ status: "active", pro_active: true, platform: null });

    expect(
      screen.getByRole("button", { name: "状態を再同期" }),
    ).toBeInTheDocument();
  });

  it("押すまでは同期 API を叩かない", async () => {
    await renderPage({ status: "free" });

    expect(mockSyncProStatus).not.toHaveBeenCalled();
  });

  it("押すと同期 API を呼び、成功を伝えて状態を再取得する", async () => {
    await renderPage({ status: "free" });

    await clickSync();

    expect(mockSyncProStatus).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole("status")).toHaveTextContent(
      "最新の加入状態を取得しました。",
    );
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("同期の結果は Server Component から取り直す（クライアント側で状態を組み立てない）", async () => {
    await renderPage({ status: "free" });

    await clickSync();

    await screen.findByRole("status");
    expect(mockSyncProStatus.mock.invocationCallOrder[0]).toBeLessThan(
      mockRefresh.mock.invocationCallOrder[0],
    );
  });

  // 同期の失敗は「契約が変わった」ではなく「今の契約を確認できなかった」。
  // 課金中のユーザーを不安にさせないため、契約が無事であることを併せて伝える。
  it("同期に失敗したときは再取得せず、契約が変わっていないことを伝える", async () => {
    mockSyncProStatus.mockResolvedValue(null);
    await renderPage({ status: "active", pro_active: true });

    await clickSync();

    const message = await screen.findByRole("status");
    expect(message).toHaveTextContent("加入状態を取得できませんでした");
    expect(message).toHaveTextContent("ご契約の内容は変わっていません");
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it("失敗のあとに再度押すと前回の失敗表示を残さない", async () => {
    mockSyncProStatus.mockResolvedValueOnce(null);
    await renderPage({ status: "free" });

    await clickSync();
    expect(await screen.findByRole("status")).toHaveTextContent(
      "加入状態を取得できませんでした",
    );

    await clickSync();

    expect(await screen.findByRole("status")).toHaveTextContent(
      "最新の加入状態を取得しました。",
    );
    expect(
      screen.queryByText(/加入状態を取得できませんでした/),
    ).not.toBeInTheDocument();
  });

  describe("同期中", () => {
    async function startPendingSync() {
      let settle: (result: ProStatus | null) => void = () => {};
      mockSyncProStatus.mockReturnValue(
        new Promise<ProStatus | null>((resolve) => {
          settle = resolve;
        }),
      );
      await clickSync();
      await screen.findByRole("button", { name: "同期中…" });
      return async () => {
        await act(async () => {
          settle(DEFAULT_PRO_STATUS);
        });
      };
    }

    it("同期中はボタンを無効化して二重送信させない", async () => {
      await renderPage({ status: "free" });
      const finish = await startPendingSync();

      const button = screen.getByRole("button", { name: "同期中…" });
      expect(button).toBeDisabled();
      await userEvent.click(button);
      expect(mockSyncProStatus).toHaveBeenCalledTimes(1);

      await finish();
    });

    // 前回の失敗表示を残したまま再同期すると、成功したのに失敗したように見える。
    it("同期中は前回の結果表示を消す", async () => {
      mockSyncProStatus.mockResolvedValueOnce(null);
      await renderPage({ status: "free" });

      await clickSync();
      expect(await screen.findByRole("status")).toHaveTextContent(
        "加入状態を取得できませんでした",
      );

      const finish = await startPendingSync();

      expect(screen.queryByRole("status")).not.toBeInTheDocument();

      await finish();
    });
  });
});

describe("解約アンケート", () => {
  const REASON_CASES = [
    { label: "料金が高い", reason: "expensive" },
    { label: "あまり使わなくなった", reason: "less_usage" },
    { label: "必要な機能がなかった", reason: "feature_missing" },
    { label: "他のサービスを使うことにした", reason: "competitor" },
    { label: "その他", reason: "other" },
  ];

  const surveyReasons = () => screen.queryAllByRole("radio");

  async function cancel(decision = "enabled") {
    mockGetCachedFeatureFlagDecision.mockResolvedValue(decision);
    mockCancelWebSubscription.mockResolvedValue({ ok: true });
    await renderPage({ status: "active", pro_active: true, platform: "web" });
    await userEvent.click(
      screen.getByRole("button", { name: "この画面で解約する" }),
    );
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "解約する",
      }),
    );
    await screen.findByText("解約申請を受け付けました");
  }

  const submit = () =>
    userEvent.click(screen.getByRole("button", { name: "送信する" }));

  const chooseReason = (label: string) =>
    userEvent.click(screen.getByRole("radio", { name: label }));

  it("cancellation_survey を参照して出し分ける", async () => {
    await cancel();

    expect(mockGetCachedFeatureFlagDecision).toHaveBeenCalledWith(
      "cancellation_survey",
    );
  });

  it("フラグ有効なら解約完了後にアンケートを出す", async () => {
    await cancel("enabled");

    expect(
      screen.getByRole("dialog", { name: "解約申請を受け付けました" }),
    ).toBeInTheDocument();
    expect(surveyReasons()).toHaveLength(REASON_CASES.length);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  // back は flag 無効のユーザーにエンドポイント自体を隠す（404）。回答先が無い導線は出さない。
  it.each(["disabled", "indeterminate"])(
    "フラグが %s ならアンケートを出さず、解約だけを完了させる",
    async (decision) => {
      await cancel(decision);

      expect(surveyReasons()).toHaveLength(0);
      expect(mockCancelWebSubscription).toHaveBeenCalledTimes(1);
      expect(
        screen.getByText(
          "次回更新日まで引き続き Pro 機能をご利用いただけます。",
        ),
      ).toBeInTheDocument();
      expect(mockRefresh).toHaveBeenCalledTimes(1);
      expect(mockSubmitCancellationFeedback).not.toHaveBeenCalled();
    },
  );

  it("解約を確定するまではアンケートを出さない", async () => {
    mockGetCachedFeatureFlagDecision.mockResolvedValue("enabled");
    await renderPage({ status: "active", pro_active: true, platform: "web" });
    await userEvent.click(
      screen.getByRole("button", { name: "この画面で解約する" }),
    );

    expect(surveyReasons()).toHaveLength(0);
  });

  it("解約が失敗したときはアンケートを出さない", async () => {
    mockGetCachedFeatureFlagDecision.mockResolvedValue("enabled");
    mockCancelWebSubscription.mockResolvedValue({
      ok: false,
      error: "stripe_api_error",
    });
    await renderPage({ status: "active", pro_active: true, platform: "web" });
    await userEvent.click(
      screen.getByRole("button", { name: "この画面で解約する" }),
    );
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "解約する",
      }),
    );

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(surveyReasons()).toHaveLength(0);
  });

  // back の enum と 1 対 1 で送る。ラベルだけ変えて値がずれると集計が壊れる。
  it.each(REASON_CASES)(
    "「$label」を選ぶと reason=$reason を送る",
    async ({ label, reason }) => {
      mockSubmitCancellationFeedback.mockResolvedValue({ ok: true });
      await cancel();

      await chooseReason(label);
      await submit();

      expect(mockSubmitCancellationFeedback).toHaveBeenCalledTimes(1);
      expect(mockSubmitCancellationFeedback).toHaveBeenCalledWith({
        reason,
        note: "",
      });
    },
  );

  it("自由記述を入力すると note も送る", async () => {
    mockSubmitCancellationFeedback.mockResolvedValue({ ok: true });
    await cancel();

    await chooseReason("その他");
    await userEvent.type(
      screen.getByLabelText("ご意見・ご要望（任意）"),
      "使い方が難しかった",
    );
    await submit();

    expect(mockSubmitCancellationFeedback).toHaveBeenCalledWith({
      reason: "other",
      note: "使い方が難しかった",
    });
  });

  it("送信に成功したらお礼を表示する", async () => {
    mockSubmitCancellationFeedback.mockResolvedValue({ ok: true });
    await cancel();

    await chooseReason("料金が高い");
    await submit();

    expect(
      await screen.findByText(/ご回答ありがとうございました/),
    ).toBeInTheDocument();
    expect(surveyReasons()).toHaveLength(0);
  });

  it("お礼の表示から閉じられる", async () => {
    mockSubmitCancellationFeedback.mockResolvedValue({ ok: true });
    await cancel();
    await chooseReason("料金が高い");
    await submit();
    await screen.findByText(/ご回答ありがとうございました/);

    await userEvent.click(screen.getByRole("button", { name: "閉じる" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("スキップすると API を呼ばずに閉じる", async () => {
    await cancel();

    await userEvent.click(
      screen.getByRole("button", { name: "回答せずに閉じる" }),
    );

    expect(mockSubmitCancellationFeedback).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("Escape でもスキップできる", async () => {
    await cancel();

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(mockSubmitCancellationFeedback).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("理由を選ばずに送信しても API を呼ばず、選択を促す", async () => {
    await cancel();

    await submit();

    expect(mockSubmitCancellationFeedback).not.toHaveBeenCalled();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "解約の理由を選択してください。",
    );
  });

  it.each([
    { error: "reason_required", message: "解約の理由を選択してください。" },
    {
      error: "invalid_reason",
      message:
        "選択された解約の理由が正しくありません。もう一度お選びください。",
    },
    {
      error: "note_too_long",
      message: "ご意見は1000文字以内で入力してください。",
    },
    {
      error: "unauthorized",
      message:
        "ログインの有効期限が切れているため、アンケートを送信できませんでした。解約手続きは完了しています。",
    },
    {
      error: "unknown",
      message:
        "アンケートを送信できませんでした。解約手続きは完了していますので、そのまま閉じていただけます。",
    },
  ])("$error は「$message」として伝える", async ({ error, message }) => {
    mockSubmitCancellationFeedback.mockResolvedValue({ ok: false, error });
    await cancel();

    await chooseReason("その他");
    await submit();

    expect(await screen.findByRole("alert")).toHaveTextContent(message);
  });

  // アンケートの失敗で解約の完了を疑わせない。
  it.each(["unauthorized", "unknown", "note_too_long"])(
    "%s で失敗しても閉じて先に進める",
    async (error) => {
      mockSubmitCancellationFeedback.mockResolvedValue({ ok: false, error });
      await cancel();
      await chooseReason("その他");
      await submit();
      expect(await screen.findByRole("alert")).toBeInTheDocument();

      await userEvent.click(
        screen.getByRole("button", { name: "回答せずに閉じる" }),
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    },
  );

  // 受付が止まっているだけで利用者に非がないため、エラーを見せずに畳む。
  it("survey_disabled のときはエラーを出さずに閉じる", async () => {
    mockSubmitCancellationFeedback.mockResolvedValue({
      ok: false,
      error: "survey_disabled",
    });
    await cancel();

    await chooseReason("その他");
    await submit();

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  describe("自由記述の文字数", () => {
    const noteField = () => screen.getByLabelText("ご意見・ご要望（任意）");

    it("初期状態で残り 1000 文字と表示する", async () => {
      await cancel();

      expect(screen.getByText("残り1000文字")).toBeInTheDocument();
    });

    it("入力に応じて残り文字数を減らす", async () => {
      await cancel();

      fireEvent.change(noteField(), { target: { value: "あ".repeat(40) } });

      expect(screen.getByText("残り960文字")).toBeInTheDocument();
    });

    // サーバーの 422 に頼らず、そもそも上限を超えて送れないようにする。
    it("1000 文字を超える入力はクライアント側で切り詰める", async () => {
      mockSubmitCancellationFeedback.mockResolvedValue({ ok: true });
      await cancel();

      fireEvent.change(noteField(), { target: { value: "a".repeat(1005) } });

      expect((noteField() as HTMLTextAreaElement).value).toHaveLength(1000);
      expect(screen.getByText("残り0文字")).toBeInTheDocument();

      await chooseReason("その他");
      await submit();

      expect(mockSubmitCancellationFeedback).toHaveBeenCalledWith({
        reason: "other",
        note: "a".repeat(1000),
      });
    });

    it("入力欄自体にも上限を設定する", async () => {
      await cancel();

      expect(noteField()).toHaveAttribute("maxlength", "1000");
    });
  });

  describe("アクセシビリティ", () => {
    it("モーダルとして見出しで名前を付ける", async () => {
      await cancel();

      const dialog = screen.getByRole("dialog", {
        name: "解約申請を受け付けました",
      });
      expect(dialog).toHaveAttribute("aria-modal", "true");
    });

    it("理由の選択肢にグループ名を付ける", async () => {
      await cancel();

      expect(
        screen.getByRole("group", { name: "解約の理由" }),
      ).toBeInTheDocument();
    });

    it("開いた時点で最初の選択肢にフォーカスする", async () => {
      await cancel();

      expect(screen.getByRole("radio", { name: "料金が高い" })).toHaveFocus();
    });

    it("末尾から Tab で先頭に戻す", async () => {
      await cancel();

      const submitButton = screen.getByRole("button", { name: "送信する" });
      submitButton.focus();
      fireEvent.keyDown(submitButton, { key: "Tab" });

      expect(screen.getByRole("radio", { name: "料金が高い" })).toHaveFocus();
    });

    it("先頭から Shift+Tab で末尾に戻す", async () => {
      await cancel();

      const firstReason = screen.getByRole("radio", { name: "料金が高い" });
      firstReason.focus();
      fireEvent.keyDown(firstReason, { key: "Tab", shiftKey: true });

      expect(screen.getByRole("button", { name: "送信する" })).toHaveFocus();
    });
  });

  describe("送信中", () => {
    async function startPendingSubmit() {
      let settle: (result: { ok: true }) => void = () => {};
      mockSubmitCancellationFeedback.mockReturnValue(
        new Promise<{ ok: true }>((resolve) => {
          settle = resolve;
        }),
      );
      await cancel();
      await chooseReason("その他");
      await submit();
      await screen.findByRole("button", { name: "送信中…" });
      return async () => {
        await act(async () => {
          settle({ ok: true });
        });
      };
    }

    it("二重送信させない", async () => {
      const finish = await startPendingSubmit();

      const button = screen.getByRole("button", { name: "送信中…" });
      expect(button).toBeDisabled();
      await userEvent.click(button);
      expect(mockSubmitCancellationFeedback).toHaveBeenCalledTimes(1);

      await finish();
    });

    it("送信中は Escape で閉じない", async () => {
      const finish = await startPendingSubmit();

      fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      await finish();
    });
  });
});
