import type { BaseballNoteV2 } from "@app/interface/baseballNoteV2";
import type {
  PracticeLog,
  PracticeMenu,
  PracticeSession,
} from "@app/types/practice";
import { fireEvent, render, screen, within } from "@testing-library/react";
import PracticeRecordsSection from "../_components/PracticeRecordsSection";

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
    id: 1,
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
  practice_session_id: 1,
  improvement_theme_ids: [],
  reflection_template_id: null,
  reflection_answers: [],
  tags: [],
  media_attachments: [],
};

// back は logged_on の新しい順で返すため、テストデータもその順で用意する。
const sessions: PracticeSession[] = [
  buildSession({
    id: 1,
    logged_on: "2026-08-20",
    practice_logs: [buildLog({ id: 11, menu_name: "素振り", amount: "300.0" })],
  }),
  buildSession({
    id: 2,
    logged_on: "2026-08-05",
    memo: "全体的に振り遅れ気味",
    practice_logs: [
      buildLog({
        id: 12,
        menu_name: "ベンチプレス",
        amount: "10.0",
        weight: "60.0",
        unit_label: "回",
      }),
    ],
  }),
  buildSession({
    id: 3,
    logged_on: "2026-07-14",
    practice_logs: [
      buildLog({ id: 13, menu_name: "ロングティー", amount: "150.0" }),
    ],
  }),
];

function renderSection(
  overrides: Partial<React.ComponentProps<typeof PracticeRecordsSection>> = {},
) {
  return render(
    <PracticeRecordsSection
      sessionsResult={{ status: "ok", data: sessions }}
      menusResult={{ status: "ok", data: [menu] }}
      notesResult={{ status: "ok", data: [] }}
      {...overrides}
    />,
  );
}

describe("PracticeRecordsSection の導線", () => {
  it("メニュー管理・練習の記録・積み上げの導線を出す", () => {
    renderSection();

    expect(
      screen.getByRole("link", { name: "練習メニューを管理" }),
    ).toHaveAttribute("href", "/practice/menus");
    expect(screen.getByRole("link", { name: "練習を記録" })).toHaveAttribute(
      "href",
      "/practice/record",
    );
    expect(
      screen.getByRole("link", { name: "メニュー別の積み上げを見る" }),
    ).toHaveAttribute("href", "/practice/summary");
  });
});

describe("PracticeRecordsSection の月ページング", () => {
  it("未絞り込みでは最新の月だけを件数付きで表示する", () => {
    renderSection();

    expect(screen.getByText("2026年8月（2件）")).toBeInTheDocument();
    expect(screen.getByText("素振り")).toBeInTheDocument();
    expect(screen.getByText("ベンチプレス")).toBeInTheDocument();
    expect(screen.queryByText("ロングティー")).not.toBeInTheDocument();
  });

  it("前の月・次の月に移動できる", () => {
    renderSection();

    fireEvent.click(screen.getByRole("button", { name: "前の月" }));

    expect(screen.getByText("2026年7月（1件）")).toBeInTheDocument();
    expect(screen.getByText("ロングティー")).toBeInTheDocument();
    expect(screen.queryByText("素振り")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "次の月" }));

    expect(screen.getByText("2026年8月（2件）")).toBeInTheDocument();
  });

  it("両端では月送りを止める", () => {
    renderSection();

    expect(screen.getByRole("button", { name: "次の月" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "前の月" }));

    expect(screen.getByRole("button", { name: "前の月" })).toBeDisabled();
  });

  it("練習日と曜日を一覧の左側に出す", () => {
    renderSection();

    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getAllByText("木").length).toBeGreaterThan(0);
  });

  it("メニューの量を formatPracticeValue の表記で出す", () => {
    renderSection();

    expect(screen.getByText("300本")).toBeInTheDocument();
    expect(screen.getByText("60kg × 10回")).toBeInTheDocument();
  });

  it("ノートが紐付く記録にはバッジを出す", () => {
    renderSection({ notesResult: { status: "ok", data: [note] } });

    // ノートが紐付くのは 7月の記録なので、その月まで送ってから確認する。
    fireEvent.click(screen.getByRole("button", { name: "前の月" }));
    expect(screen.queryByText("ノート")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "次の月" }));
    expect(screen.getByText("ノート")).toBeInTheDocument();
  });

  it("詳細画面へのリンクを張る", () => {
    renderSection();

    expect(
      screen.getAllByRole("link").map((link) => link.getAttribute("href")),
    ).toEqual(
      expect.arrayContaining(["/practice/records/1", "/practice/records/2"]),
    );
  });
});

