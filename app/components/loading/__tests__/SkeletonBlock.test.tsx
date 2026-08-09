import { render } from "@testing-library/react";
import SkeletonBlock from "../SkeletonBlock";

describe("SkeletonBlock", () => {
  it("className で渡したサイズ指定を描画する", () => {
    const { container } = render(<SkeletonBlock className="h-24 w-full" />);

    expect(container.querySelector(".h-24.w-full")).not.toBeNull();
  });

  it("rounded 未指定時は rounded-lg を既定値として使う", () => {
    const { container } = render(<SkeletonBlock className="h-24 w-full" />);

    expect(container.querySelector(".rounded-lg")).not.toBeNull();
  });

  it("rounded を指定するとそのクラスを使う", () => {
    const { container } = render(
      <SkeletonBlock className="h-24 w-full" rounded="rounded-none" />,
    );

    expect(container.querySelector(".rounded-none")).not.toBeNull();
    expect(container.querySelector(".rounded-lg")).toBeNull();
  });
});
