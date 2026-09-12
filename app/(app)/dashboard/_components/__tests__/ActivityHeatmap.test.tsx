import type { ActivityLog } from "@app/types/activity";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ACTIVITY_LEVEL_COLORS,
  ACTIVITY_LEVEL_LABELS,
} from "@app/constants/activity";
import { CAPTION_PLACEHOLDER, HEATMAP_LABEL } from "../activityCopy";
import ActivityHeatmap from "../ActivityHeatmap";

// 2026-08-03 は月曜。
const TODAY = "2026-08-03";

const log = (overrides: Partial<ActivityLog> = {}): ActivityLog => ({
  activity_date: TODAY,
  intensity_level: 2,
  has_game: false,
  total_swing_count: 0,
  practice_menu_count: 0,
  ...overrides,
});

const toRgb = (hex: string): string => {
  const value = hex.replace("#", "");
  return `rgb(${parseInt(value.slice(0, 2), 16)}, ${parseInt(value.slice(2, 4), 16)}, ${parseInt(value.slice(4, 6), 16)})`;
};

const renderHeatmap = (
  props: Partial<React.ComponentProps<typeof ActivityHeatmap>> = {},
) =>
  render(
    <ActivityHeatmap
      from="2026-07-27"
      to={TODAY}
      logs={[]}
      today={TODAY}
      {...props}
    />,
  );

