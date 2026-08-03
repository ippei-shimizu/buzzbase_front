import type { BaseballNoteV2, NoteTag } from "@app/interface/baseballNoteV2";
import type { FetchResult } from "@app/services/v2/requests";
import { fireEvent, render, screen } from "@testing-library/react";
import { buildMemoJson } from "@app/utils/noteMemo";
import NoteListComponent from "../NoteListComponent";

const battingTag: NoteTag = { id: 1, name: "打撃", is_preset: true };
const mentalTag: NoteTag = { id: 2, name: "メンタル", is_preset: false };

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

const noTags: FetchResult<NoteTag[]> = { status: "ok", data: [] };

function renderList(
  notes: BaseballNoteV2[],
  tagsResult: FetchResult<NoteTag[]> = noTags,
) {
  return render(
    <NoteListComponent
      result={{ status: "ok", data: notes }}
      tagsResult={tagsResult}
    />,
  );
}

describe("NoteListComponent", () => {
  it("ノートのタイトルと memo_preview を表示する", () => {
    renderList([note]);

    expect(screen.getByText("気づき")).toBeInTheDocument();
    expect(screen.getByText("外角が詰まる")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/note/1");
  });

  it("タイトル未設定のノートは代替表記にする", () => {
    renderList([{ ...note, title: null }]);

    expect(screen.getByText("無題のノート")).toBeInTheDocument();
  });

  it("0件は未作成メッセージを表示する", () => {
    renderList([]);

    expect(
      screen.getByText("まだ野球ノートが作成されていません。"),
    ).toBeInTheDocument();
  });

  it("取得エラーは 0 件と区別してエラーメッセージを表示する", () => {
    render(
      <NoteListComponent result={{ status: "error" }} tagsResult={noTags} />,
    );

    expect(
      screen.getByText("野球ノートの読み込みに失敗しました。"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("まだ野球ノートが作成されていません。"),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText("ノートを検索")).not.toBeInTheDocument();
  });

  it("403 はエラーと区別して権限メッセージを表示する", () => {
    render(
      <NoteListComponent
        result={{ status: "forbidden" }}
        tagsResult={noTags}
      />,
    );

    expect(
      screen.getByText("野球ノートを表示する権限がありません。"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("野球ノートの読み込みに失敗しました。"),
    ).not.toBeInTheDocument();
  });

  it("タグと紐付けをチップで表示する（タグは # 付き）", () => {
    renderList([
      {
        ...note,
        tags: [battingTag],
        game_result_ids: [10, 11],
        improvement_theme_ids: [3],
        practice_session_id: 5,
      },
    ]);

    expect(screen.getByText("#打撃")).toBeInTheDocument();
    expect(screen.getByText("試合 2件")).toBeInTheDocument();
    expect(screen.getByText("課題 1件")).toBeInTheDocument();
    expect(screen.getByText("練習記録")).toBeInTheDocument();
  });
});

describe("NoteListComponent の検索・絞り込み・月次ページング", () => {
  const notes: BaseballNoteV2[] = [
    {
      ...note,
      id: 1,
      title: "打撃の気づき",
      date: "2026-08-20",
      memo: buildMemoJson("体の開きが早い"),
      memo_preview: "体の開きが早い",
      tags: [battingTag],
    },
    {
      ...note,
      id: 2,
      title: "守備の気づき",
      date: "2026-08-05",
      memo: buildMemoJson("一歩目が遅い"),
      memo_preview: "一歩目が遅い",
      tags: [mentalTag],
    },
    {
      ...note,
      id: 3,
      title: "7月のノート",
      date: "2026-07-10",
      memo: buildMemoJson("打撃練習"),
      memo_preview: "打撃練習",
      tags: [],
    },
  ];

  const tagsResult: FetchResult<NoteTag[]> = {
    status: "ok",
    data: [battingTag, mentalTag],
  };

  it("最新の月のノートだけを表示する", () => {
    renderList(notes, tagsResult);

    expect(screen.getByText("打撃の気づき")).toBeInTheDocument();
    expect(screen.getByText("守備の気づき")).toBeInTheDocument();
    expect(screen.queryByText("7月のノート")).not.toBeInTheDocument();
    expect(screen.getByText("2026年8月（2件）")).toBeInTheDocument();
  });

  it("前の月へページ送りできる", () => {
    renderList(notes, tagsResult);

    fireEvent.click(screen.getByRole("button", { name: "前の月" }));

    expect(screen.getByText("2026年7月（1件）")).toBeInTheDocument();
    expect(screen.getByText("7月のノート")).toBeInTheDocument();
    expect(screen.queryByText("打撃の気づき")).not.toBeInTheDocument();
  });

  it("キーワードでタイトル・本文を横断して絞り込む", () => {
    renderList(notes, tagsResult);

    fireEvent.change(screen.getByLabelText("ノートを検索"), {
      target: { value: "一歩目" },
    });

    expect(screen.getByText("守備の気づき")).toBeInTheDocument();
    expect(screen.queryByText("打撃の気づき")).not.toBeInTheDocument();
  });

  it("日付レンジで絞り込む（開始日・終了日を含む）", () => {
    renderList(notes, tagsResult);

    fireEvent.change(screen.getByLabelText("開始日"), {
      target: { value: "2026-08-05" },
    });
    fireEvent.change(screen.getByLabelText("終了日"), {
      target: { value: "2026-08-05" },
    });

    expect(screen.getByText("守備の気づき")).toBeInTheDocument();
    expect(screen.queryByText("打撃の気づき")).not.toBeInTheDocument();
    expect(screen.getByText("2026年8月（1件）")).toBeInTheDocument();
  });

  it("タグチップで絞り込む", () => {
    renderList(notes, tagsResult);

    fireEvent.click(screen.getByRole("button", { name: "#打撃" }));

    expect(screen.getByText("打撃の気づき")).toBeInTheDocument();
    expect(screen.queryByText("守備の気づき")).not.toBeInTheDocument();
  });

  it("絞り込みを変えると、絞り込み後にも複数の月が残る場合でもページが最新へ戻る", () => {
    renderList(notes, tagsResult);
    fireEvent.click(screen.getByRole("button", { name: "前の月" }));
    expect(screen.getByText("2026年7月（1件）")).toBeInTheDocument();

    // 絞り込み後も 8月・7月の2ヶ月が残る語を選び、古いページに留まらないことを見る。
    fireEvent.change(screen.getByLabelText("ノートを検索"), {
      target: { value: "打撃" },
    });

    expect(screen.getByText("2026年8月（1件）")).toBeInTheDocument();
    expect(screen.getByText("打撃の気づき")).toBeInTheDocument();
    expect(screen.queryByText("7月のノート")).not.toBeInTheDocument();
  });

  it("条件に一致しない場合は未作成と区別したメッセージを出す", () => {
    renderList(notes, tagsResult);

    fireEvent.change(screen.getByLabelText("ノートを検索"), {
      target: { value: "存在しない語" },
    });

    expect(
      screen.getByText("条件に一致するノートがありません。"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("まだ野球ノートが作成されていません。"),
    ).not.toBeInTheDocument();
  });

  it("タグの取得に失敗した場合はタグチップを出さない", () => {
    renderList(notes, { status: "error" });

    expect(
      screen.queryByRole("button", { name: "#打撃" }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("ノートを検索")).toBeInTheDocument();
  });
});
