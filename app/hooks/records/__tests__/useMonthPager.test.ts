import { act, renderHook } from "@testing-library/react";
import { useMonthPager } from "@app/hooks/records/useMonthPager";

interface Row {
  id: number;
  date: string;
}

const dateOf = (row: Row): string => row.date;

const rows: Row[] = [
  { id: 1, date: "2026-08-20" },
  { id: 2, date: "2026-08-05" },
  { id: 3, date: "2026-07-14" },
];

describe("useMonthPager", () => {
  it("初期状態は最新の月を指す", () => {
    const { result } = renderHook(() => useMonthPager(rows, dateOf));

    expect(result.current.months).toEqual(["2026-08", "2026-07"]);
    expect(result.current.month).toBe("2026-08");
    expect(result.current.items.map((row) => row.id)).toEqual([1, 2]);
  });

  it("index を増やすと古い月へ進む", () => {
    const { result } = renderHook(() => useMonthPager(rows, dateOf));

    act(() => result.current.goTo(1));

    expect(result.current.month).toBe("2026-07");
    expect(result.current.items.map((row) => row.id)).toEqual([3]);
  });

  it("範囲外のページ番号は最古の月へ丸める", () => {
    const { result } = renderHook(() => useMonthPager(rows, dateOf));

    act(() => result.current.goTo(99));

    expect(result.current.index).toBe(1);
    expect(result.current.month).toBe("2026-07");
    expect(result.current.items.map((row) => row.id)).toEqual([3]);
  });

  it("記録が減って月が消えても範囲外を指さない", () => {
    const { result, rerender } = renderHook(
      ({ items }: { items: Row[] }) => useMonthPager(items, dateOf),
      { initialProps: { items: rows } },
    );

    act(() => result.current.goTo(1));
    rerender({ items: rows.filter((row) => row.date.startsWith("2026-08")) });

    expect(result.current.index).toBe(0);
    expect(result.current.month).toBe("2026-08");
    expect(result.current.items.map((row) => row.id)).toEqual([1, 2]);
  });

  it("reset で最新の月へ戻る", () => {
    const { result } = renderHook(() => useMonthPager(rows, dateOf));

    act(() => result.current.goTo(1));
    act(() => result.current.reset());

    expect(result.current.month).toBe("2026-08");
  });

  it("記録が0件なら月を持たない", () => {
    const { result } = renderHook(() => useMonthPager([] as Row[], dateOf));

    expect(result.current.months).toEqual([]);
    expect(result.current.month).toBeNull();
    expect(result.current.items).toEqual([]);
  });
});
