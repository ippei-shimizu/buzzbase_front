import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SWRConfig } from "swr";
import ProfileSetup from "../_components/ProfileSetup";

const mockCapture = jest.fn();
jest.mock("@app/utils/posthog", () => ({
  capture: (...args: unknown[]) => mockCapture(...args),
}));

const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace }),
  useSearchParams: () => new URLSearchParams("next=/mypage/taro"),
}));

jest.mock("@app/contexts/useAuthContext", () => ({
  useAuthContext: () => ({ isLoggedIn: true }),
}));

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
}));

const mockGetUserData = jest.fn();
const mockUpdateProfile = jest.fn();
jest.mock("@app/services/userService", () => ({
  getUserData: () => mockGetUserData(),
  updateProfile: (formData: FormData) => mockUpdateProfile(formData),
}));

const mockUpdateUserPositions = jest.fn();
jest.mock("@app/services/positionService", () => ({
  getPositions: () =>
    Promise.resolve([
      { id: 1, name: "投手" },
      { id: 2, name: "捕手" },
    ]),
  updateUserPositions: (params: unknown) => mockUpdateUserPositions(params),
}));

const mockGetTeamName = jest.fn();
const mockSearchTeams = jest.fn();
const mockCreateOrUpdateTeam = jest.fn();
jest.mock("@app/services/teamsService", () => ({
  getTeamName: (id: number) => mockGetTeamName(id),
  searchTeams: (query: string) => mockSearchTeams(query),
  createOrUpdateTeam: (params: unknown) => mockCreateOrUpdateTeam(params),
}));

const TEAMS = [
  { id: 10, name: "ブルーウェーブ", category_id: null, prefecture_id: null },
  { id: 11, name: "ブルーソックス", category_id: null, prefecture_id: null },
];

const buildUser = (overrides: Record<string, unknown> = {}) => ({
  id: 7,
  user_id: "taro",
  team_id: null,
  positions: [],
  throw_hand: null,
  batting_side: null,
  ...overrides,
});

const renderPage = () =>
  render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <ProfileSetup />
    </SWRConfig>,
  );

const lastSavedProfile = () => {
  const formData = mockUpdateProfile.mock.calls.at(-1)?.[0] as FormData;
  return {
    team_id: formData.get("user[team_id]"),
    throw_hand: formData.get("user[throw_hand]"),
    batting_side: formData.get("user[batting_side]"),
  };
};

const selectTeamSuggestion = async (
  user: ReturnType<typeof userEvent.setup>,
  teamInput: HTMLElement,
  teamName: string,
) => {
  await user.type(teamInput, "ブルー");
  // 候補は検索結果の到着後にポータルへ描画され、jsdom では React Aria がそのポータルごと
  // aria-hidden にしてしまうため hidden: true で探す。
  await user.click(
    await screen.findByRole("option", { name: teamName, hidden: true }),
  );
};

const ONBOARDING_PATH = `/onboarding?next=${encodeURIComponent("/mypage/taro")}`;

