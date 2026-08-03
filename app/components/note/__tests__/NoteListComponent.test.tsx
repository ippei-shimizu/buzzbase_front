import type { BaseballNoteV2 } from "@app/interface/baseballNoteV2";
import { render, screen } from "@testing-library/react";
import NoteListComponent from "../NoteListComponent";

const note: BaseballNoteV2 = {
  id: 1,
  title: "気づき",
  date: "2026-08-01",
  memo: '[{"type":"paragraph","children":[{"text":"外角が詰まる"}]}]',
  memo_preview: "外角が詰まる",
  game_result_ids: [],
  practice_log_id: null,
  practice_session_id: null,
  improvement_theme_ids: [],
  reflection_template_id: null,
  reflection_answers: [],
  tags: [],
  media_attachments: [],
};

describe("NoteListComponent", () => {
  it("ノートのタイトルと memo_preview を表示する", () => {
    render(<NoteListComponent result={{ status: "ok", data: [note] }} />);

    expect(screen.getByText("気づき")).toBeInTheDocument();
    expect(screen.getByText("外角が詰まる")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/note/1");
  });

  it("タイトル未設定のノートは代替表記にする", () => {
    render(
      <NoteListComponent
        result={{ status: "ok", data: [{ ...note, title: null }] }}
      />,
    );

    expect(screen.getByText("無題のノート")).toBeInTheDocument();
  });

  it("0件は未作成メッセージを表示する", () => {
    render(<NoteListComponent result={{ status: "ok", data: [] }} />);

    expect(
      screen.getByText("まだ野球ノートが作成されていません。"),
    ).toBeInTheDocument();
  });

  it("取得エラーは 0 件と区別してエラーメッセージを表示する", () => {
    render(<NoteListComponent result={{ status: "error" }} />);

    expect(
      screen.getByText("野球ノートの読み込みに失敗しました。"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("まだ野球ノートが作成されていません。"),
    ).not.toBeInTheDocument();
  });

  it("403 はエラーと区別して権限メッセージを表示する", () => {
    render(<NoteListComponent result={{ status: "forbidden" }} />);

    expect(
      screen.getByText("野球ノートを表示する権限がありません。"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("野球ノートの読み込みに失敗しました。"),
    ).not.toBeInTheDocument();
  });
});
