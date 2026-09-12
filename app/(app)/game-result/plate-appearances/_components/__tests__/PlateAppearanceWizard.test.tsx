import type { PlateAppearanceV2 } from "@app/interface/plateAppearanceV2";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlateAppearanceWizard } from "../PlateAppearanceWizard";

const mockCapture = jest.fn();
jest.mock("@app/utils/posthog", () => ({
  capture: (...args: unknown[]) => mockCapture(...args),
}));

const mockCreate = jest.fn();
const mockUpdate = jest.fn();
jest.mock("@app/services/v2/plateAppearanceService", () => ({
  createPlateAppearanceV2: (...args: unknown[]) => mockCreate(...args),
  updatePlateAppearanceV2: (...args: unknown[]) => mockUpdate(...args),
}));

const buildEditingPlateAppearance = (
  overrides: Partial<PlateAppearanceV2> = {},
): PlateAppearanceV2 =>
  ({
    id: 7,
    game_result_id: 1,
    batter_box_number: 1,
    plate_result_id: 1,
    hit_direction_id: null,
    hit_location_x: null,
    hit_location_y: null,
    out_type: null,
    hit_type: null,
    swing_type: null,
    rbi: 0,
    run_scored: 0,
    stolen_bases: 0,
    caught_stealing: 0,
    final_balls: null,
    final_strikes: null,
    final_outs: null,
    first_pitch_swing: null,
    runners_state: null,
    inning: null,
    self_analysis_memo: null,
    contact_quality: null,
    timing: null,
    pitch_type: null,
    pitcher: null,
    appearance_situation: null,
    ...overrides,
  }) as PlateAppearanceV2;

describe("打席記録ウィザードの計測", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockResolvedValue({ ok: true });
    mockUpdate.mockResolvedValue({ ok: true });
  });

  it("打席を保存すると plate appearance completed を送る", async () => {
    const user = userEvent.setup();
    const onCompleted = jest.fn();
    render(
      <PlateAppearanceWizard
        gameResultId={1}
        batterBoxNumber={1}
        onCompleted={onCompleted}
        editingPlateAppearance={buildEditingPlateAppearance()}
      />,
    );

    await user.click(screen.getByText("この打席を更新"));

    await waitFor(() => expect(onCompleted).toHaveBeenCalled());
    expect(mockCapture).toHaveBeenCalledWith("plate appearance completed", {
      is_edit: true,
      has_pitcher: false,
      has_detail: false,
    });
  });

  it("詳細と対戦投手が入力済みなら has_pitcher / has_detail を true で送る", async () => {
    const user = userEvent.setup();
    render(
      <PlateAppearanceWizard
        gameResultId={1}
        batterBoxNumber={1}
        onCompleted={jest.fn()}
        editingPlateAppearance={buildEditingPlateAppearance({
          inning: 3,
          pitcher: { id: 9, name: "投手" } as PlateAppearanceV2["pitcher"],
        })}
      />,
    );

    await user.click(screen.getByText("この打席を更新"));

    await waitFor(() =>
      expect(mockCapture).toHaveBeenCalledWith("plate appearance completed", {
        is_edit: true,
        has_pitcher: true,
        has_detail: true,
      }),
    );
  });

  it("対戦投手だけ入力されていても has_detail は true で送る", async () => {
    const user = userEvent.setup();
    render(
      <PlateAppearanceWizard
        gameResultId={1}
        batterBoxNumber={1}
        onCompleted={jest.fn()}
        editingPlateAppearance={buildEditingPlateAppearance({
          pitcher: { id: 9, name: "投手" } as PlateAppearanceV2["pitcher"],
        })}
      />,
    );

    await user.click(screen.getByText("この打席を更新"));

    await waitFor(() =>
      expect(mockCapture).toHaveBeenCalledWith("plate appearance completed", {
        is_edit: true,
        has_pitcher: true,
        has_detail: true,
      }),
    );
  });

  it("保存せず画面を離れると plate appearance canceled を送る", () => {
    const { unmount } = render(
      <PlateAppearanceWizard
        gameResultId={1}
        batterBoxNumber={1}
        onCompleted={jest.fn()}
      />,
    );

    unmount();

    expect(mockCapture).toHaveBeenCalledWith("plate appearance canceled", {
      is_edit: false,
    });
  });

  it("保存して離れたときは途中離脱として計測しない", async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <PlateAppearanceWizard
        gameResultId={1}
        batterBoxNumber={1}
        onCompleted={jest.fn()}
        editingPlateAppearance={buildEditingPlateAppearance()}
      />,
    );

    await user.click(screen.getByText("この打席を更新"));
    await waitFor(() => expect(mockCapture).toHaveBeenCalled());
    unmount();

    expect(mockCapture).not.toHaveBeenCalledWith(
      "plate appearance canceled",
      expect.anything(),
    );
  });
});
