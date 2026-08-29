const mockHasEntitlement = jest.fn();
const mockIsLoading = jest.fn(() => false);

jest.mock("@app/hooks/pro/useEntitlement", () => ({
  useEntitlement: () => ({
    isPro: mockHasEntitlement("advanced_periodic_review"),
    inTrial: false,
    inGracePeriod: false,
    isLoading: mockIsLoading(),
    hasEntitlement: mockHasEntitlement,
  }),
}));

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({ open: jest.fn(), close: jest.fn() }),
}));

jest.mock("@app/lib/analytics", () => ({
  trackEvent: jest.fn(),
}));

jest.mock("@app/services/v2/periodicReviewService", () => ({
  markPeriodicReviewRead: jest.fn(),
}));

import type { FetchResult } from "@app/services/v2/requests";
import type { PeriodicReview } from "@app/types/periodicReview";
import { render, screen, waitFor } from "@testing-library/react";
import { markPeriodicReviewRead } from "@app/services/v2/periodicReviewService";
import PeriodicReviewList from "../PeriodicReviewList";

const mockMarkRead = markPeriodicReviewRead as jest.MockedFunction<
  typeof markPeriodicReviewRead
>;

const UPSELL_CTA = "Pro プランを見る";
const SAMPLE_LABEL = "サンプルデータ（実際の記録ではありません）";
const NOT_GENERATED = /まだレポートがありません/;

const buildReview = (
  overrides: Partial<PeriodicReview> = {},
): PeriodicReview => ({
  id: 1,
  period_type: "weekly",
  period_start: "2026-07-13",
  period_end: "2026-07-19",
  read: true,
  summary: {
    period_type: "weekly",
    practice_days: 99,
    total_swings: 5000,
    active_days: 7,
    streak_current: 40,
  },
  ...overrides,
});

const okResult = (data: PeriodicReview[]): FetchResult<PeriodicReview[]> => ({
  status: "ok",
  data,
});

describe("PeriodicReviewList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsLoading.mockReturnValue(false);
    mockHasEntitlement.mockReturnValue(true);
    mockMarkRead.mockResolvedValue({ ok: true, data: buildReview() });
  });

  describe("空配列の出し分け", () => {
    it("無料ユーザーには 0 件でもサンプルと Pro 訴求を出す", () => {
      mockHasEntitlement.mockReturnValue(false);

      render(<PeriodicReviewList result={okResult([])} />);

      expect(screen.getByText(SAMPLE_LABEL)).toBeInTheDocument();
      expect(
        screen.getAllByRole("button", { name: new RegExp(UPSELL_CTA) }).length,
      ).toBeGreaterThan(0);
      // サンプルは3週分。実データと取り違えないよう未生成の案内は出さない。
      expect(screen.getAllByText("今週の振り返り")).toHaveLength(3);
      expect(screen.queryByText(NOT_GENERATED)).not.toBeInTheDocument();
    });

    it("Pro ユーザーで 0 件なら未生成の案内を出し、訴求もサンプルも出さない", () => {
      mockHasEntitlement.mockReturnValue(true);

      render(<PeriodicReviewList result={okResult([])} />);

      expect(screen.getByText(NOT_GENERATED)).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: new RegExp(UPSELL_CTA) }),
      ).not.toBeInTheDocument();
      expect(screen.queryByText(SAMPLE_LABEL)).not.toBeInTheDocument();
    });

    it("Pro 判定が未確定の間は訴求も未生成の案内も出さない", () => {
      mockIsLoading.mockReturnValue(true);
      mockHasEntitlement.mockReturnValue(false);

      render(<PeriodicReviewList result={okResult([])} />);

      expect(screen.queryByText(SAMPLE_LABEL)).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: new RegExp(UPSELL_CTA) }),
      ).not.toBeInTheDocument();
      expect(screen.queryByText(NOT_GENERATED)).not.toBeInTheDocument();
    });

    it("Pro 判定が未確定の間は実データも既読化もしない", () => {
      mockIsLoading.mockReturnValue(true);
      mockHasEntitlement.mockReturnValue(true);

      render(
        <PeriodicReviewList
          result={okResult([buildReview({ read: false })])}
        />,
      );

      expect(screen.queryByText("99日")).not.toBeInTheDocument();
      expect(mockMarkRead).not.toHaveBeenCalled();
    });
  });

  it("Pro ユーザーには実データを表示する", () => {
    render(<PeriodicReviewList result={okResult([buildReview()])} />);

    expect(screen.getByText("99日")).toBeInTheDocument();
    expect(screen.queryByText(SAMPLE_LABEL)).not.toBeInTheDocument();
  });

  it("取得失敗は 0 件と区別してエラー文言を出す", () => {
    render(<PeriodicReviewList result={{ status: "error" }} />);

    expect(
      screen.getByText(/振り返りレポートを取得できませんでした/),
    ).toBeInTheDocument();
    expect(screen.queryByText(NOT_GENERATED)).not.toBeInTheDocument();
  });

  describe("既読化", () => {
    it("表示時に未読だけをまとめて既読にする", async () => {
      render(
        <PeriodicReviewList
          result={okResult([
            buildReview({ id: 1, read: false }),
            buildReview({ id: 2, read: true }),
            buildReview({ id: 3, read: false }),
          ])}
        />,
      );

      await waitFor(() => expect(mockMarkRead).toHaveBeenCalledTimes(2));
      expect(mockMarkRead).toHaveBeenCalledWith(1);
      expect(mockMarkRead).toHaveBeenCalledWith(3);
      expect(mockMarkRead).not.toHaveBeenCalledWith(2);
    });

    it("無料ユーザーのサンプル表示では既読化しない", () => {
      mockHasEntitlement.mockReturnValue(false);

      render(
        <PeriodicReviewList
          result={okResult([buildReview({ read: false })])}
        />,
      );

      expect(mockMarkRead).not.toHaveBeenCalled();
    });

    it("再レンダリングされても同じレポートへ既読化を繰り返さない", async () => {
      const result = okResult([buildReview({ id: 1, read: false })]);
      const { rerender } = render(<PeriodicReviewList result={result} />);

      await waitFor(() => expect(mockMarkRead).toHaveBeenCalledTimes(1));

      rerender(<PeriodicReviewList result={result} />);
      rerender(<PeriodicReviewList result={{ ...result }} />);

      await waitFor(() => expect(mockMarkRead).toHaveBeenCalledTimes(1));
    });

    it("既読化が失敗しても一覧は表示され続ける", async () => {
      mockMarkRead.mockResolvedValue({
        ok: false,
        reason: "error",
        errors: ["既読にできませんでした"],
      });

      render(
        <PeriodicReviewList
          result={okResult([buildReview({ read: false })])}
        />,
      );

      await waitFor(() => expect(mockMarkRead).toHaveBeenCalledTimes(1));
      expect(screen.getByText("99日")).toBeInTheDocument();
    });

    it("既読化が例外で落ちても一覧は表示され続ける", async () => {
      mockMarkRead.mockRejectedValue(new Error("network"));

      render(
        <PeriodicReviewList
          result={okResult([buildReview({ read: false })])}
        />,
      );

      await waitFor(() => expect(mockMarkRead).toHaveBeenCalledTimes(1));
      expect(screen.getByText("99日")).toBeInTheDocument();
    });
  });
});
