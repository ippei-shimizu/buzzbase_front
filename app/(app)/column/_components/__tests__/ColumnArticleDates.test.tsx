import { render, screen } from "@testing-library/react";
import ColumnArticleDates from "../ColumnArticleDates";

describe("ColumnArticleDates", () => {
  it("公開日と更新日を西暦のゼロ埋め無し表記で表示し、time に ISO 日付を残す", () => {
    render(
      <ColumnArticleDates publishedAt="2026-03-24" updatedAt="2026-09-04" />,
    );

    const published = screen.getByText("公開日 2026年3月24日");
    const updated = screen.getByText("更新日 2026年9月4日");
    expect(published).toHaveAttribute("datetime", "2026-03-24");
    expect(updated).toHaveAttribute("datetime", "2026-09-04");
  });

  it("YYYY-MM-DD 以外の日付は壊れた表示を出さずに落とす", () => {
    expect(() =>
      render(
        <ColumnArticleDates publishedAt="2026/03/24" updatedAt="2026-09-04" />,
      ),
    ).toThrow("公開日・更新日は YYYY-MM-DD で指定してください: 2026/03/24");
  });
});
