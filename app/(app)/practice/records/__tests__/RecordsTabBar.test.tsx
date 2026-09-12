import { render, screen } from "@testing-library/react";
import RecordsTabBar from "../_components/RecordsTabBar";

describe("RecordsTabBar", () => {
  it("練習記録タブと野球ノートタブを ?tab= で切り替えるリンクにする", () => {
    render(<RecordsTabBar active="practice" />);

    expect(screen.getByRole("link", { name: "練習記録" })).toHaveAttribute(
      "href",
      "/practice/records",
    );
    expect(screen.getByRole("link", { name: "野球ノート" })).toHaveAttribute(
      "href",
      "/practice/records?tab=note",
    );
  });

  it("表示中のタブを aria-current で示す", () => {
    render(<RecordsTabBar active="note" />);

    expect(screen.getByRole("link", { name: "野球ノート" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "練習記録" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
