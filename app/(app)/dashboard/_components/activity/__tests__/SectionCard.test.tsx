import { render, screen, within } from "@testing-library/react";
import SectionCard, { SectionEmpty, SectionError } from "../SectionCard";

describe("SectionCard", () => {
  it("見出しを名前に持つ region として中身を包む", () => {
    render(
      <SectionCard title="今月の積み上げ">
        <p>素振り 800本</p>
      </SectionCard>,
    );

    const section = screen.getByRole("region", { name: "今月の積み上げ" });
    expect(
      within(section).getByRole("heading", { name: "今月の積み上げ" }),
    ).toBeInTheDocument();
    expect(within(section).getByText("素振り 800本")).toBeInTheDocument();
  });

  it("補足説明は渡されたときだけ出す", () => {
    const { rerender } = render(
      <SectionCard title="練習ツール" description="回数を音で伝えます">
        <p>本体</p>
      </SectionCard>,
    );
    expect(screen.getByText("回数を音で伝えます")).toBeInTheDocument();

    rerender(
      <SectionCard title="練習ツール">
        <p>本体</p>
      </SectionCard>,
    );
    expect(screen.queryByText("回数を音で伝えます")).not.toBeInTheDocument();
  });
});

describe("空状態と取得失敗", () => {
  it("0件の案内は alert にしない", () => {
    render(<SectionEmpty message="まだ記録がありません" />);

    expect(screen.getByText("まだ記録がありません")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("取得失敗は alert として0件と区別できる", () => {
    render(<SectionError message="取得できませんでした" />);

    expect(screen.getByRole("alert")).toHaveTextContent("取得できませんでした");
  });
});
