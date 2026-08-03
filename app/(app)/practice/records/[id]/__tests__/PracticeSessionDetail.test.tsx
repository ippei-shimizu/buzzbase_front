const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({ open: jest.fn(), close: jest.fn() }),
}));

jest.mock("@app/hooks/pro/useEntitlement", () => ({
  useEntitlement: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: { error: jest.fn(), success: jest.fn(), info: jest.fn() },
}));

jest.mock("@app/services/v2/practiceSessionService", () => ({
  deletePracticeSession: jest.fn(),
}));

import type { BaseballNoteV2 } from "@app/interface/baseballNoteV2";
import type {
  PracticeLog,
  PracticeMenu,
  PracticeSession,
} from "@app/types/practice";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import { deletePracticeSession } from "@app/services/v2/practiceSessionService";
import PracticeSessionDetail from "../_components/PracticeSessionDetail";

const mockUseEntitlement = useEntitlement as jest.MockedFunction<
  typeof useEntitlement
>;
const mockDelete = deletePracticeSession as jest.MockedFunction<
  typeof deletePracticeSession
>;

function setEntitlement(hasCondition: boolean, isLoading = false) {
  mockUseEntitlement.mockReturnValue({
    isPro: hasCondition,
    inTrial: false,
    inGracePeriod: false,
    isLoading,
    hasEntitlement: (feature) =>
      feature === "detailed_condition_log" ? hasCondition : false,
  });
}

function buildLog(overrides: Partial<PracticeLog> = {}): PracticeLog {
  return {
    id: 1,
    practice_menu_id: 1,
    schedule_id: null,
    logged_on: "2026-07-14",
    amount: "200.0",
    weight: null,
    menu_name: "素振り",
    unit_label: "本",
    source: "manual",
    memo: null,
    created_at: "2026-07-14T10:00:00+09:00",
    ...overrides,
  };
}

function buildSession(
  overrides: Partial<PracticeSession> = {},
): PracticeSession {
  return {
    id: 7,
    logged_on: "2026-07-14",
    memo: null,
    improvement_theme_ids: [],
    practice_logs: [],
    condition: null,
    created_at: "2026-07-14T10:00:00+09:00",
    ...overrides,
  };
}

const menu: PracticeMenu = {
  id: 1,
  name: "素振り",
  category: "batting",
  unit: "count",
  unit_label: "本",
  default_value: "200.0",
  is_favorite: false,
  sort_order: 1,
};

const note: BaseballNoteV2 = {
  id: 100,
  title: "気づき",
  date: "2026-07-14",
  memo: null,
  memo_preview: "外角が詰まる",
  game_result_ids: [],
  practice_log_id: null,
  practice_session_id: 7,
  improvement_theme_ids: [],
  reflection_template_id: null,
  reflection_answers: [],
  tags: [],
  media_attachments: [],
};

function renderDetail(
  overrides: Partial<React.ComponentProps<typeof PracticeSessionDetail>> = {},
) {
  return render(
    <PracticeSessionDetail
      session={buildSession()}
      menus={[menu]}
      notes={[]}
      {...overrides}
    />,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  setEntitlement(true);
});

describe("PracticeSessionDetail の表示", () => {
  it("練習日を「7月14日(火)」形式で見出しに出す", () => {
    renderDetail();

    expect(
      screen.getByRole("heading", { name: "7月14日(火)" }),
    ).toBeInTheDocument();
  });

  it("メニューごとの量を formatPracticeValue の表記で出す", () => {
    renderDetail({
      session: buildSession({
        practice_logs: [
          buildLog({ id: 1, menu_name: "素振り", amount: "200.0" }),
          buildLog({
            id: 2,
            menu_name: "ベンチプレス",
            amount: "10.0",
            weight: "60.0",
            unit_label: "回",
          }),
        ],
      }),
    });

    expect(screen.getByText("200本")).toBeInTheDocument();
    expect(screen.getByText("60kg × 10回")).toBeInTheDocument();
  });

  it("ログ個別のメモを出す", () => {
    renderDetail({
      session: buildSession({
        practice_logs: [buildLog({ memo: "外角を意識した" })],
      }),
    });

    expect(screen.getByText("外角を意識した")).toBeInTheDocument();
  });

  it("その日のメモを出す", () => {
    renderDetail({ session: buildSession({ memo: "全体的に振り遅れ気味" }) });

    expect(screen.getByText("全体的に振り遅れ気味")).toBeInTheDocument();
  });

  it("編集導線は記録画面へ日付付きで遷移する", () => {
    renderDetail();

    expect(screen.getByRole("link", { name: "編集する" })).toHaveAttribute(
      "href",
      "/practice/record?date=2026-07-14",
    );
  });
});

