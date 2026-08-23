import { fireEvent, render, screen } from "@testing-library/react";
import { PitchCourseSelector } from "../PitchCourseSelector";

describe("PitchCourseSelector", () => {
  it("radiogroup として 25 セルを描画する", () => {
    render(<PitchCourseSelector value={null} onChange={jest.fn()} />);
    expect(screen.getByRole("radiogroup", { name: "コース" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(25);
  });

  it("セルのタップで選択、選択済みセルの再タップで解除する", () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <PitchCourseSelector value={null} onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole("radio", { name: "真ん中（ストライク）" }));
    expect(onChange).toHaveBeenCalledWith(13);

    rerender(<PitchCourseSelector value={13} onChange={onChange} />);
    fireEvent.click(screen.getByRole("radio", { name: "真ん中（ストライク）" }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("選択中はラベルとクリアボタンを表示し、クリアで解除できる", () => {
    const onChange = jest.fn();
    render(<PitchCourseSelector value={1} onChange={onChange} />);
    expect(
      screen.getByText("高め・三塁側寄り（ボール）"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "クリア" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("矢印キーでフォーカスが上下左右に移動する（roving tabindex）", () => {
    render(<PitchCourseSelector value={13} onChange={jest.fn()} />);
    const center = screen.getByRole("radio", { name: "真ん中（ストライク）" });
    expect(center).toHaveAttribute("tabindex", "0");
    center.focus();
    fireEvent.keyDown(center, { key: "ArrowUp" });
    // 13 の1つ上は 8（真ん中の高め = ストライク）
    expect(document.activeElement).toHaveAttribute("data-course", "8");
  });

  it("未選択時は「未選択」を表示しクリアボタンを出さない", () => {
    render(<PitchCourseSelector value={null} onChange={jest.fn()} />);
    expect(screen.getByText("未選択")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "クリア" }),
    ).not.toBeInTheDocument();
  });
});
