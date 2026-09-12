const mockOpenProUpgradeModal = jest.fn();

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({
    open: mockOpenProUpgradeModal,
    close: jest.fn(),
  }),
}));

jest.mock("@app/hooks/pro/useEntitlement", () => ({
  useEntitlement: jest.fn(),
}));

jest.mock("@app/services/v2/gameResultLinkService", () => ({
  searchGameResultOptions: jest.fn(),
}));

import type { FetchResult } from "@app/services/v2/requests";
import type { GameResultLinkOption } from "@app/types/gameResultLink";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import { searchGameResultOptions } from "@app/services/v2/gameResultLinkService";
import NoteGameResultSection from "../NoteGameResultSection";

const mockUseEntitlement = useEntitlement as jest.MockedFunction<
  typeof useEntitlement
>;
const mockSearch = searchGameResultOptions as jest.MockedFunction<
  typeof searchGameResultOptions
>;

function buildOption(
  overrides: Partial<GameResultLinkOption> = {},
): GameResultLinkOption {
  return {
    game_result_id: 101,
    date: "2026-07-20",
    opponent_team_name: "青空高校",
    ...overrides,
  };
}

function mockEntitlement({
  granted = false,
  isLoading = false,
}: { granted?: boolean; isLoading?: boolean } = {}) {
  mockUseEntitlement.mockReturnValue({
    isPro: granted,
    inTrial: false,
    inGracePeriod: false,
    isLoading,
    hasEntitlement: () => granted,
  } as unknown as ReturnType<typeof useEntitlement>);
}

function renderSection(
  props: Partial<React.ComponentProps<typeof NoteGameResultSection>> = {},
) {
  const onChange = jest.fn();
  render(
    <NoteGameResultSection
      selectedIds={[]}
      onChange={onChange}
      initialCount={0}
      linkedOptions={[]}
      {...props}
    />,
  );
  return { onChange };
}

function openPicker() {
  fireEvent.click(screen.getByRole("button", { name: /試合記録に紐付け/ }));
}

function searchInput() {
  return screen.getByLabelText("対戦相手で検索");
}

