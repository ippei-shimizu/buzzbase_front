import type { CorrelationInsight } from "@app/types/insight";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InsightCard from "../_components/InsightCard";

const buildInsight = (
  overrides: Partial<CorrelationInsight> = {},
): CorrelationInsight => ({
  key: "swings_vs_ba",
  id: null,
  title: "素振りの本数と打率",
  body: "素振りの本数が多い週ほど、打率が.045高い傾向。",
  metric: "batting_average",
  dimension: "total_swings",
  direction: "positive",
  strength: "strong",
  sample_weeks: 8,
  sufficient: true,
  ...overrides,
});

describe("InsightCard", () => {
  it("おすすめは削除ハンドラを渡されても削除できない", () => {
    render(
      <InsightCard insight={buildInsight({ id: null })} onDelete={jest.fn()} />,
    );

    expect(
      screen.queryByRole("button", { name: /を削除$/ }),
    ).not.toBeInTheDocument();
  });

  it("自作は削除でき、対象のカードを呼び出し元へ渡す", async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    const insight = buildInsight({ id: 7, title: "睡眠時間とOPS" });

    render(<InsightCard insight={insight} onDelete={onDelete} />);
    await user.click(
      screen.getByRole("button", { name: "睡眠時間とOPSを削除" }),
    );

    expect(onDelete).toHaveBeenCalledWith(insight);
  });

  it("削除ハンドラが無ければ削除ボタンを出さない", () => {
    render(<InsightCard insight={buildInsight({ id: 7 })} />);

    expect(
      screen.queryByRole("button", { name: /を削除$/ }),
    ).not.toBeInTheDocument();
  });
});
