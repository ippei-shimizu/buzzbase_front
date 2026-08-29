const mockHasEntitlement = jest.fn();
const mockIsLoading = jest.fn(() => false);

jest.mock("@app/hooks/pro/useEntitlement", () => ({
  useEntitlement: () => ({
    isPro: mockHasEntitlement("note_tags"),
    inTrial: false,
    inGracePeriod: false,
    isLoading: mockIsLoading(),
    hasEntitlement: mockHasEntitlement,
  }),
}));

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({
    open: jest.fn(),
    close: jest.fn(),
  }),
}));

jest.mock("@app/services/v2/noteTagService", () => ({
  createNoteTag: jest.fn(),
}));

import type { NoteTag } from "@app/interface/baseballNoteV2";
import type { FetchResult } from "@app/services/v2/requests";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createNoteTag } from "@app/services/v2/noteTagService";
import NoteTagSection from "../NoteTagSection";

const mockCreateNoteTag = createNoteTag as jest.MockedFunction<
  typeof createNoteTag
>;

const tags: NoteTag[] = [
  { id: 1, name: "打撃", is_preset: true },
  { id: 2, name: "メンタル", is_preset: false },
];

function renderSection({
  canEdit = true,
  selectedIds = [] as number[],
  onChange = jest.fn(),
  tagsResult = { status: "ok", data: tags } as FetchResult<NoteTag[]>,
} = {}) {
  render(
    <NoteTagSection
      tagsResult={tagsResult}
      selectedIds={selectedIds}
      onChange={onChange}
      canEdit={canEdit}
    />,
  );
  return { onChange };
}

describe("NoteTagSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasEntitlement.mockReturnValue(true);
    mockIsLoading.mockReturnValue(false);
  });

  it("タグ名は # 付きで表示する", () => {
    renderSection();

    expect(screen.getByRole("button", { name: "#打撃" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "#メンタル" }),
    ).toBeInTheDocument();
  });

  it("未選択のチップを押すと選択に加わる", () => {
    const { onChange } = renderSection({ selectedIds: [] });

    fireEvent.click(screen.getByRole("button", { name: "#打撃" }));

    expect(onChange).toHaveBeenCalledWith([1]);
  });

  it("選択中のチップを押すと選択から外れる", () => {
    const { onChange } = renderSection({ selectedIds: [1, 2] });

    fireEvent.click(screen.getByRole("button", { name: "#打撃" }));

    expect(onChange).toHaveBeenCalledWith([2]);
  });

  it("選択中のチップは aria-pressed で分かる", () => {
    renderSection({ selectedIds: [2] });

    expect(screen.getByRole("button", { name: "#打撃" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "#メンタル" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("その場で作成したタグは保存名に # を含めず、選択に加わる", async () => {
    mockCreateNoteTag.mockResolvedValue({
      ok: true,
      data: { id: 7, name: "走塁", is_preset: false },
    });
    const { onChange } = renderSection({ selectedIds: [1] });

    fireEvent.change(screen.getByLabelText("新しいタグ"), {
      target: { value: "#走塁" },
    });
    fireEvent.click(screen.getByRole("button", { name: "追加" }));

    await waitFor(() =>
      expect(mockCreateNoteTag).toHaveBeenCalledWith({ name: "走塁" }),
    );
    expect(onChange).toHaveBeenCalledWith([1, 7]);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "#走塁" })).toBeInTheDocument(),
    );
    expect(screen.getByLabelText("新しいタグ")).toHaveValue("");
  });

  it("作成に失敗しても入力は消えない", async () => {
    mockCreateNoteTag.mockResolvedValue({
      ok: false,
      reason: "error",
      errors: ["名前はすでに存在します"],
    });
    renderSection();

    fireEvent.change(screen.getByLabelText("新しいタグ"), {
      target: { value: "走塁" },
    });
    fireEvent.click(screen.getByRole("button", { name: "追加" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "名前はすでに存在します",
      ),
    );
    expect(screen.getByLabelText("新しいタグ")).toHaveValue("走塁");
  });

  it("既にあるタグ名は作成せず選択に加えるだけ", async () => {
    const { onChange } = renderSection({ selectedIds: [] });

    fireEvent.change(screen.getByLabelText("新しいタグ"), {
      target: { value: "打撃" },
    });
    fireEvent.click(screen.getByRole("button", { name: "追加" }));

    await waitFor(() => expect(onChange).toHaveBeenCalledWith([1]));
    expect(mockCreateNoteTag).not.toHaveBeenCalled();
  });

  it("canEdit が false のときはチップを押しても選択が変わらない", () => {
    const { onChange } = renderSection({ canEdit: false });

    fireEvent.click(screen.getByRole("button", { name: "#打撃" }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("canEdit が false のときは新規作成も走らない", async () => {
    renderSection({ canEdit: false });

    fireEvent.change(screen.getByLabelText("新しいタグ"), {
      target: { value: "走塁" },
    });
    fireEvent.click(screen.getByRole("button", { name: "追加" }));

    await waitFor(() => expect(mockCreateNoteTag).not.toHaveBeenCalled());
  });

  it("note_tags を持たない無料ユーザーには Pro 訴求の暗幕を出す", () => {
    mockHasEntitlement.mockReturnValue(false);
    renderSection({ canEdit: false });

    expect(screen.getByTestId("pro-upsell-scrim")).toBeInTheDocument();
  });

  it("note_tags を持つ Pro ユーザーには暗幕を出さない", () => {
    mockHasEntitlement.mockReturnValue(true);
    renderSection({ canEdit: true });

    expect(screen.queryByTestId("pro-upsell-scrim")).not.toBeInTheDocument();
  });

  it("タグの取得に失敗したときは 0 件と区別してメッセージを出す", () => {
    renderSection({ tagsResult: { status: "error" } });

    expect(
      screen.getByText(
        "タグを取得できませんでした。メモはそのまま入力できます。",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("新しいタグ")).not.toBeInTheDocument();
  });

  it("タグが 0 件のときは作成を促す", () => {
    renderSection({ tagsResult: { status: "ok", data: [] } });

    expect(
      screen.getByText("タグがまだありません。下の入力欄から作成できます。"),
    ).toBeInTheDocument();
  });
});
