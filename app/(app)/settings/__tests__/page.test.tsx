const mockCookieGet = jest.fn();
const mockRedirect = jest.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});
const mockGetCachedFeatureFlagDecision = jest.fn();
const mockLogout = jest.fn();
const mockOpenProUpgradeModal = jest.fn();

jest.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: mockCookieGet }),
}));

jest.mock("next/navigation", () => ({
  redirect: (path: string) => mockRedirect(path),
}));

jest.mock("@app/featureFlags/cachedFeatureFlags", () => ({
  getCachedFeatureFlagDecision: (key: string) =>
    mockGetCachedFeatureFlagDecision(key),
}));

jest.mock("@app/components/header/Header", () => ({
  __esModule: true,
  default: () => <header />,
}));

jest.mock("@app/hooks/auth/useLogout", () => ({
  __esModule: true,
  default: () => mockLogout,
}));

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({
    open: mockOpenProUpgradeModal,
    close: jest.fn(),
  }),
}));

import { fireEvent, render, screen } from "@testing-library/react";
import SettingsPage, { metadata } from "../page";

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

async function renderPage(
  proFeaturesDecision: "enabled" | "disabled" | "indeterminate" = "disabled",
) {
  setAuthCookies();
  mockGetCachedFeatureFlagDecision.mockResolvedValueOnce(proFeaturesDecision);
  render(await SettingsPage());
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("メタデータ", () => {
  it("検索エンジンに登録させない", () => {
    expect(metadata.robots).toEqual({ index: false });
  });

  it("タイトルを設定する", () => {
    expect(metadata.title).toBe("設定");
  });
});

describe("未認証", () => {
  it("認証 cookie が無ければ flag を取得せずにリダイレクトする", async () => {
    mockCookieGet.mockReturnValue(undefined);

    await expect(SettingsPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/signup?auth_required=true");
    expect(mockGetCachedFeatureFlagDecision).not.toHaveBeenCalled();
  });

  it("認証 cookie が一部だけでもリダイレクトする", async () => {
    mockCookieGet.mockImplementation((key: string) =>
      key === "access-token" ? { value: "test-access-token" } : undefined,
    );

    await expect(SettingsPage()).rejects.toThrow("NEXT_REDIRECT");
  });
});

describe("アカウントセクション", () => {
  it("プロフィール編集は常に表示する", async () => {
    await renderPage("disabled");

    expect(
      screen.getByRole("link", { name: /プロフィール編集/ }),
    ).toHaveAttribute("href", "/mypage/edit");
  });

  it.each(["disabled", "indeterminate"] as const)(
    "pro_features=%s のときはPro関連項目を出さない",
    async (decision) => {
      await renderPage(decision);

      expect(
        screen.queryByRole("button", { name: /Proプランを見る/ }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: /サブスクリプション管理/ }),
      ).not.toBeInTheDocument();
    },
  );

  it("pro_features=enabled のときはPro関連項目を出す", async () => {
    await renderPage("enabled");

    expect(
      screen.getByRole("button", { name: /Proプランを見る/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /サブスクリプション管理/ }),
    ).toHaveAttribute("href", "/account/subscription");
  });

  it("Proプランを見るを押すとアップグレードモーダルを開く", async () => {
    await renderPage("enabled");

    fireEvent.click(screen.getByRole("button", { name: /Proプランを見る/ }));

    expect(mockOpenProUpgradeModal).toHaveBeenCalledTimes(1);
  });
});

describe("ヘルプ・その他セクション", () => {
  it("各リンクが既存ページを指す", async () => {
    await renderPage();

    expect(
      screen.getByRole("link", { name: /成績の算出方法/ }),
    ).toHaveAttribute("href", "/calculation-of-grades");
    expect(screen.getByRole("link", { name: /お問い合わせ/ })).toHaveAttribute(
      "href",
      "/contact",
    );
    expect(
      screen.getByRole("link", { name: /プライバシーポリシー/ }),
    ).toHaveAttribute("href", "/privacypolicy");
    expect(screen.getByRole("link", { name: /利用規約/ })).toHaveAttribute(
      "href",
      "/termsofservice",
    );
    expect(
      screen.getByRole("link", { name: /特定商取引法に基づく表記/ }),
    ).toHaveAttribute("href", "/tokushoho");
  });
});

describe("Danger Zone", () => {
  it("ログアウトは確認モーダルを開くまで実行しない", async () => {
    await renderPage();

    fireEvent.click(screen.getByRole("button", { name: "ログアウト" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it("確認モーダルで確定するとログアウトを実行する", async () => {
    await renderPage();

    fireEvent.click(screen.getByRole("button", { name: "ログアウト" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(
      screen
        .getAllByRole("button", { name: "ログアウト" })
        .find((button) => dialog.contains(button))!,
    );

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it("確認モーダルでキャンセルするとログアウトを実行しない", async () => {
    await renderPage();

    fireEvent.click(screen.getByRole("button", { name: "ログアウト" }));
    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it("アカウント削除は確認なしで専用ページへのリンクにする", async () => {
    await renderPage();

    expect(
      screen.getByRole("button", { name: "アカウント削除" }),
    ).toHaveAttribute("href", "/account-deletion");
  });
});
