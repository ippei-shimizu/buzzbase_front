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

jest.mock("@app/services/groupService", () => ({
  getGroupDetail: jest.fn(),
}));

jest.mock("@app/components/header/HeaderBackLink", () => {
  return function HeaderBackLink() {
    return <div />;
  };
});

jest.mock("@app/components/spinner/LoadingSpinner", () => {
  return function LoadingSpinner() {
    return <div />;
  };
});

jest.mock("@app/components/table/GroupBattingRankingTable", () => {
  return function GroupBattingRankingTable() {
    return <div data-testid="batting-ranking-table" />;
  };
});

jest.mock("@app/components/table/GroupPitchingRankingTable", () => {
  return function GroupPitchingRankingTable() {
    return <div />;
  };
});

jest.mock("@app/components/ad/AdInFeed", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@app/contexts/useAuthContext", () => ({
  useAuthContext: jest.fn(() => ({ isLoggedIn: true })),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock("react-anchor-link-smooth-scroll", () => {
  return function AnchorLink({ children }: { children: React.ReactNode }) {
    return <span>{children}</span>;
  };
});

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getGroupDetail } from "@app/services/groupService";
import GroupDetail from "../page";

const mockGetGroupDetail = getGroupDetail as jest.MockedFunction<
  typeof getGroupDetail
>;

const GROUP_ID = 1;

const groupDetailResponse = {
  accepted_users: [
    { id: 1, image: { url: "/u1.jpg" }, name: "ユーザー1", user_id: "user_1" },
  ],
  batting_averages: [{ hit: 10, home_run: 2, id: 1, user_id: 1 }],
  batting_stats: [
    { batting_average: 0.35, on_base_percentage: 0.42, user_id: 1 },
  ],
  pitching_aggregate: [
    { win: 5, hold: 2, saves: 1, strikeouts: 9, user_id: 1 },
  ],
  pitching_stats: [{ era: 2.5, win_percentage: 0.7, user_id: 1 }],
  group: { icon: { url: "/g.jpg" }, name: "テストグループ" },
  id: GROUP_ID,
  available_years: [2026, 2025],
  available_months: ["2026-06", "2026-04"],
  available_tournaments: [{ id: 7, name: "県大会" }],
};

// React 19 の use() が Suspense なしで即座に値を返すための事前解決済み Promise。
function createResolvedPromise<T>(value: T): Promise<T> {
  const promise = Promise.resolve(value) as Promise<T> & {
    status: string;
    value: T;
  };
  promise.status = "fulfilled";
  promise.value = value;
  return promise;
}

async function renderGroupDetail() {
  render(<GroupDetail params={createResolvedPromise({ slug: GROUP_ID })} />);
  await screen.findByTestId("batting-ranking-table");
  mockGetGroupDetail.mockClear();
}

describe("グループ詳細のフィルタ", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetGroupDetail.mockResolvedValue(groupDetailResponse);
  });

  it("初回は絞り込み無しで取得する", async () => {
    render(<GroupDetail params={createResolvedPromise({ slug: GROUP_ID })} />);
    await screen.findByTestId("batting-ranking-table");

    expect(mockGetGroupDetail).toHaveBeenCalledWith(GROUP_ID, {});
  });

  it("available_tournaments から大会チップを作り、選ぶと tournamentId 付きで再取得する", async () => {
    const user = userEvent.setup();
    await renderGroupDetail();

    await user.click(screen.getByRole("button", { name: "大会: 県大会" }));

    await waitFor(() =>
      expect(mockGetGroupDetail).toHaveBeenCalledWith(GROUP_ID, {
        tournamentId: "7",
      }),
    );
  });

  it("月範囲を選ぶと startMonth / endMonth 付きで再取得する", async () => {
    const user = userEvent.setup();
    await renderGroupDetail();

    await user.click(screen.getByRole("button", { name: "開始: 2026年4月" }));
    await user.click(screen.getByRole("button", { name: "終了: 2026年6月" }));

    await waitFor(() =>
      expect(mockGetGroupDetail).toHaveBeenLastCalledWith(GROUP_ID, {
        startMonth: "2026-04",
        endMonth: "2026-06",
        year: undefined,
      }),
    );
  });

  it("記録のある年月だけを月の選択肢にする", async () => {
    await renderGroupDetail();

    expect(
      screen.getByRole("button", { name: "終了: 2026年6月" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "終了: 2026年5月" }),
    ).not.toBeInTheDocument();
  });

  it("クリアで全ての絞り込みが外れる", async () => {
    const user = userEvent.setup();
    await renderGroupDetail();

    await user.click(screen.getByRole("button", { name: "年度: 2026" }));
    await user.click(
      screen.getByRole("button", { name: "フィルターをクリア" }),
    );

    await waitFor(() =>
      expect(mockGetGroupDetail).toHaveBeenLastCalledWith(GROUP_ID, {}),
    );
  });
});
