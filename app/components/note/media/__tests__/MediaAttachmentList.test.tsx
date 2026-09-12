jest.mock("@app/services/v2/mediaAttachmentService", () => ({
  deleteMediaAttachment: jest.fn(),
  updateMediaAttachmentMemo: jest.fn(),
}));

import type { NoteMediaAttachment } from "@app/interface/mediaAttachmentV2";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  deleteMediaAttachment,
  updateMediaAttachmentMemo,
} from "@app/services/v2/mediaAttachmentService";
import MediaAttachmentList from "../MediaAttachmentList";

const mockDelete = deleteMediaAttachment as jest.MockedFunction<
  typeof deleteMediaAttachment
>;
const mockUpdateMemo = updateMediaAttachmentMemo as jest.MockedFunction<
  typeof updateMediaAttachmentMemo
>;

function buildAttachment(
  overrides: Partial<NoteMediaAttachment> = {},
): NoteMediaAttachment {
  return {
    id: 1,
    media_type: "image",
    status: "ready",
    file_size_bytes: 1024,
    duration_seconds: null,
    width: 1080,
    height: 720,
    position: 0,
    memo: null,
    playback_url: "https://cdn.example.com/1.jpg",
    thumbnail_url: null,
    created_at: "2026-08-01T00:00:00Z",
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockDelete.mockResolvedValue({ ok: true, data: { message: "削除しました" } });
  mockUpdateMemo.mockResolvedValue({
    ok: true,
    data: buildAttachment({ memo: "始動が早い" }),
  });
});

describe("MediaAttachmentList", () => {
  it("添付が無ければ何も描画しない", () => {
    const { container } = render(
      <MediaAttachmentList attachments={[]} noteId={3} editable />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("メモ未記入なら記入を促し、記入済みなら内容を出す", () => {
    render(
      <MediaAttachmentList
        attachments={[
          buildAttachment({ id: 1 }),
          buildAttachment({ id: 2, media_type: "video", memo: "始動が早い" }),
        ]}
        noteId={3}
        editable
      />,
    );

    expect(screen.getByText("画像にメモを記入")).toBeInTheDocument();
    expect(screen.getByText("始動が早い")).toBeInTheDocument();
  });

  it("アップロード処理中の添付は開けない", () => {
    render(
      <MediaAttachmentList
        attachments={[buildAttachment({ status: "pending" })]}
        noteId={3}
        editable
      />,
    );

    expect(screen.getByText("処理中…")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "画像を開く" })).toBeDisabled();
  });

  it("失敗した添付は失敗と分かるように出す", () => {
    render(
      <MediaAttachmentList
        attachments={[buildAttachment({ status: "failed" })]}
        noteId={3}
        editable
      />,
    );

    expect(screen.getByText("アップロードに失敗しました")).toBeInTheDocument();
  });

  it("確認を経てから削除する", async () => {
    const onChanged = jest.fn();
    render(
      <MediaAttachmentList
        attachments={[buildAttachment()]}
        noteId={3}
        editable
        onChanged={onChanged}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "この添付を削除" }));
    expect(mockDelete).not.toHaveBeenCalled();
    expect(
      await screen.findByText("この添付を削除しますか？"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "削除する" }));

    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith(1, 3));
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
  });

  it("確認をキャンセルしたら削除しない", async () => {
    render(
      <MediaAttachmentList
        attachments={[buildAttachment()]}
        noteId={3}
        editable
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "この添付を削除" }));
    fireEvent.click(await screen.findByRole("button", { name: "キャンセル" }));

    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("削除に失敗したらエラーを出す", async () => {
    mockDelete.mockResolvedValue({
      ok: false,
      reason: "error",
      errors: ["削除に失敗しました"],
    });
    render(
      <MediaAttachmentList
        attachments={[buildAttachment()]}
        noteId={3}
        editable
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "この添付を削除" }));
    fireEvent.click(await screen.findByRole("button", { name: "削除する" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "削除に失敗しました",
    );
  });

  it("拡大表示からメモを保存する", async () => {
    const onChanged = jest.fn();
    render(
      <MediaAttachmentList
        attachments={[buildAttachment()]}
        noteId={3}
        editable
        onChanged={onChanged}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "画像を開く" }));
    const textarea = await screen.findByLabelText("メディアのメモ");
    fireEvent.change(textarea, { target: { value: "始動が早い" } });
    fireEvent.click(screen.getByRole("button", { name: "メモを保存" }));

    await waitFor(() =>
      expect(mockUpdateMemo).toHaveBeenCalledWith(1, { memo: "始動が早い" }, 3),
    );
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
  });

  it("閲覧専用では削除もメモ編集もできない", async () => {
    render(
      <MediaAttachmentList attachments={[buildAttachment()]} noteId={3} />,
    );

    expect(
      screen.queryByRole("button", { name: "この添付を削除" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "画像を開く" }));

    await waitFor(() =>
      expect(screen.queryByLabelText("メディアのメモ")).not.toBeInTheDocument(),
    );
  });
});
