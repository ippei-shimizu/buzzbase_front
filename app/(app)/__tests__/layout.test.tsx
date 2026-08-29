const mockGetProStatus = jest.fn();

jest.mock("../pro/actions", () => ({
  getProStatus: () => mockGetProStatus(),
}));

// Pro 判定に関与しないレイアウト構成要素は素通しして、Provider の配線だけを見る
jest.mock("@app/contexts/useAuthContext", () => ({
  AuthProvider: function AuthProvider({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <>{children}</>;
  },
}));

jest.mock("@app/contexts/userContext", () => ({
  UserProvider: function UserProvider({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <>{children}</>;
  },
}));

jest.mock("@app/providers", () => ({
  Providers: function Providers({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  },
}));

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({ open: jest.fn(), close: jest.fn() }),
}));

jest.mock("../_components/SmartAppBanner", () => {
  return function SmartAppBanner() {
    return null;
  };
});

jest.mock("@app/components/header/NavigationMenu", () => {
  return function NavigationMenu() {
    return null;
  };
});

jest.mock("@app/components/footer/Footer", () => {
  return function Footer() {
    return null;
  };
});

jest.mock("sonner", () => ({
  Toaster: function Toaster() {
    return null;
  },
}));

jest.mock("@app/components/ad/adConfig", () => ({
  ADSENSE_CLIENT_ID: "ca-pub-test",
  isAdsenseEnabled: true,
  isAdsenseScriptEnabled: true,
  adSlots: {},
}));

jest.mock("next/script", () => ({
  __esModule: true,
  default: ({ src }: { src: string }) => (
    <div data-testid="adsense-script" data-src={src} />
  ),
}));

import { act, render, screen, type RenderResult } from "@testing-library/react";
import ProGate from "@app/components/pro/ProGate";
import { useProStatus } from "@app/hooks/pro/useProStatus";
import { DEFAULT_PRO_STATUS, type ProStatus } from "@app/types/pro";
import AppLayout from "../layout";

function ProStatusProbe() {
  const { isPro, isLoading } = useProStatus();

  return (
    <div>
      <p>{isLoading ? "LOADING" : isPro ? "PRO" : "FREE"}</p>
      <ProGate
        feature="season_transition_graph"
        fallback={<p>シーズン推移グラフはロック中</p>}
      >
        <p>シーズン推移グラフ</p>
      </ProGate>
    </div>
  );
}

function layoutElement() {
  return AppLayout({ children: <ProStatusProbe /> });
}

// Pro 状態はマウント後に Server Action で解決されるため、非同期 act で確定まで進める
async function renderLayout() {
  let rendered!: RenderResult;
  await act(async () => {
    rendered = render(layoutElement());
  });

  return rendered;
}

// ログイン/ログアウト後の router.refresh() 相当
async function rerenderLayout(rendered: RenderResult) {
  await act(async () => {
    rendered.rerender(layoutElement());
  });
}

function setAuthCookies(uid: string) {
  document.cookie = "access-token=test-access-token";
  document.cookie = "client=test-client";
  document.cookie = `uid=${encodeURIComponent(uid)}`;
}

