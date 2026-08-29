import type { GroupsData } from "@app/interface";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { SWRConfig } from "swr";
import { GROUP_TAB_BADGE_SEEN_STORAGE_KEY } from "@app/constants/onboarding";
import NavigationMenu from "../NavigationMenu";

jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

jest.mock("@app/components/header/HeaderUserMenu", () => ({
  __esModule: true,
  default: () => null,
}));

const mockIsLoggedIn = jest.fn<boolean | undefined, []>();
jest.mock("@app/contexts/useAuthContext", () => ({
  useAuthContext: () => ({ isLoggedIn: mockIsLoggedIn() }),
}));

const mockUserId = jest.fn<number | null, []>();
jest.mock("@app/contexts/userContext", () => ({
  useUser: () => ({
    state: { userId: { id: mockUserId(), team_id: null, user_id: "" } },
  }),
}));

const mockFetcher = jest.fn();
jest.mock("@app/hooks/swrFetcher", () => ({
  fetcher: (url: string) => mockFetcher(url),
}));

const BADGE_LABEL = "グループ未参加";

const buildGroup = (id: number): GroupsData => ({
  id,
  name: `グループ${id}`,
  icon: { url: "/icon.png" },
});

// SWR のキャッシュをテストごとに隔離する
const renderMenu = () =>
  render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <NavigationMenu />
    </SWRConfig>,
  );

const findBadge = () => screen.findByRole("status", { name: BADGE_LABEL });
const queryBadge = () => screen.queryByRole("status", { name: BADGE_LABEL });

describe("NavigationMenu のグループ未参加バッジ", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    jest.restoreAllMocks();
    mockIsLoggedIn.mockReturnValue(true);
    mockUserId.mockReturnValue(1);
    mockFetcher.mockResolvedValue([]);
  });

  it("グループ未参加のユーザーにはバッジを出す", async () => {
    renderMenu();

    expect(await findBadge()).toBeInTheDocument();
  });

  it("グループ参加済みのユーザーにはバッジを出さない", async () => {
    mockFetcher.mockResolvedValue([buildGroup(1)]);

    renderMenu();

    await waitFor(() => expect(mockFetcher).toHaveBeenCalled());
    expect(queryBadge()).not.toBeInTheDocument();
  });

  it("グループ一覧の取得が確定するまではバッジを出さない", () => {
    mockFetcher.mockReturnValue(new Promise(() => {}));

    renderMenu();

    expect(queryBadge()).not.toBeInTheDocument();
  });

  it("未ログインならバッジを出さず、グループ一覧も取得しない", async () => {
    mockIsLoggedIn.mockReturnValue(false);

    renderMenu();

    await waitFor(() => expect(queryBadge()).not.toBeInTheDocument());
    expect(mockFetcher).not.toHaveBeenCalled();
  });

  it("グループを開くとバッジが消え、再訪問しても出ない", async () => {
    const user = userEvent.setup();
    const { unmount } = renderMenu();
    await findBadge();

    await user.click(screen.getByRole("link", { name: /グループ/ }));
    await waitFor(() => expect(queryBadge()).not.toBeInTheDocument());

    unmount();
    renderMenu();

    await waitFor(() => expect(queryBadge()).not.toBeInTheDocument());
  });

  it("閲覧済みが保存されていればバッジを出さず、グループ一覧も取得しない", async () => {
    localStorage.setItem(GROUP_TAB_BADGE_SEEN_STORAGE_KEY, "1");

    renderMenu();

    await waitFor(() => expect(queryBadge()).not.toBeInTheDocument());
    expect(mockFetcher).not.toHaveBeenCalled();
  });

  it("SSR 時点ではバッジを描画しない（localStorage 読み込み前のちらつき防止）", () => {
    const html = renderToStaticMarkup(
      <SWRConfig value={{ provider: () => new Map() }}>
        <NavigationMenu />
      </SWRConfig>,
    );

    expect(html).not.toContain(BADGE_LABEL);
  });

  it("localStorage が例外を投げてもクラッシュせずバッジも出さない", async () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });

    expect(() => renderMenu()).not.toThrow();
    await waitFor(() => expect(queryBadge()).not.toBeInTheDocument());
    expect(mockFetcher).not.toHaveBeenCalled();
  });

  it("グループ以外のナビゲーションを踏んでもバッジは消えない", async () => {
    const user = userEvent.setup();
    renderMenu();
    await findBadge();

    await user.click(screen.getByRole("link", { name: "成績" }));

    expect(await findBadge()).toBeInTheDocument();
  });
});
