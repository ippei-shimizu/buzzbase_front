import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorForm from "../CalculatorForm";

const renderCalculator = (slug: string) => {
  const definition = getCalculatorDefinition(slug)!;
  render(
    <CalculatorForm
      fields={definition.fields}
      outputs={definition.outputs}
      calculate={definition.calculate}
    />,
  );
};

const fillAndCalculate = async (inputs: Record<string, string>) => {
  const user = userEvent.setup();
  for (const [label, value] of Object.entries(inputs)) {
    await user.type(screen.getByLabelText(label), value);
  }
  await user.click(screen.getByRole("button", { name: "計算する" }));
};

describe("CalculatorForm", () => {
  it("整数しか取り得ない項目に小数を入力すると計算せずにエラーを出す", async () => {
    renderCalculator("batting-average");

    await fillAndCalculate({ 安打数: "1.5", 打数: "2" });

    expect(
      screen.getByText("安打数には0以上の整数を入力してください"),
    ).toBeInTheDocument();
    expect(screen.queryByText(".750")).not.toBeInTheDocument();
  });

  it("整数を入力すると計算結果を表示する", async () => {
    renderCalculator("batting-average");

    await fillAndCalculate({ 安打数: "0", 打数: "15" });

    expect(screen.getByText(".000")).toBeInTheDocument();
  });

  it("小数を取り得る項目（投球回）は小数のまま計算できる", async () => {
    renderCalculator("era");

    await fillAndCalculate({ 自責点: "2", 投球回: "4.5" });

    expect(screen.getByText("4.00")).toBeInTheDocument();
  });
});
