jest.mock("@app/hooks/pro/useProStatus", () => ({
  useProStatus: jest.fn(),
}));

import { render, screen } from "@testing-library/react";
import { useProStatus } from "@app/hooks/pro/useProStatus";
import { DEFAULT_PRO_STATUS, type ProSubscription } from "@app/types/pro";
import ProStatusBanners from "../ProStatusBanners";

const mockUseProStatus = useProStatus as jest.MockedFunction<
  typeof useProStatus
>;

const HEIGHT_VAR = "--pro-banner-height";

function mockProStatus(
  subscription: Partial<ProSubscription>,
  isLoading = false,
) {
  mockUseProStatus.mockReturnValue({
    proStatus: {
      ...DEFAULT_PRO_STATUS,
      subscription: { ...DEFAULT_PRO_STATUS.subscription, ...subscription },
    },
    isPro: Boolean(subscription.pro_active),
    isLoading,
    isRefreshing: false,
    refresh: jest.fn(),
  });
}

const BILLING_ISSUE: Partial<ProSubscription> = {
  status: "billing_issue",
  platform: "web",
  pro_active: true,
};

const TRIAL_ENDING: Partial<ProSubscription> = {
  status: "trial",
  platform: "web",
  pro_active: true,
  in_trial: true,
  days_remaining: 2,
};

describe("ProStatusBanners", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.documentElement.style.removeProperty(HEIGHT_VAR);
  });

  it("課金失敗なら警告を表示する", () => {
    mockProStatus(BILLING_ISSUE);

    render(<ProStatusBanners />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "決済情報の更新が必要です",
    );
  });

  it("トライアル終了間近なら予告を表示する", () => {
    mockProStatus(TRIAL_ENDING);

    render(<ProStatusBanners />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "無料トライアルはあと2日で終了します",
    );
  });

  it("判定が確定するまでは条件を満たしていても表示しない", () => {
    mockProStatus(BILLING_ISSUE, true);

    render(<ProStatusBanners />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("未認証（無料状態で確定）では表示しない", () => {
    mockProStatus(DEFAULT_PRO_STATUS.subscription);

    render(<ProStatusBanners />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("バナーの実測高さを CSS 変数へ書き出し、固定ヘッダーの重なりを防ぐ", () => {
    const offsetHeight = jest
      .spyOn(HTMLElement.prototype, "offsetHeight", "get")
      .mockReturnValue(56);
    mockProStatus(BILLING_ISSUE);

    render(<ProStatusBanners />);

    expect(document.documentElement.style.getPropertyValue(HEIGHT_VAR)).toBe(
      "56px",
    );

    offsetHeight.mockRestore();
  });

  it("アンマウント時は確保していた高さを戻す", () => {
    const offsetHeight = jest
      .spyOn(HTMLElement.prototype, "offsetHeight", "get")
      .mockReturnValue(56);
    mockProStatus(BILLING_ISSUE);

    const { unmount } = render(<ProStatusBanners />);
    unmount();

    expect(document.documentElement.style.getPropertyValue(HEIGHT_VAR)).toBe(
      "0px",
    );

    offsetHeight.mockRestore();
  });
});
