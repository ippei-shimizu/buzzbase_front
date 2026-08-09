import { render } from "@testing-library/react";
import SkeletonList from "../SkeletonList";

describe("SkeletonList", () => {
  it("count で指定した件数の SkeletonBlock を描画する", () => {
    const { container } = render(
      <SkeletonList count={3} itemClassName="h-16 w-full" />,
    );

    expect(container.querySelectorAll(".h-16.w-full")).toHaveLength(3);
  });
});
