import { render, screen } from "@testing-library/react";
import SeasonsContent from "../_components/SeasonsContent";

jest.mock("../_components/SeasonsList", () => {
  return function SeasonsList() {
    return <div data-testid="seasons-list" />;
  };
});

describe("SeasonsContent", () => {
  it("「シーズン管理とは」の説明を開閉操作なしで表示する", () => {
    render(<SeasonsContent initialSeasons={[]} />);

    expect(screen.getByText("シーズン管理とは")).toBeVisible();
    expect(
      screen.getByText(/試合記録を期間（シーズン）ごとにまとめる機能です/),
    ).toBeVisible();
    expect(
      screen.getByText(
        /試合結果の登録時にシーズンを選択すると、成績や試合一覧をシーズンごとに絞り込めます/,
      ),
    ).toBeVisible();
  });

  it("説明を開くためのトリガーは存在しない", () => {
    render(<SeasonsContent initialSeasons={[]} />);

    expect(
      screen.queryByRole("button", { name: "シーズンについて" }),
    ).not.toBeInTheDocument();
  });

  it("活用例を一覧で表示する", () => {
    render(<SeasonsContent initialSeasons={[]} />);

    expect(screen.getByText("活用例")).toBeVisible();
    expect(
      screen.getByText("「新チーム」「旧チーム」で世代ごとに分ける"),
    ).toBeVisible();
  });
});
