import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GroupJoinPage from "../page";

const mockCapture = jest.fn();
jest.mock("@app/utils/posthog", () => ({
  capture: (...args: unknown[]) => mockCapture(...args),
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/groups/join",
}));

jest.mock("@app/contexts/useAuthContext", () => ({
  useAuthContext: () => ({ isLoggedIn: true, loading: false }),
}));

jest.mock("@app/components/header/Header", () => ({
  __esModule: true,
  default: () => null,
}));

const mockGetInviteLinkInfo = jest.fn();
const mockAcceptInviteLink = jest.fn();
jest.mock("@app/services/groupInviteLinksService", () => ({
  getInviteLinkInfo: (...args: unknown[]) => mockGetInviteLinkInfo(...args),
  acceptInviteLink: (...args: unknown[]) => mockAcceptInviteLink(...args),
}));

const joinWithCode = async () => {
  const user = userEvent.setup();
  render(<GroupJoinPage />);
  await user.type(screen.getByPlaceholderText("例: ABC12DEF"), "abc12def");
  await user.click(screen.getByText("確認する"));
  await screen.findByText("テストグループ");
  await user.click(screen.getByText("グループに参加"));
};

describe("グループ参加ページの計測", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetInviteLinkInfo.mockResolvedValue({
      group: { id: 5, name: "テストグループ", icon: null, member_count: 3 },
      inviter: { name: "招待者", image: { url: null } },
    });
    mockAcceptInviteLink.mockResolvedValue({ group_id: 5 });
  });

  it("招待コードで参加すると group joined を送る", async () => {
    await joinWithCode();

    await waitFor(() =>
      expect(mockCapture).toHaveBeenCalledWith("group joined", {
        group_id: 5,
      }),
    );
  });

  it("参加に失敗したときは計測しない", async () => {
    mockAcceptInviteLink.mockRejectedValue(new Error("failed"));

    await joinWithCode();

    await waitFor(() => expect(mockAcceptInviteLink).toHaveBeenCalled());
    expect(mockCapture).not.toHaveBeenCalledWith(
      "group joined",
      expect.anything(),
    );
  });
});
