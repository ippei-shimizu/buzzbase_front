import { render, screen } from "@testing-library/react";
import SeasonManageLink from "../SeasonManageLink";

describe("SeasonManageLink", () => {
  it("既定では「シーズンを管理」としてシーズン管理画面へリンクする", () => {
    render(<SeasonManageLink />);

    const link = screen.getByRole("link", { name: /シーズンを管理/ });
    expect(link).toHaveAttribute("href", "/seasons");
  });

  it("文言を差し替えても遷移先はシーズン管理画面のまま", () => {
    render(
      <SeasonManageLink label="シーズンがありません。シーズンを登録する" />,
    );

    const link = screen.getByRole("link", {
      name: /シーズンがありません。シーズンを登録する/,
    });
    expect(link).toHaveAttribute("href", "/seasons");
    expect(
      screen.queryByRole("link", { name: /^シーズンを管理$/ }),
    ).not.toBeInTheDocument();
  });
});