describe("PracticeSessionDetail のコンディション", () => {
  const withCondition = buildSession({
    condition: {
      id: 1,
      logged_on: "2026-07-14",
      fatigue_level: 2,
      physical_level: 3,
      sleep_hours: "7.5",
      mood: "普通",
      memo: "後半は集中が切れた",
      injuries: [{ part: "肩", memo: "軽い張り" }],
    },
  });

  it("Pro ユーザーには記録したコンディションをそのまま出す", () => {
    setEntitlement(true);
    renderDetail({ session: withCondition });

    expect(screen.getByText("睡眠 7.5時間")).toBeInTheDocument();
    expect(screen.getByText("後半は集中が切れた")).toBeInTheDocument();
    expect(screen.queryByTestId("pro-upsell-scrim")).not.toBeInTheDocument();
  });

  it("無料ユーザーにはオーバーレイを重ねる", () => {
    setEntitlement(false);
    renderDetail({ session: withCondition });

    expect(screen.getByTestId("pro-upsell-scrim")).toBeInTheDocument();
  });

  it("Pro ユーザーで記録が無ければサンプルではなく未記録として案内する", () => {
    setEntitlement(true);
    renderDetail();

    expect(
      screen.getByText("この日のコンディションは記録されていません。"),
    ).toBeInTheDocument();
    expect(screen.queryByText("睡眠 7.5時間")).not.toBeInTheDocument();
  });

  it("無料ユーザーで記録が無ければサンプルであることを明示する", () => {
    setEntitlement(false);
    renderDetail();

    expect(
      screen.getByText("サンプルデータ（実際の記録ではありません）"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("pro-upsell-scrim")).toBeInTheDocument();
  });
});

describe("PracticeSessionDetail の紐づくノート", () => {
  it("紐づくノートを一覧表示する", () => {
    renderDetail({ notes: [note] });

    expect(screen.getByText("気づき")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /気づき/ })).toHaveAttribute(
      "href",
      "/note/100",
    );
  });

  it("0件は未作成メッセージを出す", () => {
    renderDetail({ notes: [] });

    expect(
      screen.getByText("この練習記録に紐づく野球ノートはありません。"),
    ).toBeInTheDocument();
  });

  it("取得失敗は0件と区別してエラーメッセージを出す", () => {
    renderDetail({ notes: null });

    expect(
      screen.getByText("紐づく野球ノートを読み込めませんでした。"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("この練習記録に紐づく野球ノートはありません。"),
    ).not.toBeInTheDocument();
  });
});

describe("PracticeSessionDetail の削除", () => {
  it("確認を挟まずには削除しない", async () => {
    const user = userEvent.setup();
    renderDetail();

    await user.click(screen.getByRole("button", { name: "削除する" }));

    expect(mockDelete).not.toHaveBeenCalled();
    expect(
      await screen.findByText("7月14日(火)の練習記録を削除しますか？"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "この日に記録した練習メニューのログもすべて削除されます。紐づく野球ノートとコンディションの記録は削除されず、練習記録との紐付けだけが外れます。",
      ),
    ).toBeInTheDocument();
  });

  it("確認して削除すると一覧へ戻る", async () => {
    const user = userEvent.setup();
    mockDelete.mockResolvedValue({
      ok: true,
      data: { message: "削除しました" },
    });
    renderDetail();

    await user.click(screen.getByRole("button", { name: "削除する" }));
    await user.click(await screen.findByRole("button", { name: "削除" }));

    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith(7));
    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith("/practice/records"),
    );
  });

  it("キャンセルすると削除しない", async () => {
    const user = userEvent.setup();
    renderDetail();

    await user.click(screen.getByRole("button", { name: "削除する" }));
    await user.click(await screen.findByRole("button", { name: "キャンセル" }));

    expect(mockDelete).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("削除に失敗したら一覧へ遷移しない", async () => {
    const user = userEvent.setup();
    mockDelete.mockResolvedValue({
      ok: false,
      reason: "error",
      errors: ["練習記録の削除に失敗しました"],
    });
    renderDetail();

    await user.click(screen.getByRole("button", { name: "削除する" }));
    await user.click(await screen.findByRole("button", { name: "削除" }));

    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith(7));
    expect(mockPush).not.toHaveBeenCalled();
  });
});
