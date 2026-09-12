jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock("@app/services/v2/baseballNoteService", () => ({
  deleteBaseballNote: jest.fn(),
}));

jest.mock("@app/services/v2/mediaAttachmentService", () => ({
  presignMediaUpload: jest.fn(),
  completeMediaUpload: jest.fn(),
  updateMediaAttachmentMemo: jest.fn(),
  deleteMediaAttachment: jest.fn(),
}));

import type { BaseballNoteV2 } from "@app/interface/baseballNoteV2";
import type { FetchResult } from "@app/services/v2/requests";
import type { GameResultLinkOption } from "@app/types/gameResultLink";
import type { ImprovementTheme } from "@app/types/improvementTheme";
import type { PracticeSession } from "@app/types/practice";
import { render, screen } from "@testing-library/react";
import NoteDetail from "../NoteDetail";

const note: BaseballNoteV2 = {
  id: 12,
  title: "気づき",
  date: "2026-08-01",
  memo: '[{"type":"paragraph","children":[{"text":"外角が詰まる"}]}]',
  memo_preview: "外角が詰まる",
  game_result_ids: [101],
  practice_log_id: null,
  practice_session_id: null,
  improvement_theme_ids: [201],
  reflection_template_id: 3,
  reflection_answers: [{ question: "課題", answer: "引きつけ" }],
  tags: [{ id: 301, name: "打撃", is_preset: true }],
  media_attachments: [],
};

const themesResult: FetchResult<ImprovementTheme[]> = {
  status: "ok",
  data: [
    {
      id: 201,
      title: "外角対応",
      category: "batting",
      purpose: null,
      status: "open",
      started_on: "2026-07-01",
      achieved_on: null,
      sort_order: 1,
      practice_logs_count: 0,
      notes_count: 0,
      active_days: 0,
      created_at: "2026-07-01T00:00:00.000+09:00",
    },
  ],
};

const linkedGameResults: GameResultLinkOption[] = [
  { game_result_id: 101, date: "2026-07-30", opponent_team_name: "青葉高校" },
];

const practiceSession: PracticeSession = {
  id: 55,
  logged_on: "2026-08-01",
  memo: null,
  practice_type: "self_practice",
  improvement_theme_ids: [],
  practice_logs: [
    {
      id: 1,
      practice_menu_id: 1,
      schedule_id: null,
      logged_on: "2026-08-01",
      amount: 200,
      weight: null,
      menu_name: "素振り",
      unit_label: "本",
      source: "manual",
      memo: null,
      created_at: "2026-08-01T00:00:00Z",
    },
  ],
  condition: null,
  created_at: "2026-08-01T00:00:00Z",
};

function renderDetail(
  overrides: Partial<BaseballNoteV2> = {},
  session: PracticeSession | null = null,
) {
  return render(
    <NoteDetail
      note={{ ...note, ...overrides }}
      themesResult={themesResult}
      linkedGameResults={linkedGameResults}
      practiceSession={session}
      practiceMenus={[]}
    />,
  );
}

describe("NoteDetail", () => {
  describe("紐付けた練習", () => {
    it("紐付けが無ければセクションを出さない", () => {
      renderDetail();

      expect(screen.queryByText("紐付けた練習")).not.toBeInTheDocument();
    });

    it("紐付いた練習の日付とメニューを表示する", () => {
      renderDetail({}, practiceSession);

      expect(screen.getByText("紐付けた練習")).toBeVisible();
      expect(screen.getByText("8月1日(土)")).toBeVisible();
      expect(screen.getByText("素振り")).toBeVisible();
      expect(screen.getByText("200本")).toBeVisible();
    });

    it("メニューの記録が無ければその旨を出す", () => {
      renderDetail({}, { ...practiceSession, practice_logs: [] });

      expect(screen.getByText("メニューの記録はありません")).toBeVisible();
    });
  });

  it("日付・タイトル・メモを表示する", () => {
    renderDetail();

    expect(screen.getByText("2026年8月1日")).toBeVisible();
    expect(screen.getByRole("heading", { name: "気づき" })).toBeVisible();
    expect(screen.getByText("外角が詰まる")).toBeVisible();
  });

  it("振り返りの問いと回答を表示する", () => {
    renderDetail();

    expect(screen.getByText("課題")).toBeVisible();
    expect(screen.getByText("引きつけ")).toBeVisible();
  });

  it("回答が無ければ振り返りの見出しを出さない", () => {
    renderDetail({ reflection_answers: [] });

    expect(screen.queryByRole("heading", { name: "振り返り" })).toBeNull();
  });

  it("タグを # 付きで表示する", () => {
    renderDetail();

    expect(screen.getByText("#打撃")).toBeVisible();
  });

  it("紐付いた課題のタイトルを表示する", () => {
    renderDetail();

    expect(screen.getByText("外角対応")).toBeVisible();
  });

  it("紐付いた試合の表示名を表示する", () => {
    renderDetail();

    expect(screen.getByText("2026年7月30日 vs 青葉高校")).toBeVisible();
  });

  it("編集リンクとしてヘッダーに /note/:id/edit が置かれる", () => {
    renderDetail();

    expect(screen.getByRole("link", { name: "ノートを編集" })).toHaveAttribute(
      "href",
      "/note/12/edit",
    );
  });

  it("編集操作用のUIは表示しない（保存ボタン・タグ追加欄が無い）", () => {
    renderDetail();

    expect(screen.queryByRole("button", { name: "保存" })).toBeNull();
    expect(screen.queryByLabelText("新しいタグ")).toBeNull();
  });
});
