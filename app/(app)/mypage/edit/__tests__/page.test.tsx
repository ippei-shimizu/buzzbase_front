import { act, render, screen, waitFor } from "@testing-library/react";
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
const mockGetUserData = jest.fn(() =>
  Promise.resolve<Record<string, unknown>>({
    id: 1,
    name: "テスト太郎",
    user_id: "test-user",
    introduction: "",
    image: { url: "" },
    is_private: false,
    positions: [],
    team_id: null,
  }),
);
jest.mock("@app/services/userService", () => ({
  getUserData: () => mockGetUserData(),
  updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
}));

jest.mock("@app/services/positionService", () => ({
  getPositions: () => Promise.resolve([]),
  updateUserPositions: () => Promise.resolve({}),
}));

jest.mock("@app/services/prefectureService", () => ({
  getPrefectures: () =>
    Promise.resolve([
      {
        id: 13,
        name: "東京都",
        hiragana: "とうきょうと",
        katakana: "トウキョウト",
        alphabet: "tokyo",
      },
    ]),
}));

jest.mock("@app/services/baseballCategoryService", () => ({
  getBaseballCategory: () =>
    Promise.resolve([
      {
        id: 1,
        name: "高校",
        hiragana: "こうこう",
        katakana: "コウコウ",
        alphabet: "high school",
      },
    ]),
}));

const mockTeams = [
  { id: 1, name: "テスト高校A", category_id: 1, prefecture_id: 13 },
  { id: 2, name: "テスト高校B", category_id: 1, prefecture_id: 13 },
];
let mockProfileTeamId: number | null = null;
type TeamsRequestConfig = { params?: { q?: string; limit?: number } };
const respondToAxiosGet = (
  url: string,
  config?: TeamsRequestConfig,
): Promise<{ data: unknown }> => {
  if (url === "/api/v1/teams") {
    const query = config?.params?.q ?? "";
    return Promise.resolve({
      data: mockTeams.filter((team) => team.name.includes(query)),
    });
  }
  if (url === "/api/v1/teams/test-user/my_team") {
    const team = mockTeams.find(
      (candidate) => candidate.id === mockProfileTeamId,
    );
    return Promise.resolve({
      data: team
        ? { name: team.name, category_name: "高校", prefecture_name: "東京都" }
        : { message: "チームが見つかりません。" },
    });
  }
  return Promise.reject(new Error(`unexpected GET ${url}`));
};
const mockAxiosGet = jest.fn(respondToAxiosGet);
const mockAxiosPost = jest.fn((_url: string, _body?: unknown) =>
  Promise.resolve({ data: { id: 99 } }),
);
const mockAxiosPut = jest.fn((_url: string, _body?: unknown) =>
  Promise.resolve({ data: {} }),
);
jest.mock("@app/utils/axiosInstance", () => ({
  __esModule: true,
  default: {
    get: (url: string, config?: TeamsRequestConfig) =>
      mockAxiosGet(url, config),
    post: (url: string, body?: unknown) => mockAxiosPost(url, body),
    put: (url: string, body?: unknown) => mockAxiosPut(url, body),
  },
}));

const userDataWithTeam = (teamId: number) => {
  mockProfileTeamId = teamId;
  return {
    id: 1,
    name: "テスト太郎",
    user_id: "test-user",
    introduction: "",
    image: { url: "" },
    is_private: false,
    positions: [],
    team_id: teamId,
  };
};

const savedTeamId = () => {
  const formData = mockUpdateProfile.mock.calls[0][0] as FormData;
  return formData.get("user[team_id]");
};

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

