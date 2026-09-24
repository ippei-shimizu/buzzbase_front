import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { findOpsBenchmark } from "../../_constants/benchmarks";
import OpsLevelChecker from "../OpsLevelChecker";

describe("findOpsBenchmark", () => {
  it.each([
    [1.0, "S"],
    [0.95, "A"],
    [0.8, "B"],
    [0.7, "C"],
    [0.699, "D"],
    [0, "D"],
  ])("OPS %s は %s 評価", (ops, key) => {
    expect(findOpsBenchmark(ops)?.key).toBe(key);
  });

  it("負数や NaN は判定しない", () => {
    expect(findOpsBenchmark(-0.1)).toBeNull();
    expect(findOpsBenchmark(Number.NaN)).toBeNull();
  });
});

describe("OpsLevelChecker", () => {
  it("入力前は判定結果を出さない", () => {
    render(<OpsLevelChecker />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("OPS を入力するとカテゴリ別の目安を表示する", async () => {
    const user = userEvent.setup();
    render(<OpsLevelChecker />);

    await user.type(screen.getByRole("spinbutton"), "0.85");

    const result = screen.getByRole("status");
    expect(result).toHaveTextContent("B（好打者）");
    expect(result).toHaveTextContent("強豪校レギュラー上位");
  });

  it("負数を入力するとエラーを出す", async () => {
    const user = userEvent.setup();
    render(<OpsLevelChecker />);

    await user.type(screen.getByRole("spinbutton"), "-1");

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