describe("試合記録の紐付け", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEntitlement();
    mockSearch.mockResolvedValue({ status: "ok", data: [] });
  });

  describe("紐付け先の表示", () => {
    it("紐付け済みの試合を日付と対戦相手で表示する", () => {
      renderSection({
        selectedIds: [101],
        initialCount: 1,
        linkedOptions: [buildOption()],
      });

      expect(screen.getByText("2026年7月20日 vs 青空高校")).toBeInTheDocument();
    });

    it("表示情報が取得できなかった紐付けも消さずに残す", () => {
      renderSection({ selectedIds: [999], initialCount: 1 });

      expect(screen.getByText("試合に紐付け済み")).toBeInTheDocument();
    });

    it("紐付けを外せる", () => {
      const { onChange } = renderSection({
        selectedIds: [101, 102],
        initialCount: 2,
        linkedOptions: [buildOption()],
      });

      fireEvent.click(
        screen.getAllByRole("button", { name: "試合の紐付けを外す" })[0],
      );

      expect(onChange).toHaveBeenCalledWith([102]);
    });
  });

  describe("複数紐付けの Pro 判定（グランドファザリング）", () => {
    it("無料でも1件目は紐付けられる", async () => {
      renderSection({ selectedIds: [], initialCount: 0 });

      openPicker();

      await waitFor(() => expect(mockSearch).toHaveBeenCalled());
      expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
      expect(searchInput()).toBeInTheDocument();
    });

    it("無料は既存が無い状態から2件目を足そうとすると Pro 訴求を出す", () => {
      renderSection({ selectedIds: [101], initialCount: 0 });

      fireEvent.click(
        screen.getByRole("button", { name: /試合をもう1件追加/ }),
      );

      expect(mockOpenProUpgradeModal).toHaveBeenCalledWith({
        trigger: "multi_game_result_notes",
      });
      expect(screen.queryByLabelText("対戦相手で検索")).not.toBeInTheDocument();
    });

    it("無料でも既存件数の範囲内なら追加し直せる（Pro 解約後の維持）", async () => {
      renderSection({ selectedIds: [101, 102], initialCount: 3 });

      fireEvent.click(
        screen.getByRole("button", { name: /試合をもう1件追加/ }),
      );

      await waitFor(() => expect(mockSearch).toHaveBeenCalled());
      expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
      expect(searchInput()).toBeInTheDocument();
    });

    it("無料は既存件数を超えて増やそうとすると Pro 訴求を出す", () => {
      renderSection({ selectedIds: [101, 102, 103], initialCount: 3 });

      fireEvent.click(
        screen.getByRole("button", { name: /試合をもう1件追加/ }),
      );

      expect(mockOpenProUpgradeModal).toHaveBeenCalledWith({
        trigger: "multi_game_result_notes",
      });
    });

    it("Pro は既存が無くても複数紐付けできる", async () => {
      mockEntitlement({ granted: true });
      renderSection({ selectedIds: [101], initialCount: 0 });

      fireEvent.click(
        screen.getByRole("button", { name: /試合をもう1件追加/ }),
      );

      await waitFor(() => expect(mockSearch).toHaveBeenCalled());
      expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
    });

    it("Pro 判定が未確定の間は権利なしとして扱う", () => {
      mockEntitlement({ granted: true, isLoading: true });
      renderSection({ selectedIds: [101], initialCount: 0 });

      fireEvent.click(
        screen.getByRole("button", { name: /試合をもう1件追加/ }),
      );

      expect(mockOpenProUpgradeModal).toHaveBeenCalledWith({
        trigger: "multi_game_result_notes",
      });
    });
  });

  describe("検索結果の表示", () => {
    it("候補を選ぶと紐付けに加える", async () => {
      mockSearch.mockResolvedValue({ status: "ok", data: [buildOption()] });
      const { onChange } = renderSection();

      openPicker();

      const candidate = await screen.findByRole("button", {
        name: "2026年7月20日 vs 青空高校",
      });
      fireEvent.click(candidate);

      expect(onChange).toHaveBeenCalledWith([101]);
    });

    it("0件は「該当する試合記録がありません」と伝える", async () => {
      mockSearch.mockResolvedValue({ status: "ok", data: [] });
      renderSection();

      openPicker();

      expect(
        await screen.findByText("該当する試合記録がありません"),
      ).toBeInTheDocument();
    });

    it("取得失敗は0件と区別して伝える", async () => {
      mockSearch.mockResolvedValue({ status: "error" });
      renderSection();

      openPicker();

      expect(
        await screen.findByText("試合記録を取得できませんでした。"),
      ).toBeInTheDocument();
      expect(
        screen.queryByText("該当する試合記録がありません"),
      ).not.toBeInTheDocument();
    });
  });

  describe("デバウンス検索", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("連続入力ではリクエストを1回にまとめ、最後の入力で検索する", async () => {
      renderSection();
      openPicker();
      await act(async () => {});
      mockSearch.mockClear();

      fireEvent.change(searchInput(), { target: { value: "あ" } });
      fireEvent.change(searchInput(), { target: { value: "あお" } });
      fireEvent.change(searchInput(), { target: { value: "あおぞら" } });
      expect(mockSearch).not.toHaveBeenCalled();

      await act(async () => {
        jest.advanceTimersByTime(300);
      });

      expect(mockSearch).toHaveBeenCalledTimes(1);
      expect(mockSearch).toHaveBeenCalledWith("あおぞら");
    });

    it("応答が前後しても古い結果で新しい結果を上書きしない", async () => {
      renderSection();
      openPicker();
      await act(async () => {});

      const resolvers: Array<
        (value: FetchResult<GameResultLinkOption[]>) => void
      > = [];
      mockSearch.mockImplementation(
        () =>
          new Promise<FetchResult<GameResultLinkOption[]>>((resolve) => {
            resolvers.push(resolve);
          }),
      );

      fireEvent.change(searchInput(), { target: { value: "青" } });
      await act(async () => {
        jest.advanceTimersByTime(300);
      });
      fireEvent.change(searchInput(), { target: { value: "赤" } });
      await act(async () => {
        jest.advanceTimersByTime(300);
      });
      expect(resolvers).toHaveLength(2);

      // 新しい検索（赤）が先に返り、古い検索（青）が後から返る。
      await act(async () => {
        resolvers[1]({
          status: "ok",
          data: [
            buildOption({
              game_result_id: 202,
              opponent_team_name: "赤星高校",
            }),
          ],
        });
      });
      await act(async () => {
        resolvers[0]({
          status: "ok",
          data: [
            buildOption({
              game_result_id: 101,
              opponent_team_name: "青空高校",
            }),
          ],
        });
      });

      expect(screen.getByText(/赤星高校/)).toBeInTheDocument();
      expect(screen.queryByText(/青空高校/)).not.toBeInTheDocument();
    });
  });
});