describe("登録直後のプロフィール入力", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserData.mockResolvedValue(buildUser());
    mockUpdateProfile.mockResolvedValue({ data: { success: true } });
    mockUpdateUserPositions.mockResolvedValue(undefined);
    mockSearchTeams.mockImplementation((query: string) =>
      Promise.resolve(TEAMS.filter((team) => team.name.includes(query))),
    );
    mockCreateOrUpdateTeam.mockResolvedValue({ data: { id: 99 } });
  });

  it("表示を profile setup viewed で送る", async () => {
    renderPage();

    await screen.findByRole("combobox", { name: "所属チーム" });
    expect(mockCapture).toHaveBeenCalledWith("profile setup viewed");
  });

  it("スキップすると保存せずにウォークスルーへ進む", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByRole("combobox", { name: "所属チーム" });
    await user.click(screen.getByRole("button", { name: "スキップ" }));

    expect(mockUpdateProfile).not.toHaveBeenCalled();
    expect(mockCapture).toHaveBeenCalledWith("profile setup completed", {
      skipped: true,
      has_team: false,
      position_count: 0,
    });
    expect(mockReplace).toHaveBeenCalledWith(ONBOARDING_PATH);
  });

  it("何も入力せずに保存しても登録を完了してウォークスルーへ進む", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByRole("combobox", { name: "所属チーム" });
    await user.click(screen.getByRole("button", { name: "保存してはじめる" }));

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith(ONBOARDING_PATH),
    );
    expect(lastSavedProfile()).toEqual({
      team_id: "",
      throw_hand: "",
      batting_side: "",
    });
    expect(mockCreateOrUpdateTeam).not.toHaveBeenCalled();
    expect(mockCapture).toHaveBeenCalledWith("profile setup completed", {
      skipped: false,
      has_team: false,
      position_count: 0,
    });
  });

  it("既存の値を持つユーザーが未入力のまま保存しても、既存の値を消さない", async () => {
    mockGetUserData.mockResolvedValue(
      buildUser({
        team_id: 10,
        positions: [{ id: 2 }],
        throw_hand: "left",
        batting_side: "both",
      }),
    );
    mockGetTeamName.mockResolvedValue("ブルーウェーブ");
    const user = userEvent.setup();
    renderPage();

    const teamInput = await screen.findByRole("combobox", {
      name: "所属チーム",
    });
    expect(teamInput).toHaveValue("ブルーウェーブ");
    await user.click(screen.getByRole("button", { name: "保存してはじめる" }));

    await waitFor(() => expect(mockReplace).toHaveBeenCalled());
    expect(lastSavedProfile()).toEqual({
      team_id: "10",
      throw_hand: "left",
      batting_side: "both",
    });
    expect(mockUpdateUserPositions).toHaveBeenCalledWith({
      userId: 7,
      positionIds: [2],
    });
    expect(mockCreateOrUpdateTeam).not.toHaveBeenCalled();
  });

  it("既存の所属チーム名を解決できないときは保存させない", async () => {
    mockGetUserData.mockResolvedValue(buildUser({ team_id: 10 }));
    mockGetTeamName.mockResolvedValue("");
    renderPage();

    expect(
      await screen.findByText(/プロフィールを読み込めませんでした/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "保存してはじめる" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "スキップ" })).toBeEnabled();
  });

  describe("所属チームの入力", () => {
    it("候補から選んだまま保存すると、新規作成せず選んだチームの id を送る", async () => {
      const user = userEvent.setup();
      renderPage();

      const teamInput = await screen.findByRole("combobox", {
        name: "所属チーム",
      });
      await selectTeamSuggestion(user, teamInput, "ブルーソックス");
      await user.click(
        screen.getByRole("button", { name: "保存してはじめる" }),
      );

      await waitFor(() => expect(mockReplace).toHaveBeenCalled());
      expect(lastSavedProfile().team_id).toBe("11");
      expect(mockCreateOrUpdateTeam).not.toHaveBeenCalled();
    });

    it("候補を選んだ後に打ち替えて保存すると、打ち替えた名前で解決した id を送る", async () => {
      const user = userEvent.setup();
      renderPage();

      const teamInput = await screen.findByRole("combobox", {
        name: "所属チーム",
      });
      await selectTeamSuggestion(user, teamInput, "ブルーソックス");
      await user.clear(teamInput);
      await user.type(teamInput, "レッドスターズ {Escape}");
      await user.click(
        screen.getByRole("button", { name: "保存してはじめる" }),
      );

      await waitFor(() => expect(mockReplace).toHaveBeenCalled());
      expect(mockCreateOrUpdateTeam).toHaveBeenCalledWith({
        team: {
          name: "レッドスターズ",
          category_id: undefined,
          prefecture_id: undefined,
        },
      });
      expect(lastSavedProfile().team_id).toBe("99");
    });

    it("候補を選んだ後に入力を全消しして保存すると、所属チームなしで保存する", async () => {
      const user = userEvent.setup();
      renderPage();

      const teamInput = await screen.findByRole("combobox", {
        name: "所属チーム",
      });
      await selectTeamSuggestion(user, teamInput, "ブルーウェーブ");
      await user.clear(teamInput);
      await user.keyboard("{Escape}");
      await user.click(
        screen.getByRole("button", { name: "保存してはじめる" }),
      );

      await waitFor(() => expect(mockReplace).toHaveBeenCalled());
      expect(lastSavedProfile().team_id).toBe("");
      expect(mockCreateOrUpdateTeam).not.toHaveBeenCalled();
    });

    it("復元した所属チームが候補に無いまま入力欄を出入りしても、名前と id が消えない", async () => {
      mockGetUserData.mockResolvedValue(buildUser({ team_id: 10 }));
      mockGetTeamName.mockResolvedValue("ブルーウェーブ");
      // 部分一致の件数上限で候補から溢れた状態。このとき blur で onSelectionChange(null) が飛ぶ。
      mockSearchTeams.mockResolvedValue([]);
      const user = userEvent.setup();
      renderPage();

      const teamInput = await screen.findByRole("combobox", {
        name: "所属チーム",
      });
      await user.click(teamInput);
      await user.tab();
      await user.keyboard("{Escape}");

      expect(teamInput).toHaveValue("ブルーウェーブ");
      await user.click(
        screen.getByRole("button", { name: "保存してはじめる" }),
      );
      await waitFor(() => expect(mockReplace).toHaveBeenCalled());
      expect(lastSavedProfile().team_id).toBe("10");
      expect(mockCreateOrUpdateTeam).not.toHaveBeenCalled();
    });

    it("候補を選んだ後に打ち替えて blur しても、入力した名前が消えない", async () => {
      const user = userEvent.setup();
      renderPage();

      const teamInput = await screen.findByRole("combobox", {
        name: "所属チーム",
      });
      await selectTeamSuggestion(user, teamInput, "ブルーウェーブ");
      await user.clear(teamInput);
      await user.type(teamInput, "レッドスターズ");
      await user.tab();

      expect(teamInput).toHaveValue("レッドスターズ");
    });
  });
});
