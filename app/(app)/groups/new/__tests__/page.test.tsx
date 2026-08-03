import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GroupNew from "../page";

const mockCapture = jest.fn();
jest.mock("@app/utils/posthog", () => ({
  capture: (...args: unknown[]) => mockCapture(...args),
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/groups/new",
}));

jest.mock("@app/contexts/useAuthContext", () => ({
  useAuthContext: () => ({ isLoggedIn: true, loading: false }),
}));

jest.mock("@app/components/header/HeaderMatchResultSave", () => ({
  __esModule: true,
  default: ({
    onMatchResultNext,
    text,
  }: {
    onMatchResultNext: () => void;
    text: string;
  }) => (
    <button type="button" onClick={onMatchResultNext}>
      {text}
    </button>
  ),
}));

const mockCreateGroup = jest.fn();
jest.mock("@app/services/groupService", () => ({
  createGroup: (...args: unknown[]) => mockCreateGroup(...args),
}));

jest.mock("@app/services/userService", () => ({
  getCurrentUserId: () => Promise.resolve(1),
  getFollowingUser: () =>
    Promise.resolve([
      { id: 2, name: "フォロー中ユーザー", user_id: "foo", image: { url: "" } },
    ]),
}));

const createGroupWithMember = async () => {
  const user = userEvent.setup();
  render(<GroupNew />);
  await screen.findByText("フォロー中ユーザー");
  await user.type(screen.getByLabelText("グループ名"), "テストチーム");
  await user.click(screen.getByRole("checkbox"));
  await user.click(screen.getByText("作成"));
};

describe("グループ作成ページの計測", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateGroup.mockResolvedValue({ id: 77 });
  });

  it("グループを作成すると group created を送る", async () => {
    await createGroupWithMember();

    await waitFor(() =>
      expect(mockCapture).toHaveBeenCalledWith("group created", {
        group_id: 77,
      }),
    );
  });

  it("作成に失敗したときは計測しない", async () => {
    mockCreateGroup.mockRejectedValue(new Error("failed"));

    await createGroupWithMember();

    await waitFor(() => expect(mockCreateGroup).toHaveBeenCalled());
    expect(mockCapture).not.toHaveBeenCalled();
  });
});
