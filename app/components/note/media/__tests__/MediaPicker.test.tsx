jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({ open: jest.fn(), close: jest.fn() }),
}));

jest.mock("@app/lib/analytics", () => ({
  trackEvent: jest.fn(),
}));

const mockHasEntitlement = jest.fn(() => false);

jest.mock("@app/hooks/pro/useEntitlement", () => ({
  useEntitlement: () => ({
    isPro: false,
    inTrial: false,
    inGracePeriod: false,
    isLoading: false,
    hasEntitlement: mockHasEntitlement,
  }),
}));

jest.mock("@app/utils/media/prepareMedia", () => ({
  prepareMediaFile: jest.fn(),
}));

jest.mock("@app/utils/media/uploadPipeline", () => ({
  uploadPreparedMedia: jest.fn(),
}));

import type { StagedMediaAsset } from "@app/interface/mediaAttachmentV2";
import type { PreparedMedia } from "@app/utils/media/uploadPipeline";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { prepareMediaFile } from "@app/utils/media/prepareMedia";
import { uploadPreparedMedia } from "@app/utils/media/uploadPipeline";
import MediaPicker from "../MediaPicker";

const mockPrepare = prepareMediaFile as jest.MockedFunction<
  typeof prepareMediaFile
>;
const mockUpload = uploadPreparedMedia as jest.MockedFunction<
  typeof uploadPreparedMedia
>;

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

function selectFile() {
  const input = screen.getByLabelText("画像・動画を追加");
  fireEvent.change(input, {
    target: {
      files: [new File(["x"], "swing.jpg", { type: "image/jpeg" })],
    },
  });
}

function dispatchBeforeUnload(): Event {
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return event;
}

beforeEach(() => {
  jest.clearAllMocks();
  // jsdom は Blob のプレビュー URL を作れないため、生成だけ差し替える。
  URL.createObjectURL = jest.fn(() => "blob:preview");
  URL.revokeObjectURL = jest.fn();
  mockPrepare.mockResolvedValue({ ok: true, prepared });
  mockUpload.mockResolvedValue({ ok: true, attachment });
});

describe("MediaPicker", () => {
  it("保存済みノートでは選択直後にアップロードする", async () => {
    const onUploaded = jest.fn();
    render(<MediaPicker baseballNoteId={9} onUploaded={onUploaded} />);

    selectFile();

    await waitFor(() => expect(onUploaded).toHaveBeenCalled());
    expect(mockUpload).toHaveBeenCalledWith(
      prepared,
      9,
      expect.objectContaining({ signal: expect.anything() }),
    );
  });

  it("新規作成中はアップロードせずステージするだけにする", async () => {
    const onStage = jest.fn();
    render(<MediaPicker onStage={onStage} />);

    selectFile();

    await waitFor(() => expect(onStage).toHaveBeenCalled());
    expect(mockUpload).not.toHaveBeenCalled();
    expect((onStage.mock.calls[0][0] as StagedMediaAsset).memo).toBe("");
  });

  it("クライアント側の上限チェックで弾かれたらアップロードしない", async () => {
    mockPrepare.mockResolvedValue({
      ok: false,
      message: "動画は30秒以内にしてください（Pro プランなら180秒まで）。",
    });
    render(<MediaPicker baseballNoteId={9} />);

    selectFile();

    expect(await screen.findByRole("alert")).toHaveTextContent("30秒以内");
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it("月次上限の 403 では無料枠超過として案内する（Pro 限定機能とは書かない）", async () => {
    mockUpload.mockResolvedValue({
      ok: false,
      reason: "limit_reached",
      message: "今月のアップロード上限に達しています",
    });
    render(<MediaPicker baseballNoteId={9} />);

    selectFile();

    const heading = await screen.findByText(
      "無料プランでアップロードできる画像・動画は月3件までです",
    );
    expect(heading).toBeInTheDocument();
    expect(screen.queryByText(/Pro 限定/)).not.toBeInTheDocument();
  });

  it("ユーザーが中断した場合はエラーを出さない", async () => {
    mockUpload.mockResolvedValue({ ok: false, reason: "canceled" });
    render(<MediaPicker baseballNoteId={9} />);

    selectFile();

    await waitFor(() => expect(mockUpload).toHaveBeenCalled());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("アップロード中はページ離脱を警告し、完了後は警告しない", async () => {
    let resolveUpload: (value: {
      ok: false;
      reason: "canceled";
    }) => void = () => {};
    mockUpload.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpload = resolve;
        }),
    );
    render(<MediaPicker baseballNoteId={9} />);

    selectFile();

    await screen.findByText("アップロード中…");
    expect(dispatchBeforeUnload().defaultPrevented).toBe(true);

    resolveUpload({ ok: false, reason: "canceled" });

    await waitFor(() =>
      expect(screen.queryByText("アップロード中…")).not.toBeInTheDocument(),
    );
    expect(dispatchBeforeUnload().defaultPrevented).toBe(false);
  });
});
