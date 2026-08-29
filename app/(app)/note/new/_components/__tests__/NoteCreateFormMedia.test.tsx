const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@app/services/v2/baseballNoteService", () => ({
  createBaseballNote: jest.fn(),
  deleteBaseballNote: jest.fn(),
}));

jest.mock("@app/services/v2/noteTagService", () => ({
  createNoteTag: jest.fn(),
}));

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({ open: jest.fn(), close: jest.fn() }),
}));

jest.mock("@app/lib/analytics", () => ({
  trackEvent: jest.fn(),
}));

jest.mock("@app/hooks/pro/useEntitlement", () => ({
  useEntitlement: () => ({
    isPro: false,
    inTrial: false,
    inGracePeriod: false,
    isLoading: false,
    hasEntitlement: () => false,
  }),
}));

jest.mock("@app/utils/media/prepareMedia", () => ({
  prepareMediaFile: jest.fn(),
}));

jest.mock("@app/utils/media/uploadPipeline", () => ({
  uploadPreparedMedia: jest.fn(),
}));

const mockToastError = jest.fn();

jest.mock("sonner", () => ({
  toast: { error: (...args: unknown[]) => mockToastError(...args) },
}));

// 実エディタは Slate に依存するため、メモ入力だけを模した textarea に差し替える。
jest.mock("next/dynamic", () => () => {
  const react = jest.requireActual<typeof ReactModule>("react");
  return function MockNoteEditor({
    memo,
    setMemo,
  }: {
    memo: string;
    setMemo: (value: string) => void;
  }) {
    return react.createElement("textarea", {
      "aria-label": "メモ",
      defaultValue: memo,
      onChange: (event: { target: { value: string } }) =>
        setMemo(event.target.value),
    });
  };
});

import type { BaseballNoteV2 } from "@app/interface/baseballNoteV2";
import type { FetchResult } from "@app/services/v2/requests";
import type { PreparedMedia } from "@app/utils/media/uploadPipeline";
import type ReactModule from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NOTE_LIST_PATH } from "@app/constants/note";
import {
  createBaseballNote,
  deleteBaseballNote,
} from "@app/services/v2/baseballNoteService";
import { prepareMediaFile } from "@app/utils/media/prepareMedia";
import { uploadPreparedMedia } from "@app/utils/media/uploadPipeline";
import NoteCreateForm from "../NoteCreateForm";

const mockCreateNote = createBaseballNote as jest.MockedFunction<
  typeof createBaseballNote
>;
const mockDeleteNote = deleteBaseballNote as jest.MockedFunction<
  typeof deleteBaseballNote
>;
const mockPrepare = prepareMediaFile as jest.MockedFunction<
  typeof prepareMediaFile
>;
const mockUpload = uploadPreparedMedia as jest.MockedFunction<
  typeof uploadPreparedMedia
>;

const createdNote = { id: 42 } as BaseballNoteV2;

const prepared: PreparedMedia = {
  mediaType: "image",
  contentType: "image/jpeg",
  file: new Blob(["x"], { type: "image/jpeg" }),
  thumbnail: null,
  width: 1080,
  height: 720,
};

const attachment = {
  id: 1,
  media_type: "image" as const,
  status: "ready" as const,
  file_size_bytes: 1,
  duration_seconds: null,
  width: null,
  height: null,
  position: 0,
  memo: null,
  playback_url: null,
  thumbnail_url: null,
  created_at: "2026-08-01T00:00:00Z",
};

const emptyResult: FetchResult<never[]> = { status: "ok", data: [] };

function renderForm() {
  render(
    <NoteCreateForm
      templatesResult={emptyResult}
      tagsResult={emptyResult}
      themesResult={emptyResult}
    />,
  );
}

function typeTitle() {
  fireEvent.change(screen.getByLabelText("タイトル"), {
    target: { value: "本日の練習" },
  });
}

async function stageFile() {
  fireEvent.change(screen.getByLabelText("画像・動画を追加"), {
    target: { files: [new File(["x"], "swing.jpg", { type: "image/jpeg" })] },
  });
  await screen.findByText("保存後にアップロードします");
}

function save() {
  fireEvent.click(screen.getByRole("button", { name: "保存" }));
}

beforeEach(() => {
  jest.clearAllMocks();
  URL.createObjectURL = jest.fn(() => "blob:preview");
  URL.revokeObjectURL = jest.fn();
  mockCreateNote.mockResolvedValue({ ok: true, data: createdNote });
  mockDeleteNote.mockResolvedValue({ ok: true, data: null });
  mockPrepare.mockResolvedValue({ ok: true, prepared });
  mockUpload.mockResolvedValue({ ok: true, attachment });
});

