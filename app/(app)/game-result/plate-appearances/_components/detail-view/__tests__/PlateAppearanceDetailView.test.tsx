import type { PlateAppearanceV2 } from "@app/interface/plateAppearanceV2";
import { fireEvent, render, screen } from "@testing-library/react";
import { PlateAppearanceDetailView } from "../PlateAppearanceDetailView";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const buildPlateAppearance = (
  overrides: Partial<PlateAppearanceV2> = {},
): PlateAppearanceV2 => ({
  id: 10,
  game_result_id: 5,
  user_id: 1,
  batter_box_number: 2,
  batting_result: "中安",
  plate_result_id: 7,
  hit_direction_id: 10,
  batting_position_id: null,
  out_type: null,
  hit_type: "single",
  swing_type: null,
  hit_location_x: "0.500",
  hit_location_y: "0.300",
  rbi: 0,
  run_scored: 1,
  stolen_bases: null,
  caught_stealing: null,
  final_balls: 3,
  final_strikes: 2,
  final_outs: 1,
  first_pitch_swing: false,
  runners_state: "first_second",
  inning: 7,
  pitch_course: 13,
  pitch_course_x: "0.500",
  pitch_course_y: "0.480",
  self_analysis_memo: "低めを我慢できた",
  opponent_memo: null,
  is_new_format: true,
  has_detail_data: true,
  created_at: "2026-08-01T00:00:00+09:00",
  updated_at: "2026-08-01T00:00:00+09:00",
  contact_quality: { id: 1, name: "芯", display_order: 1 },
  timing: { id: 2, name: "ジャスト", display_order: 2 },
  pitch_type: { id: 1, name: "ストレート系", display_order: 1 },
  pitcher: null,
  appearance_situation: null,
  ...overrides,
});

describe("PlateAppearanceDetailView", () => {
  beforeEach(() => {
    mockPush.mockClear();
    localStorage.clear();
  });

  it("フル記録の打席は各項目が表示される", () => {
    render(
      <PlateAppearanceDetailView
        plateAppearance={buildPlateAppearance()}
        currentUserId={1}
      />,
    );
    expect(screen.getByText("第2打席")).toBeInTheDocument();
    expect(screen.getByText("中安")).toBeInTheDocument();
    expect(screen.getByText("7回")).toBeInTheDocument();
    expect(screen.getByText("ヒット種別")).toBeInTheDocument();
    expect(screen.getByText("単打")).toBeInTheDocument();
    // BSO ボード・ダイヤモンドは表示専用（role=img）
    expect(
      screen.getByRole("img", { name: "カウント ボール3 ストライク2 アウト1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "ランナー状況: 一・二塁" }),
    ).toBeInTheDocument();
    expect(screen.getByText("真ん中（ストライク）")).toBeInTheDocument();
    // 打点 0 は未記録ではなく 0 のまま表示する
    const rbiRow = screen.getByText("打点").closest("div");
    expect(rbiRow).toHaveTextContent("0");
    expect(screen.getByText("低めを我慢できた")).toBeInTheDocument();
  });

  it("全 null の打席は未記録が表示され、条件付き行は出ない", () => {
    render(
      <PlateAppearanceDetailView
        plateAppearance={buildPlateAppearance({
          hit_type: null,
          out_type: null,
          swing_type: null,
          hit_direction_id: null,
          hit_location_x: null,
          hit_location_y: null,
          final_balls: null,
          final_strikes: null,
          final_outs: null,
          first_pitch_swing: null,
          runners_state: null,
          inning: null,
          pitch_course: null,
          rbi: null,
          run_scored: null,
          self_analysis_memo: null,
          contact_quality: null,
          timing: null,
          pitch_type: null,
        })}
        currentUserId={1}
      />,
    );
    // 三振でない打席に「三振の種類」の行を出さない
    expect(screen.queryByText("三振の種類")).not.toBeInTheDocument();
    expect(screen.queryByText("ヒット種別")).not.toBeInTheDocument();
    // メモが無ければセクションごと出さない
    expect(screen.queryByText("メモ")).not.toBeInTheDocument();
    // 未記録バッジ・未記録表示が出る
    expect(screen.getAllByText("未記録").length).toBeGreaterThan(0);
  });

  it("三振 (plate_result_id=13) では三振の種類を表示する", () => {
    render(
      <PlateAppearanceDetailView
        plateAppearance={buildPlateAppearance({
          plate_result_id: 13,
          hit_type: null,
          swing_type: "swinging",
          batting_result: "空振り三振",
        })}
        currentUserId={1}
      />,
    );
    expect(screen.getByText("三振の種類")).toBeInTheDocument();
    expect(screen.getByText("空振り")).toBeInTheDocument();
  });

  it("旧形式の打席にはバナーを表示する", () => {
    render(
      <PlateAppearanceDetailView
        plateAppearance={buildPlateAppearance({ is_new_format: false })}
        currentUserId={1}
      />,
    );
    expect(
      screen.getByText(
        "旧形式で記録された打席です。詳細項目は記録されていません",
      ),
    ).toBeInTheDocument();
  });

  it("記録者本人には編集ボタンが出て、localStorage をセットして編集画面へ遷移する", () => {
    render(
      <PlateAppearanceDetailView
        plateAppearance={buildPlateAppearance()}
        currentUserId={1}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "この打席を編集" }));
    expect(localStorage.getItem("gameResultId")).toBe("5");
    expect(mockPush).toHaveBeenCalledWith(
      "/game-result/plate-appearances/10/edit",
    );
  });

  it("他人の打席では編集ボタンを出さない", () => {
    render(
      <PlateAppearanceDetailView
        plateAppearance={buildPlateAppearance()}
        currentUserId={99}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "この打席を編集" }),
    ).not.toBeInTheDocument();
  });
});
