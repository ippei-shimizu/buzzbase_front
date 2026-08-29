const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("sonner", () => ({
  toast: { error: jest.fn(), success: jest.fn(), info: jest.fn() },
}));

jest.mock("@app/services/v2/improvementThemeService", () => ({
  updateImprovementTheme: jest.fn(),
  deleteImprovementTheme: jest.fn(),
}));

import type { BaseballNoteV2 } from "@app/interface/baseballNoteV2";
import type { ImprovementTheme } from "@app/types/improvementTheme";
import type { PracticeSession } from "@app/types/practice";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  deleteImprovementTheme,
  updateImprovementTheme,
} from "@app/services/v2/improvementThemeService";
import ThemeDetailContent from "../ThemeDetailContent";

const mockUpdate = updateImprovementTheme as jest.MockedFunction<
  typeof updateImprovementTheme
>;
const mockDelete = deleteImprovementTheme as jest.MockedFunction<
  typeof deleteImprovementTheme
>;

function buildTheme(
  overrides: Partial<ImprovementTheme> = {},
): ImprovementTheme {
  return {
    id: 5,
    title: "肩の開きを抑える",
    category: "batting",
    purpose: "外角に対して体が早く開かないようにする",
    status: "open",
    started_on: "2026-07-01",
    achieved_on: null,
    sort_order: 0,
    practice_logs_count: 30,
    notes_count: 4,
    active_days: 12,
    created_at: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

const session = {
  id: 71,
  logged_on: "2026-07-20",
  memo: null,
  improvement_theme_ids: [5],
  practice_logs: [
    {
      id: 1,
      practice_menu_id: 2,
      schedule_id: null,
      logged_on: "2026-07-20",
      amount: "200.0",
      weight: null,
      menu_name: "素振り",
      unit_label: "本",
      source: "manual",
      memo: null,
      created_at: "2026-07-20T00:00:00.000Z",
    },
  ],
  condition: null,
  created_at: "2026-07-20T00:00:00.000Z",
} as PracticeSession;

const note = {
  id: 12,
  title: "気づき",
  date: "2026-07-21",
  memo: null,
  memo_preview: "外角が詰まる",
  game_result_ids: [],
  practice_log_id: null,
  practice_session_id: null,
  improvement_theme_ids: [5],
  reflection_template_id: null,
  reflection_answers: [],
  tags: [],
  media_attachments: [],
} as BaseballNoteV2;

function renderDetail(
  props: Partial<React.ComponentProps<typeof ThemeDetailContent>> = {},
) {
  return render(
    <ThemeDetailContent
      theme={buildTheme()}
      sessions={[]}
      sessionsLoadFailed={false}
      notes={[]}
      notesLoadFailed={false}
      today="2026-08-03"
      {...props}
    />,
  );
}

describe("課題の詳細", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("back が集計した統計をそのまま表示する", () => {
    renderDetail({
      theme: buildTheme({
        active_days: 12,
        practice_logs_count: 30,
        notes_count: 4,
      }),
      // 紐づく記録の件数から数え直していないことを、統計と食い違う一覧で確かめる。
      sessions: [session],
      notes: [note],
    });

    expect(screen.getByText("12日")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("紐づく練習記録とノートを一覧する", () => {
    renderDetail({ sessions: [session], notes: [note] });

    expect(screen.getByText("2026年7月20日")).toBeInTheDocument();
    expect(screen.getByText("素振り")).toBeInTheDocument();
    expect(screen.getByText("2026年7月21日")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /気づき/ })).toHaveAttribute(
      "href",
      "/note/12",
    );
  });

  it("紐づく記録が0件のときは0件として表示する", () => {
    renderDetail();

    expect(screen.getAllByText("まだありません")).toHaveLength(2);
  });

  it("紐づく記録の取得失敗は0件と区別して表示する", () => {
    renderDetail({ sessionsLoadFailed: true, notesLoadFailed: true });

    expect(
      screen.getByText("紐づく練習記録を取得できませんでした。"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("紐づくノートを取得できませんでした。"),
    ).toBeInTheDocument();
    expect(screen.queryByText("まだありません")).not.toBeInTheDocument();
  });

  it("取組中では克服とアーカイブだけを操作できる", () => {
    renderDetail({ theme: buildTheme({ status: "open" }) });

    expect(
      screen.getByRole("button", { name: "克服した（達成）" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "アーカイブ" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "取組中に戻す" }),
    ).not.toBeInTheDocument();
  });

  it("克服すると status:achieved と達成日を送る", async () => {
    const user = userEvent.setup();
    mockUpdate.mockResolvedValue({
      ok: true,
      data: buildTheme({ status: "achieved", achieved_on: "2026-08-03" }),
    });
    renderDetail();

    await user.click(screen.getByRole("button", { name: "克服した（達成）" }));

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
    expect(mockUpdate).toHaveBeenCalledWith(5, {
      status: "achieved",
      achieved_on: "2026-08-03",
    });
    expect(
      await screen.findByRole("button", { name: "取組中に戻す" }),
    ).toBeInTheDocument();
  });

  it("克服済みを再開すると status:open と達成日の消去を送る", async () => {
    const user = userEvent.setup();
    mockUpdate.mockResolvedValue({
      ok: true,
      data: buildTheme({ status: "open" }),
    });
    renderDetail({
      theme: buildTheme({ status: "achieved", achieved_on: "2026-08-01" }),
    });

    await user.click(screen.getByRole("button", { name: "取組中に戻す" }));

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
    expect(mockUpdate).toHaveBeenCalledWith(5, {
      status: "open",
      achieved_on: null,
    });
  });

  it("アーカイブすると status:archived を送り、アーカイブ操作は消える", async () => {
    const user = userEvent.setup();
    mockUpdate.mockResolvedValue({
      ok: true,
      data: buildTheme({ status: "archived" }),
    });
    renderDetail();

    await user.click(screen.getByRole("button", { name: "アーカイブ" }));

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
    expect(mockUpdate).toHaveBeenCalledWith(5, { status: "archived" });
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "アーカイブ" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("アーカイブ済みは再開だけを操作できる", () => {
    renderDetail({ theme: buildTheme({ status: "archived" }) });

    expect(
      screen.getByRole("button", { name: "取組中に戻す" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "アーカイブ" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "克服した（達成）" }),
    ).not.toBeInTheDocument();
  });

  it("編集するとタイトルと目的を更新する", async () => {
    const user = userEvent.setup();
    mockUpdate.mockResolvedValue({
      ok: true,
      data: buildTheme({ title: "体重移動" }),
    });
    renderDetail();

    await user.click(screen.getByRole("button", { name: "編集" }));
    const titleInput = screen.getByLabelText(/いま取り組む課題/);
    await user.clear(titleInput);
    await user.type(titleInput, "体重移動");
    await user.click(screen.getByRole("button", { name: "更新" }));

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
    expect(mockUpdate.mock.calls[0][1]).toEqual({
      title: "体重移動",
      category: "batting",
      purpose: "外角に対して体が早く開かないようにする",
    });
    expect(await screen.findByText("体重移動")).toBeInTheDocument();
  });

  it("削除すると一覧へ戻る", async () => {
    const user = userEvent.setup();
    mockDelete.mockResolvedValue({
      ok: true,
      data: { message: "削除しました" },
    });
    renderDetail();

    await user.click(screen.getByRole("button", { name: "削除" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "削除" }));

    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith(5));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/themes"));
  });

  it("この課題でノートを書く導線に課題 ID を載せる", () => {
    renderDetail();

    // HeroUI の Button は as={Link} でも role="button" を付けるため、href で導線を確かめる。
    expect(
      screen.getByRole("button", { name: "この課題でノートを書く" }),
    ).toHaveAttribute("href", "/note/new?improvement_theme_id=5");
  });
});
