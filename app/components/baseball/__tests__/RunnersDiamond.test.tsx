import { fireEvent, render, screen } from "@testing-library/react";
import { RunnersDiamond } from "../RunnersDiamond";

describe("RunnersDiamond", () => {
  it("null では全塁 OFF + キャプション「未入力」", () => {
    render(<RunnersDiamond value={null} onChange={jest.fn()} />);
    expect(screen.getByRole("group", { name: "ランナー状況" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "一塁" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByText("未入力")).toBeInTheDocument();
    expect(screen.queryByText("未入力に戻す")).not.toBeInTheDocument();
  });

  it("null から塁をタップすると対応する enum になる", () => {
    const onChange = jest.fn();
    render(<RunnersDiamond value={null} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "一塁" }));
    expect(onChange).toHaveBeenCalledWith("first");
  });

  it("塁を追加タップで複合 enum になる", () => {
    const onChange = jest.fn();
    render(<RunnersDiamond value="first" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "三塁" }));
    expect(onChange).toHaveBeenCalledWith("first_third");
  });

  it("最後の 1 塁を OFF にすると no_runner（未入力には戻らない）", () => {
    const onChange = jest.fn();
    render(<RunnersDiamond value="second" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "二塁" }));
    expect(onChange).toHaveBeenCalledWith("no_runner");
  });

  it("no_runner はキャプション「無走者」で全塁 OFF", () => {
    render(<RunnersDiamond value="no_runner" onChange={jest.fn()} />);
    expect(screen.getByText("無走者")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "二塁" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("値があるときだけ「未入力に戻す」で null に戻せる", () => {
    const onChange = jest.fn();
    render(<RunnersDiamond value="no_runner" onChange={onChange} />);
    fireEvent.click(screen.getByText("未入力に戻す"));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("onChange 未指定なら表示専用（role=img、ボタンなし）", () => {
    render(<RunnersDiamond value="bases_loaded" />);
    expect(
      screen.getByRole("img", { name: "ランナー状況: 満塁" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
