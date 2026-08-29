// HeroUI の Dropdown は jsdom で開けないため、選択肢をそのままボタンとして描画する。
jest.mock("../FilterChip", () => ({
  __esModule: true,
  default: ({
    label,
    options,
    onChange,
  }: {
    label: string;
    options: { key: string; label: string }[];
    onChange: (key: string) => void;
  }) => (
    <>
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
        >
          {label}: {option.label}
        </button>
      ))}
    </>
  ),
}));

import type { FilterValues } from "../filterTypes";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import FilterBar, { type FilterBarOptions } from "../FilterBar";
import { monthOptionsFromRecorded } from "../monthOptions";
import { yearOptionsFrom } from "../yearOptions";

const RECORDED_MONTHS = ["2026-06", "2026-04", "2025-09"];

const DEFAULT_OPTIONS: FilterBarOptions = {
  years: yearOptionsFrom([2026, 2025]),
  months: monthOptionsFromRecorded(RECORDED_MONTHS),
  matchTypes: [{ key: "regular", label: "公式戦" }],
  seasons: [{ key: "3", label: "春季" }],
  tournaments: [{ key: "7", label: "県大会" }],
};

/** 実画面と同じくフィルタ値を state で保持し、選択が次の描画に反映されるようにする。 */
function Harness({
  initialValues = {},
  options = DEFAULT_OPTIONS,
  resetTo,
  onValuesChange,
}: {
  initialValues?: FilterValues;
  options?: FilterBarOptions;
  resetTo?: FilterValues;
  onValuesChange?: (values: FilterValues) => void;
}) {
  const [values, setValues] = useState<FilterValues>(initialValues);
  return (
    <>
      <FilterBar
        values={values}
        onChange={(next) => {
          setValues(next);
          onValuesChange?.(next);
        }}
        options={options}
        resetTo={resetTo}
      />
      <output data-testid="values">{JSON.stringify(values)}</output>
    </>
  );
}

function currentValues(): FilterValues {
  return JSON.parse(screen.getByTestId("values").textContent ?? "{}");
}

