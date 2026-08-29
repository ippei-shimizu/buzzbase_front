import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ProUpgradeModalProvider,
  useProUpgradeModal,
} from "../proUpgradeModalContext";

const mockCapture = jest.fn();
jest.mock("@app/utils/posthog", () => ({
  capture: (...args: unknown[]) => mockCapture(...args),
}));

jest.mock("@app/components/pro/ProUpgradeModal", () => ({
  __esModule: true,
  default: () => null,
}));

function OpenButtons() {
  const { open } = useProUpgradeModal();
  return (
    <>
      <button
        type="button"
        onClick={() => open({ trigger: "pitch_type_average" })}
      >
        機能から開く
      </button>
      <button type="button" onClick={() => open()}>
        CTA から開く
      </button>
    </>
  );
}

const renderWithProvider = () =>
  render(
    <ProUpgradeModalProvider>
      <OpenButtons />
    </ProUpgradeModalProvider>,
  );

describe("Pro 訴求モーダルの計測", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("機能起点で開いたときは pro feature tapped をその機能名で送る", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText("機能から開く"));

    expect(mockCapture).toHaveBeenCalledWith("pro feature tapped", {
      feature: "pitch_type_average",
    });
  });

  it("機能非依存の CTA から開いたときは general として送る", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText("CTA から開く"));

    expect(mockCapture).toHaveBeenCalledWith("pro feature tapped", {
      feature: "general",
    });
  });
});
