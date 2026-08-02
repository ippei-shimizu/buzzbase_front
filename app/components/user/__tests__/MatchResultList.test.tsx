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

jest.mock("@app/components/ad/AdInFeed", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@app/components/listItem/MatchResultsItem", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@app/services/gameResultsService", () => ({
  getFilterGameResultsV2: jest.fn(),
  getFilterGameResultsUserIdV2: jest.fn(),
}));

jest.mock("@app/services/matchResultsService", () => ({
  getMatchResults: jest.fn(),
  getMatchResultsUserId: jest.fn(),
  getAvailableMonths: jest.fn(),
}));

jest.mock("@app/services/seasonsService", () => ({
  getSeasons: jest.fn(),
}));

jest.mock("@app/services/tournamentsService", () => ({
  getUserTournaments: jest.fn(),
}));

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getFilterGameResultsUserIdV2 } from "@app/services/gameResultsService";
import {
  getAvailableMonths,
  getMatchResultsUserId,
} from "@app/services/matchResultsService";
import { getSeasons } from "@app/services/seasonsService";
import { getUserTournaments } from "@app/services/tournamentsService";
import MatchResultList from "../MatchResultList";

const mockGetFiltered = getFilterGameResultsUserIdV2 as jest.MockedFunction<
  typeof getFilterGameResultsUserIdV2
>;

const USER_ID = 12;

function setupServices() {
  (getMatchResultsUserId as jest.Mock).mockResolvedValue([
    { date_and_time: "2026-06-01T10:00:00+09:00", match_type: "regular" },
    { date_and_time: "2026-04-01T10:00:00+09:00", match_type: "open" },
  ]);
  (getSeasons as jest.Mock).mockResolvedValue([{ id: 3, name: "春季" }]);
  (getUserTournaments as jest.Mock).mockResolvedValue([
    { id: 7, name: "県大会" },
  ]);
  (getAvailableMonths as jest.Mock).mockResolvedValue(["2026-06", "2026-04"]);
  mockGetFiltered.mockResolvedValue({
    data: [],
    pagination: {
      current_page: 1,
      per_page: 10,
      total_count: 0,
      total_pages: 1,
    },
  });
}

async function renderList() {
  render(<MatchResultList userId={USER_ID} />);
  await screen.findByRole("button", { name: "大会: 県大会" });
  mockGetFiltered.mockClear();
}

describe("MatchResultList のフィルタ", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupServices();
  });

  it("大会を選ぶと tournamentId 付きで再取得する", async () => {
    const user = userEvent.setup();
    await renderList();

    await user.click(screen.getByRole("button", { name: "大会: 県大会" }));

    await waitFor(() =>
      expect(mockGetFiltered).toHaveBeenCalledWith(
        USER_ID,
        expect.objectContaining({ tournamentId: "7", page: 1 }),
      ),
    );
  });

  it("月範囲を選ぶと startMonth / endMonth 付きで再取得する", async () => {
    const user = userEvent.setup();
    await renderList();

    await user.click(screen.getByRole("button", { name: "開始: 2026年4月" }));
    await user.click(screen.getByRole("button", { name: "終了: 2026年6月" }));

    await waitFor(() =>
      expect(mockGetFiltered).toHaveBeenLastCalledWith(
        USER_ID,
        expect.objectContaining({
          startMonth: "2026-04",
          endMonth: "2026-06",
        }),
      ),
    );
  });

  it("記録のある年月だけを月の選択肢にする", async () => {
    await renderList();

    expect(
      screen.getByRole("button", { name: "開始: 2026年6月" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "開始: 2026年5月" }),
    ).not.toBeInTheDocument();
  });

  it("クリアで全ての絞り込みが外れる", async () => {
    const user = userEvent.setup();
    await renderList();

    await user.click(screen.getByRole("button", { name: "大会: 県大会" }));
    await user.click(screen.getByRole("button", { name: "種別: 公式戦" }));
    await user.click(
      screen.getByRole("button", { name: "フィルターをクリア" }),
    );

    await waitFor(() =>
      expect(mockGetFiltered).toHaveBeenLastCalledWith(USER_ID, {
        page: 1,
        search: undefined,
        sortBy: undefined,
        sortOrder: undefined,
      }),
    );
  });
});
