const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@app/services/v2/baseballNoteService", () => ({
  createBaseballNote: jest.fn(),
  updateBaseballNote: jest.fn(),
  deleteBaseballNote: jest.fn(),
}));

// タグ選択 UI 側のガードを外し、フォームの送信ペイロード組み立てだけを検証する。
// UI を隠すだけでは不十分で、ペイロード組み立ての時点で entitlement を見て
// tag_ids キーごと落としていることを担保する。
jest.mock("@app/components/note/NoteTagSection", () => {
  const react = jest.requireActual<typeof ReactModule>("react");
  return function StubTagSection({
    selectedIds,
    onChange,
  }: {
    selectedIds: number[];
    onChange: (ids: number[]) => void;
  }) {
    return react.createElement(
      "button",
      {
        type: "button",
        onClick: () => onChange([...selectedIds, 999]),
      },
      "タグを足す",
    );
  };
});

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

const mockHasEntitlement = jest.fn(() => false);
const mockIsEntitlementLoading = jest.fn(() => false);

jest.mock("@app/hooks/pro/useEntitlement", () => ({
  useEntitlement: () => ({
    isPro: false,
    inTrial: false,
    inGracePeriod: false,
    isLoading: mockIsEntitlementLoading(),
    hasEntitlement: mockHasEntitlement,
  }),
}));

import type { BaseballNoteV2, NoteTag } from "@app/interface/baseballNoteV2";
import type { ReflectionTemplate } from "@app/interface/reflectionTemplate";
import type { FetchResult } from "@app/services/v2/requests";
import type ReactModule from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import NoteCreateForm from "@app/(app)/note/new/_components/NoteCreateForm";
import {
  createBaseballNote,
  updateBaseballNote,
} from "@app/services/v2/baseballNoteService";
import NoteEditForm from "../NoteEditForm";

const mockCreate = createBaseballNote as jest.MockedFunction<
  typeof createBaseballNote
>;
const mockUpdate = updateBaseballNote as jest.MockedFunction<
  typeof updateBaseballNote
>;

const templatesResult: FetchResult<ReflectionTemplate[]> = {
  status: "ok",
  data: [],
};
const tagsResult: FetchResult<NoteTag[]> = { status: "ok", data: [] };

const note: BaseballNoteV2 = {
  id: 12,
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
  tags: [{ id: 301, name: "打撃", is_preset: true }],
  media_attachments: [],
};

function addTagAndSave() {
  fireEvent.click(screen.getByRole("button", { name: "タグを足す" }));
  fireEvent.click(screen.getByRole("button", { name: "保存" }));
}

describe("ノートフォームの tag_ids 送信ガード（UI を迂回してタグが変わった場合）", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasEntitlement.mockReturnValue(false);
    mockIsEntitlementLoading.mockReturnValue(false);
    mockCreate.mockResolvedValue({ ok: true, data: note });
    mockUpdate.mockResolvedValue({ ok: true, data: note });
  });

  describe("新規作成", () => {
    function renderCreateForm() {
      render(
        <NoteCreateForm
          templatesResult={templatesResult}
          tagsResult={tagsResult}
        />,
      );
      fireEvent.change(screen.getByLabelText("タイトル"), {
        target: { value: "気づき" },
      });
    }

    it("無料ユーザーはタグが選ばれていても tag_ids キーを送らない", async () => {
      renderCreateForm();

      addTagAndSave();

      await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
      expect("tag_ids" in mockCreate.mock.calls[0][0]).toBe(false);
    });

    it("Pro 判定が未確定の間はタグが選ばれていても tag_ids キーを送らない", async () => {
      mockHasEntitlement.mockReturnValue(true);
      mockIsEntitlementLoading.mockReturnValue(true);
      renderCreateForm();

      addTagAndSave();

      await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
      expect("tag_ids" in mockCreate.mock.calls[0][0]).toBe(false);
    });

    it("Pro ユーザーは tag_ids を送る", async () => {
      mockHasEntitlement.mockReturnValue(true);
      renderCreateForm();

      addTagAndSave();

      await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
      expect(mockCreate.mock.calls[0][0].tag_ids).toEqual([999]);
    });
  });

  describe("編集", () => {
    function renderEditForm() {
      render(
        <NoteEditForm
          note={note}
          templatesResult={templatesResult}
          tagsResult={tagsResult}
        />,
      );
    }

    it("無料ユーザーはタグが変わっても tag_ids キーを送らない（既存タグを消さない）", async () => {
      renderEditForm();
      fireEvent.change(screen.getByLabelText("タイトル"), {
        target: { value: "更新後" },
      });

      addTagAndSave();

      await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
      expect(mockUpdate.mock.calls[0][1]).not.toHaveProperty("tag_ids");
    });

    it("Pro 判定が未確定の間はタグが変わっても tag_ids キーを送らない", async () => {
      mockHasEntitlement.mockReturnValue(true);
      mockIsEntitlementLoading.mockReturnValue(true);
      renderEditForm();
      fireEvent.change(screen.getByLabelText("タイトル"), {
        target: { value: "更新後" },
      });

      addTagAndSave();

      await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
      expect(mockUpdate.mock.calls[0][1]).not.toHaveProperty("tag_ids");
    });

    it("Pro ユーザーは変更後のタグを tag_ids で送る", async () => {
      mockHasEntitlement.mockReturnValue(true);
      renderEditForm();

      addTagAndSave();

      await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
      expect(mockUpdate.mock.calls[0][1].tag_ids).toEqual([301, 999]);
    });
  });
});
