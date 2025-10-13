import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResultsSelectBox from "../ResultsSelectBox";

describe("ResultsSelectBox", () => {
  const mockOnChange = jest.fn();

  const defaultProps = {
    data: [],
    ariaLabel: "Year select",
    onChange: mockOnChange,
    propsYears: [2023, 2024, 2025],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SelectBoxが正しくレンダリングされる", () => {
    render(<ResultsSelectBox {...defaultProps} />);

    // aria-labelでSelectコンポーネントを見つける
    const select = screen.getByLabelText("Year select");
    expect(select).toBeInTheDocument();
  });

  it("propsYearsの年が選択肢として描画される", () => {
    const { container } = render(<ResultsSelectBox {...defaultProps} />);

    // hidden selectタグ内に年の選択肢が存在することを確認
    const options = container.querySelectorAll("option");
    const optionValues = Array.from(options).map((opt) =>
      opt.getAttribute("value"),
    );

    expect(optionValues).toContain("2023");
    expect(optionValues).toContain("2024");
    expect(optionValues).toContain("2025");
  });

  it("空のpropsYearsでもエラーなくレンダリングされる", () => {
    render(<ResultsSelectBox {...defaultProps} propsYears={[]} />);

    const select = screen.getByLabelText("Year select");
    expect(select).toBeInTheDocument();
  });

  it("variantプロパティが正しく適用される", () => {
    render(<ResultsSelectBox {...defaultProps} variant="bordered" />);

    const select = screen.getByLabelText("Year select");
    expect(select).toBeInTheDocument();
  });

  it("colorプロパティが正しく適用される", () => {
    render(<ResultsSelectBox {...defaultProps} color="primary" />);

    const select = screen.getByLabelText("Year select");
    expect(select).toBeInTheDocument();
  });

  it("sizeプロパティが正しく適用される", () => {
    render(<ResultsSelectBox {...defaultProps} size="lg" />);

    const select = screen.getByLabelText("Year select");
    expect(select).toBeInTheDocument();
  });

  it("radiusプロパティが正しく適用される", () => {
    render(<ResultsSelectBox {...defaultProps} radius="full" />);

    const select = screen.getByLabelText("Year select");
    expect(select).toBeInTheDocument();
  });

  it("labelPlacementプロパティが正しく適用される", () => {
    render(<ResultsSelectBox {...defaultProps} labelPlacement="outside" />);

    const select = screen.getByLabelText("Year select");
    expect(select).toBeInTheDocument();
  });

  it("classNameが正しく適用される", () => {
    const { container } = render(
      <ResultsSelectBox {...defaultProps} className="custom-class" />,
    );

    // classNameが適用されていることを確認
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("selectedKeysプロパティが正しく適用される", () => {
    render(<ResultsSelectBox {...defaultProps} selectedKeys={["2024"]} />);

    const select = screen.getByLabelText("Year select");
    expect(select).toBeInTheDocument();
  });
});
