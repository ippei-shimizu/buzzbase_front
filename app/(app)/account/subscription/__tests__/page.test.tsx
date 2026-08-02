const mockCookieGet = jest.fn();
const mockRedirect = jest.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});
const mockRefresh = jest.fn();
const mockGetCachedProStatusResult = jest.fn();
const mockCancelWebSubscription = jest.fn();
const mockChangeProPlan = jest.fn();

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

jest.mock("../actions", () => ({
  cancelWebSubscription: () => mockCancelWebSubscription(),
  changeProPlan: (plan: string) => mockChangeProPlan(plan),
}));

jest.mock("@app/components/header/Header", () => ({
  __esModule: true,
  default: () => <header />,
}));

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DEFAULT_PRO_STATUS,
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
    await renderPage({ status, pro_active: true });

    expect(
      screen.queryByRole("link", { name: "Pro に加入する" }),
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

  it("切り替え前の案内でも日割りと返金なしを明示する", async () => {
    await renderPage({ ...webActive, plan_type: "monthly" });

    expect(
      within(planChangeSection()!).getByText(
        /未使用期間分は日割りで差額に反映されます（現金でのご返金は行いません）/,
      ),
    ).toBeInTheDocument();
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

  it("月額→年額は未使用分が年額請求から差し引かれると説明する", async () => {
    await openPlanChangeDialog("monthly");

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText(
        /請求サイクルが変更時点から 1 年周期に切り替わり/,
      ),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        /月額プランの未使用期間分は日割りで計算され、その請求から差し引かれます/,
      ),
    ).toBeInTheDocument();
    expect(mockChangeProPlan).not.toHaveBeenCalled();
  });

  it("年額→月額は返金ではなく次回以降への充当だと説明する", async () => {
    await openPlanChangeDialog("yearly");

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText(
        /請求サイクルが変更時点から 1 か月周期に切り替わります/,
      ),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        /日割りでクレジットとして計上され、次回以降のお支払いに充当されます（現金でのご返金は行いません）/,
      ),
    ).toBeInTheDocument();
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
      screen.getByText(/反映されるまで少し時間がかかる場合があります/),
    ).toBeInTheDocument();
    expect(mockRefresh).toHaveBeenCalledTimes(1);
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
  it.each(["invalid_plan", "stripe_api_error", "unknown"])(
    "%s の失敗ではプランが変わっていないことを明示する",
    async (error) => {
      mockChangeProPlan.mockResolvedValue({ ok: false, error });
      await openPlanChangeDialog("monthly");

      await confirm();

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "プランは変更されていません",
      );
    },
  );
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
      screen.queryByRole("link", { name: "Pro に加入する" }),
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
