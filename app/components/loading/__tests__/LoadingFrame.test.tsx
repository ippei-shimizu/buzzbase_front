import { render, screen } from "@testing-library/react";
import LoadingFrame from "../LoadingFrame";

describe("LoadingFrame", () => {
  it("header と children を描画する", () => {
    render(
      <LoadingFrame header={<div>ヘッダー</div>} paddingTop="pt-12">
        <div>本文</div>
      </LoadingFrame>,
    );

    expect(screen.getByText("ヘッダー")).toBeVisible();
    expect(screen.getByText("本文")).toBeVisible();
  });

  it("paddingTop で渡したクラスをコンテンツ側に適用する", () => {
    render(
      <LoadingFrame header={<div>ヘッダー</div>} paddingTop="pt-[74px]">
        <div>本文</div>
      </LoadingFrame>,
    );

    expect(screen.getByText("本文").parentElement).toHaveClass("pt-[74px]");
  });
});
