import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NOTE_LIST_PATH } from "@app/constants/note";
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

  // mobileのGlobalMenuOverlayと項目・並び順を揃えるため、4項目のみに固定する
  it("練習記録・野球ノート・シーズン管理・設定への導線をこの順で持つ", async () => {
    await openMenu();

    const items = screen.getAllByRole("menuitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "練習記録",
      "野球ノート",
      "シーズン管理",
      "設定",
    ]);
    expect(items[0]).toHaveAttribute("href", "/practice/records");
    expect(items[1]).toHaveAttribute("href", NOTE_LIST_PATH);
    expect(items[2]).toHaveAttribute("href", "/seasons");
    expect(items[3]).toHaveAttribute("href", "/settings");
  });

  it("未ログインではメニューを出さない", () => {
    mockIsLoggedIn.mockReturnValue(false);

    render(<HeaderRight />);

    expect(
      screen.queryByRole("button", { name: "メニュー" }),
    ).not.toBeInTheDocument();
  });
});
