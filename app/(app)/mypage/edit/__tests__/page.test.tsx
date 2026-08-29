import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MypageEdit from "../page";

const mockCapture = jest.fn();
jest.mock("@app/utils/posthog", () => ({
  capture: (...args: unknown[]) => mockCapture(...args),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/mypage/edit",
}));

jest.mock("@app/contexts/useAuthContext", () => ({
  useAuthContext: () => ({ isLoggedIn: true, loading: false }),
}));

jest.mock("@app/components/header/HeaderSave", () => ({
  __esModule: true,
  default: ({ onProfileUpdate }: { onProfileUpdate: () => void }) => (
    <button type="button" onClick={onProfileUpdate}>
      保存
    </button>
  ),
}));

const mockUpdateProfile = jest.fn();
jest.mock("@app/services/userService", () => ({
  getUserData: () =>
    Promise.resolve({
      id: 1,
      name: "テスト太郎",
      user_id: "test-user",
      introduction: "",
      image: { url: "" },
      is_private: false,
      positions: [],
      team_id: null,
    }),
  updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
}));

jest.mock("@app/services/positionService", () => ({
  getPositions: () => Promise.resolve([]),
  updateUserPositions: () => Promise.resolve({}),
}));

jest.mock("@app/services/prefectureService", () => ({
  getPrefectures: () => Promise.resolve([]),
}));

jest.mock("@app/services/baseballCategoryService", () => ({
  getBaseballCategory: () => Promise.resolve([]),
}));

jest.mock("@app/services/teamsService", () => ({
  getTeams: () => Promise.resolve([]),
  createOrUpdateTeam: () => Promise.resolve({}),
  updateTeam: () => Promise.resolve({}),
}));

jest.mock("@app/services/awardsService", () => ({
  getUserAwards: () => Promise.resolve([]),
  createAward: () => Promise.resolve({}),
  deleteAward: () => Promise.resolve({}),
  updatePutAward: () => Promise.resolve({}),
}));

describe("プロフィール編集ページの計測", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateProfile.mockResolvedValue({});
  });

  it("プロフィールを保存すると profile updated を送る", async () => {
    const user = userEvent.setup();
    render(<MypageEdit />);
    await screen.findByDisplayValue("テスト太郎");

    await user.click(screen.getByText("保存"));

    await waitFor(() =>
      expect(mockCapture).toHaveBeenCalledWith("profile updated"),
    );
  });

  it("保存に失敗したときは計測しない", async () => {
    const user = userEvent.setup();
    mockUpdateProfile.mockRejectedValue(new Error("failed"));
    render(<MypageEdit />);
    await screen.findByDisplayValue("テスト太郎");

    await user.click(screen.getByText("保存"));

    await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalled());
    expect(mockCapture).not.toHaveBeenCalled();
  });
});