describe("FilterBar", () => {
  it("月の選択肢は記録のある年月だけを出す", () => {
    render(<Harness />);

    expect(
      screen.getByRole("button", { name: "開始: 2026年6月" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "開始: 2026年4月" }),
    ).toBeInTheDocument();
    // 記録の無い月は候補に出さない（選んでも0件になるため）。
    expect(
      screen.queryByRole("button", { name: "開始: 2026年5月" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "終了: 2026年5月" }),
    ).not.toBeInTheDocument();
  });

  it("記録のある年月が無ければ月範囲チップを出さない", () => {
    render(<Harness options={{ ...DEFAULT_OPTIONS, months: [] }} />);

    expect(screen.queryByRole("button", { name: /^開始:/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /^終了:/ })).toBeNull();
  });

  it("開始月だけを選ぶと終了月も同月に揃う", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "開始: 2026年4月" }));

    expect(currentValues()).toEqual({
      startMonth: "2026-04",
      endMonth: "2026-04",
      year: undefined,
    });
  });

  it("終了月より後の開始月を選ぶと終了月が繰り下がる", async () => {
    const user = userEvent.setup();
    render(
      <Harness
        initialValues={{ startMonth: "2025-09", endMonth: "2026-04" }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "開始: 2026年6月" }));

    expect(currentValues()).toMatchObject({
      startMonth: "2026-06",
      endMonth: "2026-06",
    });
  });

  it("開始月より前の終了月を選ぶと開始月が繰り上がる", async () => {
    const user = userEvent.setup();
    render(
      <Harness
        initialValues={{ startMonth: "2026-06", endMonth: "2026-06" }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "終了: 2025年9月" }));

    expect(currentValues()).toMatchObject({
      startMonth: "2025-09",
      endMonth: "2025-09",
    });
  });

  it("開始月と終了月の順序が正しければ補正しない", async () => {
    const user = userEvent.setup();
    render(<Harness initialValues={{ startMonth: "2025-09" }} />);

    await user.click(screen.getByRole("button", { name: "終了: 2026年6月" }));

    expect(currentValues()).toMatchObject({
      startMonth: "2025-09",
      endMonth: "2026-06",
    });
  });

  it("年度を選ぶと月範囲がリセットされる", async () => {
    const user = userEvent.setup();
    render(
      <Harness
        initialValues={{ startMonth: "2026-04", endMonth: "2026-06" }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "年度: 2026" }));

    expect(currentValues()).toEqual({
      year: "2026",
      startMonth: undefined,
      endMonth: undefined,
    });
  });

  it("月範囲を選ぶと年度がリセットされる", async () => {
    const user = userEvent.setup();
    render(<Harness initialValues={{ year: "2025" }} />);

    await user.click(screen.getByRole("button", { name: "開始: 2026年6月" }));

    expect(currentValues()).toMatchObject({ startMonth: "2026-06" });
    expect(currentValues().year).toBeUndefined();
  });

  it("年度を通算に戻しても月範囲は保持する", async () => {
    const user = userEvent.setup();
    render(
      <Harness
        initialValues={{ startMonth: "2026-04", endMonth: "2026-06" }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "年度: 通算" }));

    expect(currentValues()).toEqual({
      startMonth: "2026-04",
      endMonth: "2026-06",
    });
  });

  it("大会を選ぶと tournamentId が入り、全てに戻すと外れる", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "大会: 県大会" }));
    expect(currentValues()).toMatchObject({ tournamentId: "7" });

    await user.click(screen.getByRole("button", { name: "大会: 全て" }));
    expect(currentValues().tournamentId).toBeUndefined();
  });

  it("絞り込みが無いときはクリアボタンを出さない", () => {
    render(<Harness />);

    expect(
      screen.queryByRole("button", { name: "フィルターをクリア" }),
    ).not.toBeInTheDocument();
  });

  it("クリアで全ての絞り込みが初期化される", async () => {
    const user = userEvent.setup();
    render(
      <Harness
        initialValues={{
          year: "2026",
          matchType: "regular",
          seasonId: "3",
          tournamentId: "7",
          startMonth: "2026-04",
          endMonth: "2026-06",
        }}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "フィルターをクリア" }),
    );

    expect(currentValues()).toEqual({});
  });

  describe("resetTo でリセット先を変えたとき", () => {
    const RESET_TO: FilterValues = { year: "2026" };

    it("リセット先と同じ値ならクリアボタンを出さない", () => {
      render(<Harness initialValues={{ year: "2026" }} resetTo={RESET_TO} />);

      expect(
        screen.queryByRole("button", { name: "フィルターをクリア" }),
      ).not.toBeInTheDocument();
    });

    it("リセット先から動いていればクリアボタンを出す", () => {
      render(
        <Harness
          initialValues={{ year: "2026", tournamentId: "7" }}
          resetTo={RESET_TO}
        />,
      );

      expect(
        screen.getByRole("button", { name: "フィルターをクリア" }),
      ).toBeInTheDocument();
    });

    it("クリアで全解除ではなくリセット先に戻る", async () => {
      const user = userEvent.setup();
      render(
        <Harness
          initialValues={{
            year: undefined,
            startMonth: "2026-04",
            endMonth: "2026-06",
            tournamentId: "7",
          }}
          resetTo={RESET_TO}
        />,
      );

      await user.click(
        screen.getByRole("button", { name: "フィルターをクリア" }),
      );

      expect(currentValues()).toEqual({ year: "2026" });
    });
  });

  it("選択肢が無いチップは描画しない", () => {
    render(
      <Harness
        options={{ years: yearOptionsFrom([2026]) }}
        initialValues={{}}
      />,
    );

    expect(
      screen.getByRole("button", { name: "年度: 2026" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^種別:/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /^シーズン:/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /^大会:/ })).toBeNull();
  });
});