describe("ActivityHeatmap", () => {
  it("期間内のすべての日を 1 マスずつ描く", () => {
    renderHeatmap({ from: "2026-08-01", to: "2026-08-09" });

    expect(screen.getAllByRole("button")).toHaveLength(9);
    expect(
      screen.getByRole("button", { name: /2026年8月1日\(土\)/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /2026年8月9日\(日\)/ }),
    ).toBeInTheDocument();
  });

  it("範囲外の日はマスにしない", () => {
    renderHeatmap({ from: "2026-08-01", to: "2026-08-09" });

    expect(
      screen.queryByRole("button", { name: /2026年7月31日/ }),
    ).not.toBeInTheDocument();
  });

  describe("aria-label", () => {
    it("日付とその日の内容を読み上げられる", () => {
      renderHeatmap({
        logs: [
          log({
            practice_menu_count: 3,
            total_swing_count: 120,
            has_game: true,
            intensity_level: 4,
          }),
        ],
      });

      expect(
        screen.getByRole("button", {
          name: "2026年8月3日(月) ・ メニュー3種 / 素振り120本 / 試合 ・ 活動量たっぷり",
        }),
      ).toBeInTheDocument();
    });

    it("記録が無い日は未記録と読み上げる", () => {
      renderHeatmap();

      expect(
        screen.getByRole("button", { name: "2026年8月2日(日) ・ 未記録" }),
      ).toBeInTheDocument();
    });
  });

  describe("5 段階の濃淡", () => {
    it("intensity_level ごとに決まった色を塗る", () => {
      renderHeatmap({
        from: "2026-07-30",
        to: TODAY,
        logs: [
          log({ activity_date: "2026-07-31", intensity_level: 1 }),
          log({ activity_date: "2026-08-01", intensity_level: 2 }),
          log({ activity_date: "2026-08-02", intensity_level: 3 }),
          log({ activity_date: TODAY, intensity_level: 4 }),
        ],
      });

      const colorOf = (namePattern: RegExp): string =>
        screen.getByRole("button", { name: namePattern }).style.backgroundColor;

      // 7/30 は記録が無いので L0。
      expect(colorOf(/2026年7月30日/)).toBe(toRgb(ACTIVITY_LEVEL_COLORS[0]));
      expect(colorOf(/2026年7月31日/)).toBe(toRgb(ACTIVITY_LEVEL_COLORS[1]));
      expect(colorOf(/2026年8月1日/)).toBe(toRgb(ACTIVITY_LEVEL_COLORS[2]));
      expect(colorOf(/2026年8月2日/)).toBe(toRgb(ACTIVITY_LEVEL_COLORS[3]));
      expect(colorOf(/2026年8月3日/)).toBe(toRgb(ACTIVITY_LEVEL_COLORS[4]));
    });

    it("色以外に段階の言葉を凡例で示す", () => {
      renderHeatmap();

      const legend = screen.getByRole("list", { name: "活動量の凡例" });
      ACTIVITY_LEVEL_LABELS.forEach((label) => {
        expect(within(legend).getByText(label)).toBeInTheDocument();
      });
    });
  });

  describe("キャプション", () => {
    it("最初は選び方を案内する", () => {
      renderHeatmap();

      expect(screen.getByText(CAPTION_PLACEHOLDER)).toBeInTheDocument();
    });

    it("クリックした日の日付と内容を出す", async () => {
      const user = userEvent.setup();
      renderHeatmap({
        logs: [log({ practice_menu_count: 3, total_swing_count: 120 })],
      });

      await user.click(screen.getByRole("button", { name: /2026年8月3日/ }));

      expect(
        screen.getByText(
          "2026年8月3日(月) ・ メニュー3種 / 素振り120本 ・ 活動量ふつう",
        ),
      ).toBeInTheDocument();
    });

    it("ホバーした日の内容を出す", async () => {
      const user = userEvent.setup();
      renderHeatmap({ logs: [log({ has_game: true, intensity_level: 4 })] });

      await user.hover(screen.getByRole("button", { name: /2026年8月3日/ }));

      expect(
        screen.getByText("2026年8月3日(月) ・ 試合 ・ 活動量たっぷり"),
      ).toBeInTheDocument();
    });
  });

  describe("キーボード操作", () => {
    it("タブ順に載るマスは 1 つだけで、今日から始まる", () => {
      renderHeatmap();

      const focusable = screen
        .getAllByRole("button")
        .filter((button) => button.tabIndex === 0);

      expect(focusable).toHaveLength(1);
      expect(focusable[0]).toHaveAccessibleName(/2026年8月3日/);
    });

    it("上下キーで 1 日、左右キーで 1 週間ぶん動く", async () => {
      const user = userEvent.setup();
      renderHeatmap({ from: "2026-07-20", to: TODAY });

      // クリックでフォーカスを移してから矢印キーを送る。
      await user.click(screen.getByRole("button", { name: /2026年8月3日/ }));

      await user.keyboard("{ArrowUp}");
      expect(
        screen.getByRole("button", { name: /2026年8月2日/ }),
      ).toHaveFocus();

      await user.keyboard("{ArrowLeft}");
      expect(
        screen.getByRole("button", { name: /2026年7月26日/ }),
      ).toHaveFocus();

      await user.keyboard("{ArrowDown}");
      expect(
        screen.getByRole("button", { name: /2026年7月27日/ }),
      ).toHaveFocus();
    });

    it("範囲の外へは動かさない", async () => {
      const user = userEvent.setup();
      renderHeatmap({ from: "2026-08-01", to: TODAY });

      const first = screen.getByRole("button", { name: /2026年8月1日/ });
      await user.click(first);
      await user.keyboard("{ArrowUp}");

      expect(first).toHaveFocus();
    });

    it("スクロールできる領域自体もキーボードで到達できる", () => {
      renderHeatmap();

      expect(screen.getByRole("group", { name: HEATMAP_LABEL })).toHaveProperty(
        "tabIndex",
        0,
      );
    });
  });

  describe("自動スクロール", () => {
    it("今日を含む列が見える位置まで横スクロールする", () => {
      renderHeatmap({ from: "2025-08-04", to: TODAY });

      expect(
        screen.getByRole("group", { name: HEATMAP_LABEL }).scrollLeft,
      ).toBeGreaterThan(0);
    });

    it("フォーカスは奪わない", () => {
      renderHeatmap({ from: "2025-08-04", to: TODAY });

      expect(document.activeElement).toBe(document.body);
    });

    it("今日の列が右にあるほど深くスクロールする", () => {
      const scrollLeftFor = (from: string): number => {
        const view = renderHeatmap({ from, to: TODAY });
        const scrollLeft = screen.getByRole("group", {
          name: HEATMAP_LABEL,
        }).scrollLeft;
        view.unmount();
        return scrollLeft;
      };

      expect(scrollLeftFor("2025-08-04")).toBeGreaterThan(
        scrollLeftFor("2026-07-06"),
      );
    });
  });

  it("月ラベルを月が変わる列に出す", () => {
    renderHeatmap({ from: "2026-06-29", to: TODAY });

    expect(screen.getByText("7月")).toBeInTheDocument();
    expect(screen.getByText("8月")).toBeInTheDocument();
  });
});