describe("新規作成時の staged media", () => {
  it("選択しただけではアップロードせず、ノート保存が成功してからアップロードする", async () => {
    renderForm();
    typeTitle();
    await stageFile();

    expect(mockUpload).not.toHaveBeenCalled();

    save();

    await waitFor(() => expect(mockUpload).toHaveBeenCalledTimes(1));
    expect(mockCreateNote).toHaveBeenCalledTimes(1);
    expect(mockUpload).toHaveBeenCalledWith(
      expect.objectContaining({ contentType: "image/jpeg" }),
      42,
      expect.anything(),
    );
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(NOTE_LIST_PATH));
  });

  it("ノートの保存に失敗したらアップロードしない", async () => {
    mockCreateNote.mockResolvedValue({
      ok: false,
      errors: ["ノートの保存に失敗しました"],
    });
    renderForm();
    typeTitle();
    await stageFile();

    save();

    await waitFor(() => expect(mockCreateNote).toHaveBeenCalled());
    expect(mockUpload).not.toHaveBeenCalled();
    expect(mockDeleteNote).not.toHaveBeenCalled();
  });

  it("技術的失敗ではノートごとロールバックする", async () => {
    mockUpload.mockResolvedValue({
      ok: false,
      reason: "technical",
      message: "アップロードに失敗しました",
    });
    renderForm();
    typeTitle();
    await stageFile();

    save();

    await waitFor(() => expect(mockDeleteNote).toHaveBeenCalledWith(42));
    expect(mockPush).not.toHaveBeenCalled();
    expect(
      await screen.findByText(/ノートは保存されませんでした/),
    ).toBeInTheDocument();
  });

  it("ロールバックしても書いた本文は残す", async () => {
    mockUpload.mockResolvedValue({
      ok: false,
      reason: "technical",
      message: "アップロードに失敗しました",
    });
    renderForm();
    typeTitle();
    await stageFile();

    save();

    await waitFor(() => expect(mockDeleteNote).toHaveBeenCalled());
    expect(screen.getByLabelText("タイトル")).toHaveValue("本日の練習");
  });

  it("ロールバックの削除自体が失敗したら、重複送信を防ぐため一覧へ逃がす", async () => {
    mockUpload.mockResolvedValue({
      ok: false,
      reason: "technical",
      message: "アップロードに失敗しました",
    });
    mockDeleteNote.mockResolvedValue({
      ok: false,
      errors: ["ノートの削除に失敗しました"],
    });
    renderForm();
    typeTitle();
    await stageFile();

    save();

    await waitFor(() => expect(mockDeleteNote).toHaveBeenCalledWith(42));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(NOTE_LIST_PATH));
    expect(mockToastError).toHaveBeenCalledWith(
      "メディアの保存に失敗し、ノートの削除にも失敗しました。ノートが残っている場合があるため、一覧をご確認のうえ必要であれば削除してください。",
    );
  });

  it("ユーザーが中断した場合はロールバックしない", async () => {
    mockUpload.mockResolvedValue({ ok: false, reason: "canceled" });
    renderForm();
    typeTitle();
    await stageFile();

    save();

    await waitFor(() => expect(mockUpload).toHaveBeenCalled());
    expect(mockDeleteNote).not.toHaveBeenCalled();
    expect(await screen.findByText(/ノートは保存済みです/)).toBeInTheDocument();
  });

  it("サーバーが内容を理由に拒否した場合もロールバックしない", async () => {
    mockUpload.mockResolvedValue({
      ok: false,
      reason: "rejected",
      message: "アップロード可能な上限を超えています",
    });
    renderForm();
    typeTitle();
    await stageFile();

    save();

    await waitFor(() => expect(mockUpload).toHaveBeenCalled());
    expect(mockDeleteNote).not.toHaveBeenCalled();
  });

  it("月次上限の 403 ではロールバックせず、無料枠超過として案内する", async () => {
    mockUpload.mockResolvedValue({
      ok: false,
      reason: "limit_reached",
      message: "今月のアップロード上限に達しています",
    });
    renderForm();
    typeTitle();
    await stageFile();

    save();

    await waitFor(() => expect(mockUpload).toHaveBeenCalled());
    expect(mockDeleteNote).not.toHaveBeenCalled();
    expect(
      await screen.findByText(
        "無料プランでアップロードできる画像・動画は月3件までです",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Pro 限定/)).not.toBeInTheDocument();
  });

  it("添付が無ければアップロード処理を挟まずに一覧へ戻る", async () => {
    renderForm();
    typeTitle();

    save();

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(NOTE_LIST_PATH));
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it("ステージしたメディアは保存前に取り消せる", async () => {
    renderForm();
    typeTitle();
    await stageFile();

    fireEvent.click(
      screen.getByRole("button", { name: "選択した画像・動画を取り消す" }),
    );

    await waitFor(() =>
      expect(
        screen.queryByText("保存後にアップロードします"),
      ).not.toBeInTheDocument(),
    );

    save();

    await waitFor(() => expect(mockCreateNote).toHaveBeenCalled());
    expect(mockUpload).not.toHaveBeenCalled();
  });
});
