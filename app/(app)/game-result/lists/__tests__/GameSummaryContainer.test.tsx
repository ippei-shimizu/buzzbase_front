// HeroUI の Dropdown は jsdom で開けないため、選択肢をそのままボタンとして描画する。
jest.mock("@app/components/filter/FilterChip", () => ({
  __esModule: true,
  default: ({
    label,
    options,
    onChange,
  }: {
    label: string;
    options: { key: string; label: string }[];
    onChange: (key: string) => void;
  }) => (
    <>
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
        >
          {label}: {option.label}
        </button>
      ))}
    </>
  ),
}));

jest.mock("../_components/summary/GameResultSummary", () => ({
  GameResultSummary: () => <div>サマリー本体</div>,
}));

jest.mock("../gameSummaryActions", () => ({
  getGameSummary: jest.fn(),
  getGameSummaryFilterOptions: jest.fn(),
}));

import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { monthOptionsFromRecorded } from "@app/components/filter/monthOptions";
import { GameSummaryContainer } from "../_components/GameSummaryContainer";
import {
  getGameSummary,
  getGameSummaryFilterOptions,
} from "../gameSummaryActions";

const mockGetGameSummary = getGameSummary as jest.MockedFunction<
  typeof getGameSummary
>;
const mockGetFilterOptions = getGameSummaryFilterOptions as jest.MockedFunction<
  typeof getGameSummaryFilterOptions
>;

const summary = {
  win_loss: { wins: 1, losses: 0, draws: 0, total: 1, win_rate: 1.0 },
  scoring: {
    runs_for: 5,
    runs_against: 3,
    run_differential: 2,
    avg_runs_for: 5.0,
    avg_runs_against: 3.0,
  },
  recent_form: [],
  monthly_games: [],
  opponent_records: [],
};

async function renderContainer() {
  await act(async () => {
    render(<GameSummaryContainer />);
  });
  await screen.findByRole("button", { name: "大会: 県大会" });
  mockGetGameSummary.mockClear();
}

async function clickChip(name: string) {
  const user = userEvent.setup();
  await act(async () => {
    await user.click(screen.getByRole("button", { name }));
  });
}

describe("GameSummaryContainer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetGameSummary.mockResolvedValue({ status: "ok", data: summary });
    mockGetFilterOptions.mockResolvedValue({
      seasonOptions: [{ key: "3", label: "春季" }],
      tournamentOptions: [{ key: "7", label: "県大会" }],
      monthOptions: monthOptionsFromRecorded(["2026-06", "2026-04"]),
    });
  });

  it("取得した選択肢をチップに反映する（記録のない月は出さない）", async () => {
    await renderContainer();

    expect(
      screen.getByRole("button", { name: "開始: 2026年6月" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "終了: 2026年4月" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "開始: 2026年5月" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "シーズン: 春季" }),
    ).toBeInTheDocument();
  });

  it("月範囲を選ぶと startMonth / endMonth 付きで再取得する", async () => {
    await renderContainer();

    await clickChip("開始: 2026年4月");
    await clickChip("終了: 2026年6月");

    await waitFor(() =>
      expect(mockGetGameSummary).toHaveBeenLastCalledWith(
        expect.objectContaining({
          startMonth: "2026-04",
          endMonth: "2026-06",
        }),
      ),
    );
  });

  it("大会と種別を選ぶとそれぞれ付けて再取得する", async () => {
    await renderContainer();

    await clickChip("大会: 県大会");
    await clickChip("種別: 公式戦");

    await waitFor(() =>
      expect(mockGetGameSummary).toHaveBeenLastCalledWith(
        expect.objectContaining({ tournamentId: "7", matchType: "regular" }),
      ),
    );
  });

  it("クリアで全ての絞り込みが外れる", async () => {
    await renderContainer();

    await clickChip("大会: 県大会");
    await clickChip("フィルターをクリア");

    await waitFor(() =>
      expect(mockGetGameSummary).toHaveBeenLastCalledWith({}),
    );
  });

  it("非公開アカウントならその旨を表示する", async () => {
    mockGetGameSummary.mockResolvedValue({ status: "forbidden" });

    await act(async () => {
      render(<GameSummaryContainer />);
    });

    expect(
      await screen.findByText("このアカウントは非公開です。"),
    ).toBeInTheDocument();
  });
});
