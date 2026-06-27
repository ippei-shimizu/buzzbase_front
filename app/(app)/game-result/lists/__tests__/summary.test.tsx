import type {
  OpponentRecord,
  RecentFormGame,
  Scoring,
  WinLossSummary,
} from "../gameSummaryTypes";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameResultSummary } from "../_components/summary/GameResultSummary";
import { OpponentRecordList } from "../_components/summary/OpponentRecordList";
import { RecentForm } from "../_components/summary/RecentForm";
import { ScoringStats } from "../_components/summary/ScoringStats";
import { WinLossCards } from "../_components/summary/WinLossCards";

describe("WinLossCards", () => {
  it("勝敗数と勝率（先頭0を除去）を表示する", () => {
    const summary: WinLossSummary = {
      wins: 7,
      losses: 5,
      draws: 0,
      total: 12,
      win_rate: 0.583,
    };
    render(<WinLossCards summary={summary} />);

    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("12試合 / 勝率")).toBeInTheDocument();
    expect(screen.getByText(".583")).toBeInTheDocument();
  });
});

describe("ScoringStats", () => {
  it("得失点差がプラスのとき + を付ける", () => {
    const scoring: Scoring = {
      runs_for: 30,
      runs_against: 20,
      run_differential: 10,
      avg_runs_for: 3.0,
      avg_runs_against: 2.0,
    };
    render(<ScoringStats scoring={scoring} />);

    expect(screen.getByText("+10")).toBeInTheDocument();
  });

  it("得失点差がマイナスのときは符号をそのまま表示する", () => {
    const scoring: Scoring = {
      runs_for: 10,
      runs_against: 18,
      run_differential: -8,
      avg_runs_for: 1.0,
      avg_runs_against: 1.8,
    };
    render(<ScoringStats scoring={scoring} />);

    expect(screen.getByText("-8")).toBeInTheDocument();
  });
});

describe("RecentForm", () => {
  const baseGame: RecentFormGame = {
    game_result_id: 1,
    date: "07/10",
    match_type: "regular",
    opponent: "チームA",
    result: "win",
    my_score: 5,
    opponent_score: 3,
  };

  it("空配列なら何も描画しない", () => {
    const { container } = render(<RecentForm games={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("勝敗記号・種別ラベル・スコア・対戦相手を表示する", () => {
    render(<RecentForm games={[baseGame]} />);

    expect(screen.getByText("○")).toBeInTheDocument();
    expect(screen.getByText("公式戦")).toBeInTheDocument();
    expect(screen.getByText("5-3")).toBeInTheDocument();
    expect(screen.getByText("vs チームA")).toBeInTheDocument();
  });
});

describe("OpponentRecordList", () => {
  function buildRecords(count: number): OpponentRecord[] {
    return Array.from({ length: count }, (_, index) => ({
      team_name: `チーム${index}`,
      wins: index,
      losses: 1,
      draws: 0,
      total: index + 1,
    }));
  }

  it("3件までは展開ボタンを出さない", () => {
    render(<OpponentRecordList records={buildRecords(3)} />);
    expect(screen.queryByText("すべて表示 ▼")).not.toBeInTheDocument();
  });

  it("3件超は初期3件のみ表示し、展開で全件表示する", async () => {
    const user = userEvent.setup();
    render(<OpponentRecordList records={buildRecords(5)} />);

    expect(screen.getByText("チーム0")).toBeInTheDocument();
    expect(screen.getByText("チーム2")).toBeInTheDocument();
    expect(screen.queryByText("チーム4")).not.toBeInTheDocument();

    await user.click(screen.getByText("すべて表示 ▼"));

    expect(screen.getByText("チーム4")).toBeInTheDocument();
    expect(screen.getByText("閉じる ▲")).toBeInTheDocument();
  });
});

describe("GameResultSummary", () => {
  it("試合数0なら空メッセージを表示する", () => {
    render(
      <GameResultSummary
        summary={{
          win_loss: { wins: 0, losses: 0, draws: 0, total: 0, win_rate: 0 },
          scoring: {
            runs_for: 0,
            runs_against: 0,
            run_differential: 0,
            avg_runs_for: 0,
            avg_runs_against: 0,
          },
          recent_form: [],
          monthly_games: [],
          opponent_records: [],
        }}
      />,
    );

    expect(screen.getByText("試合結果はありません。")).toBeInTheDocument();
  });
});
