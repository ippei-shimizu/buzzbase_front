import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HeaderRight from "../HeaderRight";

jest.mock("@app/components/auth/HeaderLoginAndSignUp", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@app/components/notification/NotificationBadge", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@app/components/user/UserSearch", () => ({
  __esModule: true,
  default: () => null,
}));

const mockIsLoggedIn = jest.fn<boolean | undefined, []>();
jest.mock("@app/contexts/useAuthContext", () => ({
  useAuthContext: () => ({ isLoggedIn: mockIsLoggedIn() }),
}));

async function openMenu() {
  render(<HeaderRight />);
  await userEvent.click(screen.getByRole("button", { name: "メニュー" }));
}

describe("HeaderRight のメニュー", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsLoggedIn.mockReturnValue(true);
  });

  // 導線が無いと機能そのものに到達できないため、リンク先まで固定する
  it("練習メニューへの導線を持つ", async () => {
    await openMenu();

    expect(
      screen.getByRole("menuitem", { name: /練習メニュー/ }),
    ).toHaveAttribute("href", "/practice/menus");
  });

  it("練習スケジュールへの導線を持つ", async () => {
    await openMenu();

    expect(
      screen.getByRole("menuitem", { name: /練習スケジュール/ }),
    ).toHaveAttribute("href", "/practice/schedules");
  });

  it("振り返りテンプレへの導線を持つ", async () => {
    await openMenu();

    expect(
      screen.getByRole("menuitem", { name: /振り返りテンプレ/ }),
    ).toHaveAttribute("href", "/note/templates");
  });

  it("野球ノートとシーズン管理の導線を維持する", async () => {
    await openMenu();

    expect(
      screen.getByRole("menuitem", { name: /野球ノート/ }),
    ).toHaveAttribute("href", "/note");
    expect(
      screen.getByRole("menuitem", { name: /シーズン管理/ }),
    ).toHaveAttribute("href", "/seasons");
  });

  it("未ログインではメニューを出さない", () => {
    mockIsLoggedIn.mockReturnValue(false);

    render(<HeaderRight />);

    expect(
      screen.queryByRole("button", { name: "メニュー" }),
    ).not.toBeInTheDocument();
  });
});
