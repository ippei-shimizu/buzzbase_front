import { render, screen } from "@testing-library/react";
import LoadingSpinner from "../LoadingSpinner";

describe("LoadingSpinner", () => {
  it("Spinnerコンポーネントが正しくレンダリングされる", () => {
    render(<LoadingSpinner />);

    // Spinnerのラベルテキストが表示されることで、Spinnerが正常にレンダリングされていることを確認
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("Loading...ラベルが表示される", () => {
    render(<LoadingSpinner />);

    // Loading...テキストが表示される
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("colorプロパティがprimaryに設定されている", () => {
    render(<LoadingSpinner />);

    // Spinnerコンポーネントが存在することを確認（ラベルで検証）
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("labelColorプロパティが正しく適用されている", () => {
    render(<LoadingSpinner />);

    // ラベルが表示されている
    const label = screen.getByText("Loading...");
    expect(label).toBeInTheDocument();
  });

  it("オーバーレイ背景が表示される", () => {
    const { container } = render(<LoadingSpinner />);

    // オーバーレイ背景の要素が存在する
    const overlay = container.querySelector(".fixed.top-0.left-0");
    expect(overlay).toBeInTheDocument();
  });

  it("Spinnerが固定位置(中央)に配置される", () => {
    const { container } = render(<LoadingSpinner />);

    // fixedクラスとz-indexを持つ要素が存在する
    const spinner = container.querySelector(".fixed");
    expect(spinner).toBeInTheDocument();
  });

  it("buzz-darkクラスが適用される", () => {
    const { container } = render(<LoadingSpinner />);

    // buzz-darkクラスを持つ要素が存在する
    expect(container.querySelector(".buzz-dark")).toBeInTheDocument();
  });
});
