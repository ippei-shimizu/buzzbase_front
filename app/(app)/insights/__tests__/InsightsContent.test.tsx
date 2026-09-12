const mockHasEntitlement = jest.fn();
const mockIsLoading = jest.fn(() => false);
const mockOpenProUpgradeModal = jest.fn();

jest.mock("@app/hooks/pro/useEntitlement", () => ({
  useEntitlement: () => ({
    isPro: mockHasEntitlement("correlation_insights"),
    inTrial: false,
    inGracePeriod: false,
    isLoading: mockIsLoading(),
    hasEntitlement: mockHasEntitlement,
  }),
}));

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({
    open: mockOpenProUpgradeModal,
    close: jest.fn(),
  }),
}));

jest.mock("@app/lib/analytics", () => ({
  trackEvent: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock("@app/services/v2/correlationInsightService", () => ({
  getCorrelationInsights: jest.fn(),
  createInsightCombination: jest.fn(),
  deleteInsightCombination: jest.fn(),
}));

import type { FetchResult } from "@app/services/v2/requests";
import type { CorrelationInsight } from "@app/types/insight";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import {
  createInsightCombination,
  deleteInsightCombination,
  getCorrelationInsights,
} from "@app/services/v2/correlationInsightService";
import {
  CREATE_SUCCESS_MESSAGE,
  REFRESH_FAILED_MESSAGE,
} from "../_components/insightCopy";
import InsightsContent from "../_components/InsightsContent";

const mockCreate = createInsightCombination as jest.MockedFunction<
  typeof createInsightCombination
>;
const mockDelete = deleteInsightCombination as jest.MockedFunction<
  typeof deleteInsightCombination
>;
const mockRefetch = getCorrelationInsights as jest.MockedFunction<
  typeof getCorrelationInsights
>;

const SAMPLE_LABEL = "サンプルデータ（実際の記録ではありません）";
const UPSELL_CTA = "Pro プランを見る";

const buildInsight = (
  overrides: Partial<CorrelationInsight> = {},
): CorrelationInsight => ({
  key: "swings_vs_ba",
  id: null,
  title: "素振りの本数と打率",
  body: "素振りの本数が多い週ほど、打率が.045高い傾向。いまの取り組みが効いていそう。この調子で続けよう。",
  metric: "batting_average",
  dimension: "total_swings",
  direction: "positive",
  strength: "strong",
  sample_weeks: 8,
  sufficient: true,
  ...overrides,
});

const okResult = (
  data: CorrelationInsight[],
): FetchResult<CorrelationInsight[]> => ({ status: "ok", data });

const renderContent = (
  result: FetchResult<CorrelationInsight[]>,
  practiceMenus: React.ComponentProps<
    typeof InsightsContent
  >["practiceMenus"] = [],
) => render(<InsightsContent result={result} practiceMenus={practiceMenus} />);

describe("InsightsContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsLoading.mockReturnValue(false);
    mockHasEntitlement.mockReturnValue(true);
  });

  describe("Pro 判定と無料ユーザーへの出し分け", () => {
    it("Pro 判定が未確定の間は Pro 前提の表示も訴求も出さない", () => {
      mockIsLoading.mockReturnValue(true);

      renderContent(okResult([buildInsight()]));

      expect(screen.getByText("読み込み中")).toBeInTheDocument();
      expect(screen.queryByText("おすすめ")).not.toBeInTheDocument();
      expect(screen.queryByText(SAMPLE_LABEL)).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: new RegExp(UPSELL_CTA) }),
      ).not.toBeInTheDocument();
    });

    it("無料ユーザーにはサンプル3件と実データではない旨のラベルを出す", () => {
      mockHasEntitlement.mockReturnValue(false);

      renderContent({ status: "forbidden" });

      expect(screen.getByText(SAMPLE_LABEL)).toBeInTheDocument();
      expect(
        screen.getByText("素振りが多い週は、打率が高い傾向があります。"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("睡眠時間とコンディションの関係"),
      ).toBeInTheDocument();
      expect(screen.getByText("練習日数と三振の関係")).toBeInTheDocument();
      expect(
        screen.getAllByRole("button", { name: new RegExp(UPSELL_CTA) }).length,
      ).toBeGreaterThan(0);
    });

    it("サンプルカードは削除できない", () => {
      mockHasEntitlement.mockReturnValue(false);

      renderContent({ status: "forbidden" });

      expect(
        screen.queryByRole("button", { name: /を削除$/ }),
      ).not.toBeInTheDocument();
    });

    it("entitlement があってもサーバーが 403 を返したらサンプル表示に倒す", () => {
      mockHasEntitlement.mockReturnValue(true);

      renderContent({ status: "forbidden" });

      expect(screen.getByText(SAMPLE_LABEL)).toBeInTheDocument();
    });
  });

  describe("0 件と取得失敗の区別", () => {
    it("取得に失敗したらエラーとして伝え、記録不足とは言わない", () => {
      renderContent({ status: "error" });

      expect(
        screen.getByText(/取得できませんでした。時間を置いて/),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/まだ表示できるカードがありません/),
      ).not.toBeInTheDocument();
    });

    it("0 件は取得できたうえでカードが無いこととして伝える", () => {
      renderContent(okResult([]));

      expect(
        screen.getByText(/まだ表示できるカードがありません/),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/取得できませんでした/),
      ).not.toBeInTheDocument();
    });
  });

  describe("自作とおすすめのセクション分け", () => {
    it("自作カードだけ削除でき、おすすめには削除ボタンが出ない", () => {
      renderContent(
        okResult([
          buildInsight({ key: "swings_vs_ba", id: null }),
          buildInsight({
            key: "custom_7",
            id: 7,
            title: "睡眠時間とOPS",
            dimension: "sleep_hours",
            metric: "ops",
          }),
        ]),
      );

      expect(screen.getByText("自作")).toBeInTheDocument();
      expect(screen.getByText("おすすめ")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "睡眠時間とOPSを削除" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "素振りの本数と打率を削除" }),
      ).not.toBeInTheDocument();
    });

    it("自作が 0 件でもおすすめは表示する", () => {
      renderContent(okResult([buildInsight()]));

      expect(
        screen.getByText(/自作の組み合わせはまだありません/),
      ).toBeInTheDocument();
      expect(screen.getByText("素振りの本数と打率")).toBeInTheDocument();
    });
  });

  describe("カードの表示", () => {
    it("向きに応じてアイコンを出し分ける", () => {
      renderContent(
        okResult([
          buildInsight({ key: "up", direction: "positive" }),
          buildInsight({
            key: "down",
            direction: "negative",
            title: "睡眠と防御率",
          }),
          buildInsight({
            key: "unknown",
            direction: "unknown",
            sufficient: false,
            title: "体調の良さとOPS",
          }),
        ]),
      );

      expect(screen.getByLabelText("上向きの傾向")).toBeInTheDocument();
      expect(screen.getByLabelText("下向きの傾向")).toBeInTheDocument();
      expect(screen.getByLabelText("傾向は不明")).toBeInTheDocument();
    });

    it("データが十分でも断定せず、相関であることを添える", () => {
      renderContent(okResult([buildInsight({ sample_weeks: 12 })]));

      expect(
        screen.getByText("直近12週の傾向（必ずそうとは限りません）"),
      ).toBeInTheDocument();
    });

    it("データ不足のカードは数値も傾向も出さず、方向も断定しない", () => {
      renderContent(
        okResult([
          buildInsight({
            sufficient: false,
            sample_weeks: 2,
            direction: "positive",
            body: "素振りの本数が多い週ほど、打率が.045高い傾向。",
          }),
        ]),
      );

      expect(
        screen.getByText("データが集まると分かります"),
      ).toBeInTheDocument();
      expect(screen.queryByText(/直近\d+週/)).not.toBeInTheDocument();
      expect(screen.queryByText(/\.045/)).not.toBeInTheDocument();
      expect(screen.queryByText(/高い傾向/)).not.toBeInTheDocument();
      expect(screen.getByLabelText("傾向は不明")).toBeInTheDocument();
      expect(screen.queryByLabelText("上向きの傾向")).not.toBeInTheDocument();
    });
  });

  describe("組み合わせの作成", () => {
    const openForm = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(
        screen.getByRole("button", { name: /組み合わせを作る/ }),
      );
    };

    const selectFixedCombination = async (
      user: ReturnType<typeof userEvent.setup>,
    ) => {
      await user.click(screen.getByRole("button", { name: "睡眠時間" }));
      await user.click(screen.getByRole("button", { name: "OPS" }));
      await user.click(screen.getByRole("button", { name: "作成する" }));
    };

    it("403 は Pro 限定として案内し、加入モーダルを開く", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({
        ok: false,
        reason: "forbidden",
        errors: ["「練習と成績のつながり」は Pro プラン限定です"],
      });

      renderContent(okResult([buildInsight()]));
      await openForm(user);
      await selectFixedCombination(user);

      expect(
        await screen.findByText(/Pro プラン限定です。Pro プランに加入すると/),
      ).toBeInTheDocument();
      expect(mockOpenProUpgradeModal).toHaveBeenCalledWith({
        trigger: "correlation_insights",
      });
      expect(screen.queryByText(/20件までです/)).not.toBeInTheDocument();
    });

    it("422 の上限超過はサーバーの文言をそのまま出し、加入モーダルは開かない", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({
        ok: false,
        reason: "error",
        errors: ["作成できる組み合わせは上限に達しています"],
      });

      renderContent(okResult([buildInsight()]));
      await openForm(user);
      await selectFixedCombination(user);

      expect(
        await screen.findByText("作成できる組み合わせは上限に達しています"),
      ).toBeInTheDocument();
      expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
      expect(
        screen.queryByText(/Pro プランに加入すると組み合わせを作れます/),
      ).not.toBeInTheDocument();
    });

    it("同じ組み合わせは送信せずに知らせる", async () => {
      const user = userEvent.setup();

      renderContent(
        okResult([
          buildInsight({
            key: "custom_1",
            id: 1,
            title: "睡眠時間とOPS",
            dimension: "sleep_hours",
            metric: "ops",
          }),
        ]),
      );
      await openForm(user);
      await selectFixedCombination(user);

      expect(
        await screen.findByText("同じ組み合わせのカードがすでにあります。"),
      ).toBeInTheDocument();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("作成に成功したら一覧を取り直す", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({
        ok: true,
        data: { message: "作成しました" },
      });
      mockRefetch.mockResolvedValue(
        okResult([
          buildInsight(),
          buildInsight({
            key: "custom_9",
            id: 9,
            title: "睡眠時間とOPS",
            dimension: "sleep_hours",
            metric: "ops",
          }),
        ]),
      );

      renderContent(okResult([buildInsight()]));
      await openForm(user);
      await selectFixedCombination(user);

      await waitFor(() =>
        expect(mockCreate).toHaveBeenCalledWith({
          input_type: "sleep_hours",
          practice_menu_id: null,
          metric: "ops",
        }),
      );
      expect(await screen.findByText("睡眠時間とOPS")).toBeInTheDocument();
    });

    it("作成できても一覧の取り直しに失敗したら、作成の成否と取り違えない文言を出す", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({
        ok: true,
        data: { message: "作成しました" },
      });
      mockRefetch.mockResolvedValue({ status: "error" });

      renderContent(okResult([buildInsight()]));
      await openForm(user);
      await selectFixedCombination(user);

      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith(REFRESH_FAILED_MESSAGE),
      );
      // 作成自体は成功しているので、成功トーストを出すと二重に見え、
      // 失敗したと誤解させると同じ組み合わせを作り直そうとして重複エラーになる。
      expect(toast.success).not.toHaveBeenCalledWith(CREATE_SUCCESS_MESSAGE);
      // 取り直せていない以上、一覧は作成前のまま据え置く。
      expect(screen.getByText("素振りの本数と打率")).toBeInTheDocument();
    });

    it("自作が上限に達したら作成ボタンを塞ぎ、Pro 訴求ではなく件数の案内を出す", () => {
      const customs = Array.from({ length: 20 }, (_, index) =>
        buildInsight({
          key: `custom_${index}`,
          id: index + 1,
          title: `自作カード${index}`,
        }),
      );

      renderContent(okResult(customs));

      expect(
        screen.getByRole("button", { name: /組み合わせを作る/ }),
      ).toBeDisabled();
      expect(
        screen.getByText(/自作の組み合わせは20件までです/),
      ).toBeInTheDocument();
      expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
    });
  });

  describe("組み合わせの削除", () => {
    it("確認してから削除し、一覧から取り除く", async () => {
      const user = userEvent.setup();
      mockDelete.mockResolvedValue({
        ok: true,
        data: { message: "削除しました" },
      });

      renderContent(
        okResult([
          buildInsight(),
          buildInsight({ key: "custom_7", id: 7, title: "睡眠時間とOPS" }),
        ]),
      );

      await user.click(
        screen.getByRole("button", { name: "睡眠時間とOPSを削除" }),
      );
      await user.click(await screen.findByRole("button", { name: "削除する" }));

      await waitFor(() => expect(mockDelete).toHaveBeenCalledWith(7));
      await waitFor(() =>
        expect(screen.queryByText("睡眠時間とOPS")).not.toBeInTheDocument(),
      );
      expect(screen.getByText("素振りの本数と打率")).toBeInTheDocument();
    });
  });
});
