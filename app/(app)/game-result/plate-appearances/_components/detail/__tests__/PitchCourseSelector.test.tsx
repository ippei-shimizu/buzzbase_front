import { fireEvent, render, screen } from "@testing-library/react";
import { PitchCourseSelector } from "../PitchCourseSelector";

// jsdom はレイアウトを持たないため、コース図を 300x300 の矩形に見立てて座標を解決する。
const FIELD_SIZE = 300;

beforeEach(() => {
  jest.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    left: 0,
    top: 0,
    right: FIELD_SIZE,
    bottom: FIELD_SIZE,
    width: FIELD_SIZE,
    height: FIELD_SIZE,
  } as unknown as DOMRect);
});

afterEach(() => {
  jest.restoreAllMocks();
});

const tapField = (clientX: number, clientY: number) => {
  fireEvent.click(screen.getByRole("button", { name: /コース図/ }), {
    clientX,
    clientY,
  });
};

const pressKey = (key: string) => {
  fireEvent.keyDown(screen.getByRole("button", { name: /コース図/ }), { key });
};

describe("PitchCourseSelector", () => {
  it("未選択のまま矢印キーを押すと真ん中から1マス動いたコースを選ぶ", () => {
    const onChange = jest.fn();
    render(
      <PitchCourseSelector value={null} location={null} onChange={onChange} />,
    );

    pressKey("ArrowUp");

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ course: 8 }),
    );
  });

  it("矢印キーでは選択中のコースから上下左右に移動できる", () => {
    const onChange = jest.fn();
    render(
      <PitchCourseSelector
        value={13}
        location={{ x: 0.5, y: 0.5 }}
        onChange={onChange}
      />,
    );

    pressKey("ArrowRight");
    pressKey("ArrowDown");

    const courses = onChange.mock.calls.map(([selected]) => selected.course);
    expect(courses).toEqual([14, 18]);
  });

  it("端のコースで外へ向かう矢印キーを押しても範囲外にならない", () => {
    const onChange = jest.fn();
    render(
      <PitchCourseSelector
        value={1}
        location={{ x: 0.05, y: 0.05 }}
        onChange={onChange}
      />,
    );

    pressKey("ArrowUp");
    pressKey("ArrowLeft");

    const courses = onChange.mock.calls.map(([selected]) => selected.course);
    expect(courses).toEqual([1, 1]);
  });

  it("コース図の中央タップで真ん中のコースとタップ座標を返す", () => {
    const onChange = jest.fn();
    render(
      <PitchCourseSelector value={null} location={null} onChange={onChange} />,
    );

    tapField(150, 150);

    expect(onChange).toHaveBeenCalledWith({
      course: 13,
      location: { x: 0.5, y: 0.5 },
    });
  });

  it("同じマス内でも押した位置ごとに異なる座標を返す（自由入力）", () => {
    const onChange = jest.fn();
    render(
      <PitchCourseSelector value={null} location={null} onChange={onChange} />,
    );

    tapField(130, 150);
    tapField(170, 150);

    const [first, second] = onChange.mock.calls.map(([selected]) => selected);
    expect(first.course).toBe(13);
    expect(second.course).toBe(13);
    expect(first.location.x).not.toBe(second.location.x);
  });

  it("左上隅のタップは 1 番のコースになる", () => {
    const onChange = jest.fn();
    render(
      <PitchCourseSelector value={null} location={null} onChange={onChange} />,
    );

    tapField(10, 10);

    expect(onChange.mock.calls[0][0].course).toBe(1);
  });

  it("選択中はコースのラベルとクリアボタンを表示し、クリアで解除できる", () => {
    const onChange = jest.fn();
    render(
      <PitchCourseSelector
        value={1}
        location={{ x: 0.05, y: 0.05 }}
        onChange={onChange}
      />,
    );

    expect(screen.getByText("高め・三塁側寄り（ボール）")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "クリア" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("未選択時は「未選択」を表示しクリアボタンを出さない", () => {
    render(
      <PitchCourseSelector value={null} location={null} onChange={jest.fn()} />,
    );

    expect(screen.getByText("未選択")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "クリア" }),
    ).not.toBeInTheDocument();
  });
});
