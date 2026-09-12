import { render, screen } from "@testing-library/react";
import { SampleDataLabel } from "../SampleDataLabel";

describe("SampleDataLabel", () => {
  it("サンプルデータである旨を明示するテキストを表示する", () => {
    render(<SampleDataLabel />);

    expect(
      screen.getByText("サンプルデータ（実際の記録ではありません）"),
    ).toBeInTheDocument();
  });
});
