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
    home_run_type: null,
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

const NO_DETAIL_PROPERTIES = {
  is_edit: true,
  has_hit_direction: false,
  has_detail: false,
  has_pitcher: false,
  has_count: false,
  has_situation: false,
  has_first_pitch_swing: false,
  has_contact_quality: false,
  has_timing: false,
  has_pitch_type: false,
  has_pitch_course: false,
  has_memo: false,
};

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
    expect(mockCapture).toHaveBeenCalledWith(
      "plate appearance completed",
      NO_DETAIL_PROPERTIES,
    );
  });

  it("入力した詳細の項目だけフラグを true にして送る", async () => {
    const user = userEvent.setup();
    render(
      <PlateAppearanceWizard
        gameResultId={1}
        batterBoxNumber={1}
        onCompleted={jest.fn()}
        editingPlateAppearance={buildEditingPlateAppearance({
          hit_direction_id: 3,
          final_balls: 2,
          first_pitch_swing: true,
          contact_quality: {
            id: 1,
            name: "芯",
          } as PlateAppearanceV2["contact_quality"],
          timing: { id: 2, name: "早い" } as PlateAppearanceV2["timing"],
          pitch_type: {
            id: 3,
            name: "直球",
          } as PlateAppearanceV2["pitch_type"],
          self_analysis_memo: "初球から振れた",
        })}
      />,
    );

    await user.click(screen.getByText("この打席を更新"));

    await waitFor(() =>
      expect(mockCapture).toHaveBeenCalledWith("plate appearance completed", {
        ...NO_DETAIL_PROPERTIES,
        has_detail: true,
        has_hit_direction: true,
        has_count: true,
        has_first_pitch_swing: true,
        has_contact_quality: true,
        has_timing: true,
        has_pitch_type: true,
        has_memo: true,
      }),
    );
  });

  it.each([
    ["final_balls", { final_balls: 2 }, "has_count"],
    ["final_strikes", { final_strikes: 1 }, "has_count"],
    ["final_outs", { final_outs: 2 }, "has_count"],
    ["runners_state", { runners_state: "first" }, "has_situation"],
    ["inning", { inning: 3 }, "has_situation"],
    [
      "appearance_situation",
      { appearance_situation: { id: 1, name: "先発" } },
      "has_situation",
    ],
    [
      "first_pitch_swing",
      { first_pitch_swing: false },
      "has_first_pitch_swing",
    ],
    [
      "contact_quality",
      { contact_quality: { id: 1, name: "芯" } },
      "has_contact_quality",
    ],
    ["timing", { timing: { id: 2, name: "早い" } }, "has_timing"],
    ["pitch_type", { pitch_type: { id: 3, name: "直球" } }, "has_pitch_type"],
    ["pitch_course", { pitch_course: 5 }, "has_pitch_course"],
    ["pitcher", { pitcher: { id: 9, name: "投手" } }, "has_pitcher"],
    [
      "self_analysis_memo",
      { self_analysis_memo: "初球から振れた" },
      "has_memo",
    ],
  ] as const)(
    "%s だけ入力されていると %s と has_detail だけ true で送る",
    async (_field, overrides, flag) => {
      const user = userEvent.setup();
      render(
        <PlateAppearanceWizard
          gameResultId={1}
          batterBoxNumber={1}
          onCompleted={jest.fn()}
          editingPlateAppearance={buildEditingPlateAppearance(
            overrides as Partial<PlateAppearanceV2>,
          )}
        />,
      );

      await user.click(screen.getByText("この打席を更新"));

      await waitFor(() =>
        expect(mockCapture).toHaveBeenCalledWith("plate appearance completed", {
          ...NO_DETAIL_PROPERTIES,
          has_detail: true,
          [flag]: true,
        }),
      );
    },
  );

  it("メモが空文字なら未入力として has_memo / has_detail を false で送る", async () => {
    const user = userEvent.setup();
    render(
      <PlateAppearanceWizard
        gameResultId={1}
        batterBoxNumber={1}
        onCompleted={jest.fn()}
        editingPlateAppearance={buildEditingPlateAppearance({
          self_analysis_memo: "",
        })}
      />,
    );

    await user.click(screen.getByText("この打席を更新"));

    await waitFor(() =>
      expect(mockCapture).toHaveBeenCalledWith(
        "plate appearance completed",
        NO_DETAIL_PROPERTIES,
      ),
    );
  });

  it("コースだけ入力されていても has_detail は true で送る", async () => {
    const user = userEvent.setup();
    render(
      <PlateAppearanceWizard
        gameResultId={1}
        batterBoxNumber={1}
        onCompleted={jest.fn()}
        editingPlateAppearance={buildEditingPlateAppearance({
          pitch_course: 5,
        })}
      />,
    );

    await user.click(screen.getByText("この打席を更新"));

    await waitFor(() =>
      expect(mockCapture).toHaveBeenCalledWith("plate appearance completed", {
        ...NO_DETAIL_PROPERTIES,
        has_detail: true,
        has_pitch_course: true,
      }),
    );
  });

  it("打球方向だけ入力されていても has_detail は false のまま送る", async () => {
    const user = userEvent.setup();
    render(
      <PlateAppearanceWizard
        gameResultId={1}
        batterBoxNumber={1}
        onCompleted={jest.fn()}
        editingPlateAppearance={buildEditingPlateAppearance({
          hit_direction_id: 3,
        })}
      />,
    );

    await user.click(screen.getByText("この打席を更新"));

    await waitFor(() =>
      expect(mockCapture).toHaveBeenCalledWith("plate appearance completed", {
        ...NO_DETAIL_PROPERTIES,
        has_hit_direction: true,
      }),
    );
  });

  it("方向だけ持つ打席を方向なしの結果に選び直すと has_hit_direction を false で送る", async () => {
    const user = userEvent.setup();
    render(
      <PlateAppearanceWizard
        gameResultId={1}
        batterBoxNumber={1}
        onCompleted={jest.fn()}
        editingPlateAppearance={buildEditingPlateAppearance({
          hit_direction_id: 3,
        })}
      />,
    );

    await user.click(screen.getByText("四球"));
    await user.click(screen.getByText("この打席を更新"));

    await waitFor(() =>
      expect(mockCapture).toHaveBeenCalledWith(
        "plate appearance completed",
        NO_DETAIL_PROPERTIES,
      ),
    );
    expect(mockUpdate).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ hit_direction_id: null }),
    );
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
        ...NO_DETAIL_PROPERTIES,
        has_pitcher: true,
        has_detail: true,
        has_situation: true,
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
        ...NO_DETAIL_PROPERTIES,
        has_pitcher: true,
        has_detail: true,
      }),
    );
  });

  it("モーダルで走本塁打を選ぶと home_run_type を付けて送る", async () => {
    const user = userEvent.setup();
    render(
      <PlateAppearanceWizard
        gameResultId={1}
        batterBoxNumber={1}
        onCompleted={jest.fn()}
        editingPlateAppearance={buildEditingPlateAppearance({
          hit_location_x: "0.500",
          hit_location_y: "0.300",
        })}
      />,
    );

    await user.click(screen.getByText("ヒット"));
    await user.click(screen.getByText("走本塁打"));
    await user.click(screen.getByText("この打席を更新"));

    await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
    expect(mockUpdate).toHaveBeenCalledWith(
      7,
      expect.objectContaining({
        plate_result_id: 10,
        hit_type: "home_run",
        home_run_type: "inside_the_park",
      }),
    );
  });

  it("走本塁打から二塁打へ選び直すと home_run_type が null に戻る", async () => {
    const user = userEvent.setup();
    render(
      <PlateAppearanceWizard
        gameResultId={1}
        batterBoxNumber={1}
        onCompleted={jest.fn()}
        editingPlateAppearance={buildEditingPlateAppearance({
          plate_result_id: 10,
          hit_type: "home_run",
          home_run_type: "inside_the_park",
          hit_location_x: "0.500",
          hit_location_y: "0.300",
        })}
      />,
    );

    await user.click(screen.getByText("ヒット"));
    await user.click(screen.getByText("二塁打"));
    await user.click(screen.getByText("この打席を更新"));

    await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
    expect(mockUpdate).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ hit_type: "double", home_run_type: null }),
    );
  });

  it("走本塁打の打席を編集して更新すると home_run_type を維持したまま送る", async () => {
    const user = userEvent.setup();
    render(
      <PlateAppearanceWizard
        gameResultId={1}
        batterBoxNumber={1}
        onCompleted={jest.fn()}
        editingPlateAppearance={buildEditingPlateAppearance({
          plate_result_id: 10,
          hit_type: "home_run",
          home_run_type: "inside_the_park",
        })}
      />,
    );

    await user.click(screen.getByText("この打席を更新"));

    await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
    expect(mockUpdate).toHaveBeenCalledWith(
      7,
      expect.objectContaining({
        plate_result_id: 10,
        hit_type: "home_run",
        home_run_type: "inside_the_park",
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
