const mockCookieGet = jest.fn();
const mockGetProStatus = jest.fn();

jest.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: mockCookieGet }),
}));

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

import { render, screen } from "@testing-library/react";
import ProGate from "@app/components/pro/ProGate";
import { useProStatus } from "@app/hooks/pro/useProStatus";
import { DEFAULT_PRO_STATUS, type ProStatus } from "@app/types/pro";
import AppLayout from "../layout";

function ProStatusProbe() {
  const { isPro } = useProStatus();

  return (
    <div>
      <p>{isPro ? "PRO" : "FREE"}</p>
      <ProGate
        feature="season_transition_graph"
        fallback={<p>シーズン推移グラフはロック中</p>}
      >
        <p>シーズン推移グラフ</p>
      </ProGate>
    </div>
  );
}

function renderLayout() {
  return AppLayout({ children: <ProStatusProbe /> });
}

function setAuthCookies(uid: string) {
  mockCookieGet.mockImplementation((key: string) => {
    const values: Record<string, { value: string }> = {
      "access-token": { value: "test-access-token" },
      client: { value: "test-client" },
      uid: { value: uid },
    };
    return values[key];
  });
}

function clearAuthCookies() {
  mockCookieGet.mockReturnValue(undefined);
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
  });

  it("Pro ユーザーではレイアウト配下で Pro 判定が有効になる", async () => {
    setAuthCookies("pro-user@example.com");
    mockGetProStatus.mockResolvedValue(proStatus);

    render(await renderLayout());

    expect(screen.getByText("PRO")).toBeInTheDocument();
    expect(screen.getByText("シーズン推移グラフ")).toBeInTheDocument();
  });

  it("無料ユーザーでは Pro 機能がロックされる", async () => {
    setAuthCookies("free-user@example.com");
    mockGetProStatus.mockResolvedValue(DEFAULT_PRO_STATUS);

    render(await renderLayout());

    expect(screen.getByText("FREE")).toBeInTheDocument();
    expect(
      screen.getByText("シーズン推移グラフはロック中"),
    ).toBeInTheDocument();
  });

  it("未認証では Pro status API を叩かず無料状態にフォールバックする", async () => {
    clearAuthCookies();

    render(await renderLayout());

    expect(mockGetProStatus).not.toHaveBeenCalled();
    expect(screen.getByText("FREE")).toBeInTheDocument();
    expect(
      screen.getByText("シーズン推移グラフはロック中"),
    ).toBeInTheDocument();
  });

  it("API が失敗しても無料状態として描画する", async () => {
    setAuthCookies("pro-user@example.com");
    mockGetProStatus.mockResolvedValue(null);

    render(await renderLayout());

    expect(screen.getByText("FREE")).toBeInTheDocument();
  });

  it("ログアウト後の再レンダーで前ユーザーの Pro 状態が残らない", async () => {
    setAuthCookies("pro-user@example.com");
    mockGetProStatus.mockResolvedValue(proStatus);

    const { rerender } = render(await renderLayout());
    expect(screen.getByText("PRO")).toBeInTheDocument();

    clearAuthCookies();
    rerender(await renderLayout());

    expect(screen.getByText("FREE")).toBeInTheDocument();
    expect(
      screen.getByText("シーズン推移グラフはロック中"),
    ).toBeInTheDocument();
  });

  it("別ユーザーでログインし直すとその Pro 状態に切り替わる", async () => {
    setAuthCookies("free-user@example.com");
    mockGetProStatus.mockResolvedValue(DEFAULT_PRO_STATUS);

    const { rerender } = render(await renderLayout());
    expect(screen.getByText("FREE")).toBeInTheDocument();

    setAuthCookies("pro-user@example.com");
    mockGetProStatus.mockResolvedValue(proStatus);
    rerender(await renderLayout());

    expect(screen.getByText("PRO")).toBeInTheDocument();
    expect(screen.getByText("シーズン推移グラフ")).toBeInTheDocument();
  });
});
