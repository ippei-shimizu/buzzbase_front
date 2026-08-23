import { fireEvent, render, screen } from "@testing-library/react";
import { BSOBoard } from "../BSOBoard";

describe("BSOBoard", () => {
  it("入力モードではドットタップで値を通知する", () => {
    const onChange = jest.fn();
    render(<BSOBoard balls={null} strikes={null} outs={null} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "ボール 2" }));
    expect(onChange).toHaveBeenCalledWith("balls", 2);
  });

  it("点灯済み最後尾の再タップで 1 段下げる", () => {
    const onChange = jest.fn();
    render(<BSOBoard balls={2} strikes={1} outs={0} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "ボール 2" }));
    expect(onChange).toHaveBeenCalledWith("balls", 1);
  });

  it("onChange 未指定なら表示専用（role=img、ボタンなし）", () => {
    render(<BSOBoard balls={3} strikes={2} outs={1} />);
    expect(
      screen.getByRole("img", {
        name: "カウント ボール3 ストライク2 アウト1",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("表示専用で null は未記録としてラベルに出す", () => {
    render(<BSOBoard balls={null} strikes={null} outs={null} />);
    expect(
      screen.getByRole("img", {
        name: "カウント ボール未記録 ストライク未記録 アウト未記録",
      }),
    ).toBeInTheDocument();
  });
});
