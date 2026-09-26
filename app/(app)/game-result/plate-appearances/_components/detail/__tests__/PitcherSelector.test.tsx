import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PitcherSelector } from "../PitcherSelector";

const pitcher = {
  id: 5,
  name: "田中投手",
  throw_hand: "right" as const,
  team_id: 2,
  memo: null,
  arm_angle: null,
  velocity_zone: null,
  pitcher_style: null,
};

jest.mock("@app/services/v2/pitcherService", () => ({
  getPitchers: () => Promise.resolve({ data: [pitcher] }),
  createPitcher: jest.fn(),
  updatePitcher: jest.fn(),
}));

const mockAxiosGet = jest.fn((url: string) =>
  url === "/api/v1/teams/2/team_name"
    ? Promise.resolve({ data: { name: "テスト高校B" } })
    : Promise.reject(new Error(`unexpected GET ${url}`)),
);
jest.mock("@app/utils/axiosInstance", () => ({
  __esModule: true,
  default: { get: (url: string) => mockAxiosGet(url) },
}));

describe("PitcherSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("投手一覧に所属チーム名を表示し、チームの全件取得は行わない", async () => {
    const user = userEvent.setup();
    render(<PitcherSelector value={null} onChange={jest.fn()} />);

    await user.click(screen.getByRole("button", { name: "選択" }));

    expect(
      await screen.findByText("テスト高校B / 右投げ", { exact: false }),
    ).toBeInTheDocument();
    expect(mockAxiosGet).not.toHaveBeenCalledWith("/api/v1/teams");
  });

  it("チーム名の取得に失敗しても、一覧を開き直すと取り直して表示する", async () => {
    mockAxiosGet.mockImplementationOnce(() =>
      Promise.reject(new Error("network error")),
    );
    const user = userEvent.setup();
    render(<PitcherSelector value={null} onChange={jest.fn()} />);

    await user.click(screen.getByRole("button", { name: "選択" }));
    await screen.findByText("右投げ", { exact: false });
    await user.click(screen.getByRole("button", { name: "閉じる" }));
    await user.click(screen.getByRole("button", { name: "選択" }));

    expect(
      await screen.findByText("テスト高校B / 右投げ", { exact: false }),
    ).toBeInTheDocument();
  });
});