function clearAuthCookies() {
  for (const name of ["access-token", "client", "uid"]) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

const proStatus: ProStatus = {
  subscription: {
    ...DEFAULT_PRO_STATUS.subscription,
    status: "active",
    plan_type: "monthly",
    platform: "web",
    pro_active: true,
    days_remaining: 20,
  },
  entitlements: [...DEFAULT_PRO_STATUS.entitlements, "season_transition_graph"],
};

describe("AppLayout の ProStatusProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAuthCookies();
  });

  it("Pro ユーザーではレイアウト配下で Pro 判定が有効になる", async () => {
    setAuthCookies("pro-user@example.com");
    mockGetProStatus.mockResolvedValue(proStatus);

    await renderLayout();

    expect(screen.getByText("PRO")).toBeInTheDocument();
    expect(screen.getByText("シーズン推移グラフ")).toBeInTheDocument();
  });

  it("無料ユーザーでは Pro 機能がロックされる", async () => {
    setAuthCookies("free-user@example.com");
    mockGetProStatus.mockResolvedValue(DEFAULT_PRO_STATUS);

    await renderLayout();

    expect(screen.getByText("FREE")).toBeInTheDocument();
    expect(
      screen.getByText("シーズン推移グラフはロック中"),
    ).toBeInTheDocument();
  });

  it("未認証では Pro status API を叩かず無料状態にフォールバックする", async () => {
    await renderLayout();

    expect(screen.getByText("FREE")).toBeInTheDocument();
    expect(mockGetProStatus).not.toHaveBeenCalled();
    expect(
      screen.getByText("シーズン推移グラフはロック中"),
    ).toBeInTheDocument();
  });

  it("Pro 判定が確定するまではロック UI を描画しない", async () => {
    setAuthCookies("pro-user@example.com");
    mockGetProStatus.mockReturnValue(new Promise(() => {}));

    await renderLayout();

    expect(screen.getByText("LOADING")).toBeInTheDocument();
    expect(
      screen.queryByText("シーズン推移グラフはロック中"),
    ).not.toBeInTheDocument();
  });

  it("API が失敗しても無料状態として描画する", async () => {
    setAuthCookies("pro-user@example.com");
    mockGetProStatus.mockResolvedValue(null);

    await renderLayout();

    expect(screen.getByText("FREE")).toBeInTheDocument();
  });

  it("ログアウト後の再レンダーで前ユーザーの Pro 状態が残らない", async () => {
    setAuthCookies("pro-user@example.com");
    mockGetProStatus.mockResolvedValue(proStatus);

    const rendered = await renderLayout();
    expect(screen.getByText("PRO")).toBeInTheDocument();

    clearAuthCookies();
    await rerenderLayout(rendered);

    expect(screen.getByText("FREE")).toBeInTheDocument();
    expect(
      screen.getByText("シーズン推移グラフはロック中"),
    ).toBeInTheDocument();
  });

  it("別ユーザーでログインし直すとその Pro 状態に切り替わる", async () => {
    setAuthCookies("free-user@example.com");
    mockGetProStatus.mockResolvedValue(DEFAULT_PRO_STATUS);

    const rendered = await renderLayout();
    expect(screen.getByText("FREE")).toBeInTheDocument();

    setAuthCookies("pro-user@example.com");
    mockGetProStatus.mockResolvedValue(proStatus);
    await rerenderLayout(rendered);

    expect(screen.getByText("PRO")).toBeInTheDocument();
    expect(screen.getByText("シーズン推移グラフ")).toBeInTheDocument();
  });

  it("同じユーザーのまま再レンダーされても Pro 状態を取り直さない", async () => {
    setAuthCookies("pro-user@example.com");
    mockGetProStatus.mockResolvedValue(proStatus);

    const rendered = await renderLayout();
    await rerenderLayout(rendered);

    expect(mockGetProStatus).toHaveBeenCalledTimes(1);
    expect(screen.getByText("PRO")).toBeInTheDocument();
  });

  // SameSite=Strict の認証 cookie は検索結果や Stripe Checkout からの遷移では
  // サーバーに届かない。Pro 判定をブラウザ側の cookie 起点にすることで無料表示に落ちない
  it("サーバーに cookie が届かない流入経路でも Pro 判定が有効になる", async () => {
    setAuthCookies("pro-user@example.com");
    mockGetProStatus.mockResolvedValue(proStatus);

    await renderLayout();

    expect(mockGetProStatus).toHaveBeenCalledTimes(1);
    expect(screen.getByText("PRO")).toBeInTheDocument();
  });

  // AdsenseScript が Provider の外に出ると useProStatus が無料状態にフォールバックし、
  // Pro 加入者にもスクリプトが読み込まれる状態へ静かに退行する
  it("no_ads を持つ Pro 加入者には AdSense スクリプトを読み込まない", async () => {
    setAuthCookies("pro-user@example.com");
    mockGetProStatus.mockResolvedValue({
      ...proStatus,
      entitlements: [...proStatus.entitlements, "no_ads"],
    });

    await renderLayout();

    expect(screen.queryByTestId("adsense-script")).not.toBeInTheDocument();
  });

  it("無料ユーザーには AdSense スクリプトを読み込む", async () => {
    setAuthCookies("free-user@example.com");
    mockGetProStatus.mockResolvedValue(DEFAULT_PRO_STATUS);

    await renderLayout();

    expect(screen.getByTestId("adsense-script")).toBeInTheDocument();
  });

  // Server Action の通信自体が失敗しても確定させないと isLoading が永久 true になり、
  // 無料ユーザーに広告が二度と出ない
  it("Pro status の取得が reject しても無料状態として確定する", async () => {
    setAuthCookies("free-user@example.com");
    mockGetProStatus.mockRejectedValue(new Error("network error"));

    await renderLayout();

    expect(screen.getByText("FREE")).toBeInTheDocument();
    expect(screen.getByTestId("adsense-script")).toBeInTheDocument();
  });

  it("access-token が失効し uid だけ残っている場合は無料状態にする", async () => {
    document.cookie = "uid=pro-user@example.com";
    mockGetProStatus.mockResolvedValue(proStatus);

    await renderLayout();

    expect(mockGetProStatus).not.toHaveBeenCalled();
    expect(screen.getByText("FREE")).toBeInTheDocument();
  });
});
