const mockPathname = jest.fn(() => "/dashboard");

jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"),
  usePathname: () => mockPathname(),
}));

jest.mock("@app/(app)/pro/actions", () => ({
  getProStatus: jest.fn(),
}));

import { act, render, screen } from "@testing-library/react";
import { type ReactNode } from "react";
import { getProStatus } from "@app/(app)/pro/actions";
import { ProStatusProvider } from "@app/components/pro/ProStatusProvider";
import {
  DEFAULT_PRO_STATUS,
  type ProStatus,
  type ProSubscription,
} from "@app/types/pro";
import ProStatusBanners from "../ProStatusBanners";

const mockGetProStatus = getProStatus as jest.MockedFunction<
  typeof getProStatus
>;

const HEIGHT_VAR = "--pro-banner-height";
const SUBSCRIPTION_PATH = "/account/subscription";
const BILLING_ISSUE_REGION = { name: "課金に関する重要なお知らせ" } as const;

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

interface Observation {
  callback: ResizeObserverCallback;
  targets: Element[];
}

// jest.setup.js の ResizeObserver は no-op のため、observe した対象と
// コールバックを保持して、テストから reflow を起こせるものに差し替える。
const observations: Observation[] = [];

class TestResizeObserver {
  private readonly observation: Observation;

  constructor(callback: ResizeObserverCallback) {
    this.observation = { callback, targets: [] };
    observations.push(this.observation);
  }

  observe(target: Element) {
    this.observation.targets.push(target);
  }

  unobserve(target: Element) {
    this.observation.targets = this.observation.targets.filter(
      (observed) => observed !== target,
    );
  }

  disconnect() {
    this.observation.targets = [];
  }
}

/** target を監視しているオブザーバの通知を起こす。監視されていなければ null。 */
function reflow(target: Element): (() => void) | null {
  const observation = observations.find((entry) =>
    entry.targets.includes(target),
  );
  if (!observation) return null;

  return () =>
    act(() => {
      observation.callback([], observation as unknown as ResizeObserver);
    });
}

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

function makeProStatus(subscription: Partial<ProSubscription>): ProStatus {
  return {
    ...DEFAULT_PRO_STATUS,
    subscription: { ...DEFAULT_PRO_STATUS.subscription, ...subscription },
  };
}

function bannerHeightVar() {
  return document.documentElement.style.getPropertyValue(HEIGHT_VAR);
}

/**
 * ProStatusProvider の Server Action 解決を待って描画する。
 * subscription に null を渡すと未認証（＝無料確定）として扱う。
 */
async function renderResolved(subscription: Partial<ProSubscription> | null) {
  if (subscription) {
    setAuthCookies();
    mockGetProStatus.mockResolvedValue(makeProStatus(subscription));
  }

  let rendered!: ReturnType<typeof render>;
  await act(async () => {
    rendered = render(<ProStatusBanners />, { wrapper: Wrapper });
  });
  return rendered;
}

/** Pro 判定が未確定のまま止まっている状態で描画し、任意のタイミングで確定させる。 */
async function renderPending() {
  setAuthCookies();
  let settle!: (proStatus: ProStatus) => void;
  mockGetProStatus.mockReturnValue(
    new Promise<ProStatus>((resolve) => {
      settle = resolve;
    }),
  );

  let rendered!: ReturnType<typeof render>;
  await act(async () => {
    rendered = render(<ProStatusBanners />, { wrapper: Wrapper });
  });

  const resolveWith = async (subscription: Partial<ProSubscription>) => {
    await act(async () => {
      settle(makeProStatus(subscription));
    });
  };
  return { ...rendered, resolveWith };
}

describe("ProStatusBanners", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAuthCookies();
    mockPathname.mockReturnValue("/dashboard");
    observations.length = 0;
    document.documentElement.style.removeProperty(HEIGHT_VAR);
    (global as { ResizeObserver: unknown }).ResizeObserver = TestResizeObserver;

    // バナーを描画していないときは高さ 0 という実際の挙動に合わせる。
    jest
      .spyOn(HTMLElement.prototype, "offsetHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        return this.childElementCount > 0 ? 56 : 0;
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("課金失敗なら警告を表示する", async () => {
    await renderResolved(BILLING_ISSUE);

    expect(screen.getByRole("region", BILLING_ISSUE_REGION)).toHaveTextContent(
      "決済情報の更新が必要です",
    );
  });

  it("トライアル終了間近なら予告を表示する", async () => {
    await renderResolved(TRIAL_ENDING);

    expect(screen.getByRole("status")).toHaveTextContent(
      "無料トライアルはあと2日で終了します",
    );
  });

  it("判定が確定するまでは条件を満たしていても表示しない", async () => {
    await renderPending();

    expect(
      screen.queryByRole("region", BILLING_ISSUE_REGION),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("未認証（無料状態で確定）では表示しない", async () => {
    await renderResolved(null);

    expect(
      screen.queryByRole("region", BILLING_ISSUE_REGION),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("遷移先の /account/subscription 上では、自ページへのリンクになるため表示しない", async () => {
    mockPathname.mockReturnValue(SUBSCRIPTION_PATH);

    await renderResolved(BILLING_ISSUE);

    expect(
      screen.queryByRole("region", BILLING_ISSUE_REGION),
    ).not.toBeInTheDocument();
    expect(bannerHeightVar()).toBe("0px");
  });

  describe("固定表示のレイアウト", () => {
    it("スマートアプリバナーの下端から、ヘッダーより手前に固定する", async () => {
      const { container } = await renderResolved(BILLING_ISSUE);

      expect(container.firstChild).toHaveClass(
        "fixed",
        "left-0",
        "right-0",
        "top-[var(--smart-app-banner-height,0px)]",
        "z-[60]",
      );
    });
  });

  describe("高さの CSS 変数", () => {
    it("バナーの実測高さを書き出し、固定ヘッダーの重なりを防ぐ", async () => {
      await renderResolved(BILLING_ISSUE);

      expect(bannerHeightVar()).toBe("56px");
    });

    it("判定確定でバナーが現れたら、その場で高さを反映する", async () => {
      const { resolveWith } = await renderPending();
      expect(bannerHeightVar()).toBe("0px");

      await resolveWith(BILLING_ISSUE);

      expect(
        screen.getByRole("region", BILLING_ISSUE_REGION),
      ).toBeInTheDocument();
      expect(bannerHeightVar()).toBe("56px");
    });

    it("遷移先ページへ移動してバナーが消えたら、確保していた高さを解放する", async () => {
      const { rerender } = await renderResolved(BILLING_ISSUE);
      expect(bannerHeightVar()).toBe("56px");

      mockPathname.mockReturnValue(SUBSCRIPTION_PATH);
      await act(async () => {
        rerender(<ProStatusBanners />);
      });

      expect(bannerHeightVar()).toBe("0px");
    });

    it("文言の折り返しで高さが変わったら追従する", async () => {
      const { container } = await renderResolved(BILLING_ISSUE);
      const banners = container.firstChild as HTMLElement;

      const notifyResize = reflow(banners);
      expect(notifyResize).not.toBeNull();

      jest
        .spyOn(HTMLElement.prototype, "offsetHeight", "get")
        .mockReturnValue(88);
      notifyResize?.();

      expect(bannerHeightVar()).toBe("88px");
    });

    it("アンマウント時は確保していた高さを戻す", async () => {
      const { unmount } = await renderResolved(BILLING_ISSUE);

      unmount();

      expect(bannerHeightVar()).toBe("0px");
    });
  });
});
