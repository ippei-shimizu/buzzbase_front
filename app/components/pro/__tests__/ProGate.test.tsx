const openMock = jest.fn();
const closeMock = jest.fn();

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({ open: openMock, close: closeMock }),
}));

jest.mock("@app/hooks/pro/useEntitlement", () => ({
  useEntitlement: jest.fn(),
}));

import { render, screen, fireEvent } from "@testing-library/react";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import ProGate from "../ProGate";

const mockUseEntitlement = useEntitlement as jest.MockedFunction<
  typeof useEntitlement
>;

function mockEntitlement(granted: boolean) {
  mockUseEntitlement.mockReturnValue({
    isPro: granted,
    inTrial: false,
    inGracePeriod: false,
    hasEntitlement: jest.fn(() => granted),
  });
}

describe("ProGate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("entitlement を持つ場合、children をそのまま表示する", () => {
    mockEntitlement(true);

    render(
      <ProGate feature="season_transition_graph">
        <div>Pro Content</div>
      </ProGate>,
    );

    expect(screen.getByText("Pro Content")).toBeInTheDocument();
  });

  it("entitlement を持たない場合、children も fallback も無ければ何も描画しない", () => {
    mockEntitlement(false);

    render(
      <ProGate feature="season_transition_graph">
        <div>Pro Content</div>
      </ProGate>,
    );

    expect(screen.queryByText("Pro Content")).not.toBeInTheDocument();
  });

  it("entitlement を持たない場合、fallback を表示する", () => {
    mockEntitlement(false);

    render(
      <ProGate
        feature="season_transition_graph"
        fallback={<div>Locked Notice</div>}
      >
        <div>Pro Content</div>
      </ProGate>,
    );

    expect(screen.getByText("Locked Notice")).toBeInTheDocument();
    expect(screen.queryByText("Pro Content")).not.toBeInTheDocument();
  });

  it("renderLockedTrigger 経由でクリックすると ProUpgradeModal が feature 付きで開く", () => {
    mockEntitlement(false);

    render(
      <ProGate
        feature="season_transition_graph"
        renderLockedTrigger={(open) => (
          <button type="button" onClick={open}>
            ロック解除
          </button>
        )}
      >
        <div>Pro Content</div>
      </ProGate>,
    );

    fireEvent.click(screen.getByText("ロック解除"));

    expect(openMock).toHaveBeenCalledWith({
      trigger: "season_transition_graph",
    });
  });
});
