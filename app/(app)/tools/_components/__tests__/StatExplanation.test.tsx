import { render, screen } from "@testing-library/react";
import StatExplanation from "../StatExplanation";

const baseProps = {
  explanation: "一段落目。\n\n二段落目。",
  formula: "打率 = 安打数 ÷ 打数",
  formulaExample: "例：100打数30安打なら .300",
  guide: [],
};

describe("StatExplanation の関連コラム", () => {
  it("relatedColumns があれば解説の直下にリンクを出す", () => {
    render(
      <StatExplanation
        {...baseProps}
        relatedColumns={[
          {
            label: "打率とは？",
            href: "/column/batting-average",
            description: "意味・計算方法・目安",
          },
        ]}
      />,
    );

    const link = screen.getByRole("link", { name: "打率とは？" });
    expect(link).toHaveAttribute("href", "/column/batting-average");
    expect(screen.getByText("意味・計算方法・目安")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "もっと詳しく", level: 3 }),
    ).toBeInTheDocument();
  });

  it("relatedColumns が無ければブロックごと出さない", () => {
    render(<StatExplanation {...baseProps} />);

    expect(screen.queryByText("もっと詳しく")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