describe("チーム設定", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateProfile.mockResolvedValue({});
    mockProfileTeamId = null;
    mockAxiosGet.mockImplementation(respondToAxiosGet);
  });

  it("所属チーム名で検索しても候補に出ないチームでも、カテゴリー・地域を復元して保存できる", async () => {
    mockGetUserData.mockResolvedValueOnce(userDataWithTeam(2));
    // 所属チーム名を含むチームが上限件数を超え、検索結果に所属チーム自身が入らない状況
    mockAxiosGet.mockImplementation((url: string) =>
      url === "/api/v1/teams/test-user/my_team"
        ? Promise.resolve({
            data: {
              name: "テスト高校B",
              category_name: "高校",
              prefecture_name: "東京都",
            },
          })
        : url === "/api/v1/teams"
          ? Promise.resolve({ data: [] })
          : Promise.resolve({ data: { name: "テスト高校B" } }),
    );
    const user = userEvent.setup();
    render(<MypageEdit />);

    const teamInput = await screen.findByRole("combobox", {
      name: "チーム名",
    });
    await waitFor(() => expect(teamInput).toHaveValue("テスト高校B"));
    await user.click(screen.getByText("保存"));

    await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalled());
    expect(savedTeamId()).toBe("2");
    expect(mockAxiosPut).toHaveBeenCalledWith("/api/v1/teams/2", {
      team: { name: "テスト高校B", category_id: 1, prefecture_id: 13 },
    });
  });

  it("所属チームの id からチーム名が復元され、そのまま保存すると同じ id を送る", async () => {
    mockGetUserData.mockResolvedValueOnce(userDataWithTeam(2));
    const user = userEvent.setup();
    render(<MypageEdit />);

    const teamInput = await screen.findByRole("combobox", {
      name: "チーム名",
    });
    await waitFor(() => expect(teamInput).toHaveValue("テスト高校B"));

    await user.click(teamInput);
    await user.tab();
    expect(teamInput).toHaveValue("テスト高校B");

    await user.click(screen.getByText("保存"));

    await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalled());
    expect(savedTeamId()).toBe("2");
    expect(mockAxiosPost).not.toHaveBeenCalled();
  });

  it("チーム一覧は必ず検索語付きで取得し、全件取得のリクエストを出さない", async () => {
    mockGetUserData.mockResolvedValueOnce(userDataWithTeam(2));
    const user = userEvent.setup();
    render(<MypageEdit />);

    const teamInput = await screen.findByRole("combobox", {
      name: "チーム名",
    });
    await waitFor(() => expect(teamInput).toHaveValue("テスト高校B"));
    await user.tripleClick(teamInput);
    await user.paste("テスト");
    await screen.findAllByRole("option", { name: "テスト高校A", hidden: true });

    const teamListRequests = mockAxiosGet.mock.calls.filter(
      ([url]) => url === "/api/v1/teams",
    );
    expect(teamListRequests.length).toBeGreaterThan(0);
    teamListRequests.forEach(([, config]) => {
      expect(config?.params?.q).toBeTruthy();
    });
  });

  it("復元した所属チーム名を全消しして保存すると、所属チームを外して保存できる", async () => {
    mockGetUserData.mockResolvedValueOnce(userDataWithTeam(2));
    const user = userEvent.setup();
    render(<MypageEdit />);

    const teamInput = await screen.findByRole("combobox", {
      name: "チーム名",
    });
    await waitFor(() => expect(teamInput).toHaveValue("テスト高校B"));
    await user.clear(teamInput);
    await user.tab();

    await user.click(screen.getByText("保存"));

    await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalled());
    expect(savedTeamId()).toBe("");
  });

  it("チーム名を入力した直後に画面を離れると、デバウンス中の検索を送らない", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<MypageEdit />);

    const teamInput = await screen.findByRole("combobox", {
      name: "チーム名",
    });
    await user.type(teamInput, "テスト");
    const teamListRequests = () =>
      mockAxiosGet.mock.calls.filter(([url]) => url === "/api/v1/teams");
    const requestCountBeforeLeave = teamListRequests().length;
    unmount();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
    });

    expect(teamListRequests()).toHaveLength(requestCountBeforeLeave);
  });

  it("所属チームを別の名前に打ち替えて保存すると、元のチームを改名せず打ち替えた名前で登録する", async () => {
    mockGetUserData.mockResolvedValueOnce(userDataWithTeam(2));
    const user = userEvent.setup();
    render(<MypageEdit />);

    const teamInput = await screen.findByRole("combobox", {
      name: "チーム名",
    });
    await waitFor(() => expect(teamInput).toHaveValue("テスト高校B"));
    await user.tripleClick(teamInput);
    await user.paste("未登録チームZ");
    await user.tab();

    await user.click(screen.getByText("保存"));

    await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalled());
    expect(mockAxiosPut).not.toHaveBeenCalled();
    expect(mockAxiosPost).toHaveBeenCalledWith("/api/v1/teams", {
      team: { name: "未登録チームZ", category_id: 1, prefecture_id: 13 },
    });
    expect(savedTeamId()).toBe("99");
  });
});
