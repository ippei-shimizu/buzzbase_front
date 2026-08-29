import { render, screen } from "@testing-library/react";
import AvailabilityBadge from "../AvailabilityBadge";
import { APP_ONLY_LABEL } from "../proFeatureCatalog";

/**
 * 代表機能・訴求機能はすべて Web 提供済みになったため、LP の各セクションのテストでは
 * 「バッジが出ないこと」しか確認できない。バッジを描く側の挙動はここで直接固定する。
 */
describe("AvailabilityBadge", () => {
  it("app_only の機能にラベルを出す", () => {
    render(<AvailabilityBadge availability="app_only" />);
    expect(screen.getByText(APP_ONLY_LABEL)).toBeInTheDocument();
  });

  it("web_and_app の機能には何も描画しない", () => {
    const { container } = render(
      <AvailabilityBadge availability="web_and_app" />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
