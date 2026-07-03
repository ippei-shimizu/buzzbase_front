import {
  monthOptionsFromRecorded,
  UNSET_MONTH_OPTION,
} from "@app/utils/buildMonthOptions";

describe("monthOptionsFromRecorded", () => {
  it("記録のある年月だけを先頭「指定なし」付きで、渡された順に返す", () => {
    expect(monthOptionsFromRecorded(["2026-06", "2026-05", "2025-12"])).toEqual(
      [
        UNSET_MONTH_OPTION,
        { key: "2026-06", label: "2026年6月" },
        { key: "2026-05", label: "2026年5月" },
        { key: "2025-12", label: "2025年12月" },
      ],
    );
  });

  it("記録が無いときは「指定なし」のみ返す", () => {
    expect(monthOptionsFromRecorded([])).toEqual([UNSET_MONTH_OPTION]);
  });
});
