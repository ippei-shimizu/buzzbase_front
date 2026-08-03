import { render, screen } from "@testing-library/react";
import SeasonField from "../SeasonField";

const noop = () => {};

describe("SeasonField", () => {
  it("シーズンがあるときは管理画面への導線を表示する", () => {
    render(
      <SeasonField
        seasons={[{ id: 1, name: "2024年春季" }]}
        selectedSeason={null}
        onInputChange={noop}
        onSelectionChange={noop}
      />,
    );

    const link = screen.getByRole("link", { name: /シーズンを管理/ });
    expect(link).toHaveAttribute("href", "/seasons");
  });

  it("シーズンが0件のときは登録を促す文言で導線を表示する", () => {
    render(
      <SeasonField
        seasons={[]}
        selectedSeason={null}
        onInputChange={noop}
        onSelectionChange={noop}
      />,
    );

    const link = screen.getByRole("link", {
      name: /シーズンがありません。シーズンを登録する/,
    });
    expect(link).toHaveAttribute("href", "/seasons");
  });

  it("シーズン入力欄を描画する", () => {
    render(
      <SeasonField
        seasons={[]}
        selectedSeason={null}
        onInputChange={noop}
        onSelectionChange={noop}
      />,
    );

    expect(screen.getByPlaceholderText("シーズン名を入力")).toBeInTheDocument();
  });
});