describe("PracticeRecordsSection の絞り込み", () => {
  it("絞り込み中は月ページングをやめ、全期間を月見出し付きで表示する", () => {
    renderSection();

    fireEvent.change(screen.getByLabelText("練習記録を検索"), {
      target: { value: "ティー" },
    });

    expect(
      screen.queryByRole("button", { name: "前の月" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("ロングティー")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("練習記録を検索"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("開始日"), {
      target: { value: "2026-07-01" },
    });

    // 8月・7月の両方が残る条件では、月見出しを挟んで全期間が並ぶ。
    expect(
      screen.getByRole("heading", { name: "2026年8月" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "2026年7月" }),
    ).toBeInTheDocument();
    expect(screen.getByText("素振り")).toBeInTheDocument();
    expect(screen.getByText("ロングティー")).toBeInTheDocument();
  });

  it("日付レンジは開始日・終了日を含めて絞り込む", () => {
    renderSection();

    fireEvent.change(screen.getByLabelText("開始日"), {
      target: { value: "2026-08-05" },
    });
    fireEvent.change(screen.getByLabelText("終了日"), {
      target: { value: "2026-08-05" },
    });

    expect(screen.getByText("ベンチプレス")).toBeInTheDocument();
    expect(screen.queryByText("素振り")).not.toBeInTheDocument();
    expect(screen.queryByText("ロングティー")).not.toBeInTheDocument();
  });

  it("セッションメモも検索対象にする", () => {
    renderSection();

    fireEvent.change(screen.getByLabelText("練習記録を検索"), {
      target: { value: "振り遅れ" },
    });

    expect(screen.getByText("ベンチプレス")).toBeInTheDocument();
    expect(screen.queryByText("ロングティー")).not.toBeInTheDocument();
  });

  it("絞り込みを解除すると最新の月へ戻る", () => {
    renderSection();

    fireEvent.click(screen.getByRole("button", { name: "前の月" }));
    expect(screen.getByText("2026年7月（1件）")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("練習記録を検索"), {
      target: { value: "素振り" },
    });
    fireEvent.click(screen.getByRole("button", { name: "クリア" }));

    expect(screen.getByText("2026年8月（2件）")).toBeInTheDocument();
    expect(screen.getByText("素振り")).toBeInTheDocument();
  });

  it("検索語を消して絞り込みを外したときも最新の月へ戻る", () => {
    renderSection();

    fireEvent.click(screen.getByRole("button", { name: "前の月" }));
    expect(screen.getByText("2026年7月（1件）")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("練習記録を検索"), {
      target: { value: "素振り" },
    });
    fireEvent.change(screen.getByLabelText("練習記録を検索"), {
      target: { value: "" },
    });

    expect(screen.getByText("2026年8月（2件）")).toBeInTheDocument();
  });

  it("条件に一致しない場合は未記録と区別したメッセージを出す", () => {
    renderSection();

    fireEvent.change(screen.getByLabelText("練習記録を検索"), {
      target: { value: "存在しない語" },
    });

    expect(
      screen.getByText("条件に一致する練習記録がありません。"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("まだ練習記録がありません。"),
    ).not.toBeInTheDocument();
  });
});

describe("PracticeRecordsSection の空状態とエラー", () => {
  it("0件は未記録メッセージを出す", () => {
    renderSection({ sessionsResult: { status: "ok", data: [] } });

    expect(screen.getByText("まだ練習記録がありません。")).toBeInTheDocument();
    expect(screen.getByLabelText("練習記録を検索")).toBeInTheDocument();
  });

  it("取得失敗は0件と区別してエラーメッセージを出す", () => {
    renderSection({ sessionsResult: { status: "error" } });

    expect(
      screen.getByText(
        "練習記録を読み込めませんでした。時間を置いて再度お試しください。",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("まだ練習記録がありません。"),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText("練習記録を検索")).not.toBeInTheDocument();
  });

  it("403 は取得失敗と区別して権限メッセージを出す", () => {
    renderSection({ sessionsResult: { status: "forbidden" } });

    expect(
      screen.getByText("練習記録を表示する権限がありません。"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "練習記録を読み込めませんでした。時間を置いて再度お試しください。",
      ),
    ).not.toBeInTheDocument();
  });

  it("メニュー取得に失敗しても一覧自体は表示する", () => {
    renderSection({ menusResult: { status: "error" } });

    expect(screen.getByText("素振り")).toBeInTheDocument();
  });

  it("ノート取得に失敗してもバッジだけ落として一覧を表示する", () => {
    renderSection({ notesResult: { status: "error" } });

    const list = screen.getByText("素振り");
    expect(list).toBeInTheDocument();
    expect(within(document.body).queryByText("ノート")).not.toBeInTheDocument();
  });
});
