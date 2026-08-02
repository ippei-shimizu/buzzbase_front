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

jest.mock("../EraTrendChart", () => ({
  EraTrendChart: () => null,
}));

jest.mock("../../../analysisActions", () => ({
  getEraTrend: jest.fn(),
}));

import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { monthOptionsFromRecorded } from "@app/components/filter/monthOptions";
import { getEraTrend } from "../../../analysisActions";
import { PitchingAnalysisContainer } from "../PitchingAnalysisContainer";

const mockGetEraTrend = getEraTrend as jest.MockedFunction<typeof getEraTrend>;

const CURRENT_YEAR = String(new Date().getFullYear());

async function renderContainer() {
  await act(async () => {
    render(
      <PitchingAnalysisContainer
        initialEraTrend={[]}
        seasonOptions={[{ key: "3", label: "春季" }]}
        tournamentOptions={[{ key: "7", label: "県大会" }]}
        monthOptions={monthOptionsFromRecorded(["2026-06", "2026-04"])}
      />,
    );
  });
}

async function clickChip(name: string) {
  const user = userEvent.setup();
  await act(async () => {
    await user.click(screen.getByRole("button", { name }));
  });
}

describe("PitchingAnalysisContainer の絞り込み", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetEraTrend.mockResolvedValue([]);
  });

  it("初回は SSR の初期データを使い再取得しない", async () => {
    await renderContainer();

    expect(mockGetEraTrend).not.toHaveBeenCalled();
  });

  it("月範囲を選ぶと startMonth / endMonth 付きで再取得する", async () => {
    await renderContainer();

    await clickChip("開始: 2026年4月");
    await clickChip("終了: 2026年6月");

    await waitFor(() =>
      expect(mockGetEraTrend).toHaveBeenLastCalledWith(
        expect.objectContaining({
          startMonth: "2026-04",
          endMonth: "2026-06",
        }),
      ),
    );
  });

  it("大会・シーズン・年度もそのまま渡す", async () => {
    await renderContainer();

    await clickChip("大会: 県大会");
    await clickChip("シーズン: 春季");
    await clickChip(`年度: ${CURRENT_YEAR}`);

    await waitFor(() =>
      expect(mockGetEraTrend).toHaveBeenLastCalledWith(
        expect.objectContaining({
          tournamentId: "7",
          seasonId: "3",
          year: CURRENT_YEAR,
        }),
      ),
    );
  });

  it("記録のない月は選択肢に出ない", async () => {
    await renderContainer();

    expect(
      screen.queryByRole("button", { name: "開始: 2026年5月" }),
    ).not.toBeInTheDocument();
  });

  it("クリアで全ての絞り込みが外れる", async () => {
    await renderContainer();

    await clickChip("大会: 県大会");
    await clickChip("フィルターをクリア");

    await waitFor(() => expect(mockGetEraTrend).toHaveBeenLastCalledWith({}));
  });
});
