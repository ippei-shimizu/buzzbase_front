jest.mock("@app/services/v2/scheduleService", () => ({
  createSchedule: jest.fn(),
  updateSchedule: jest.fn(),
}));

const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockBack = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
    back: mockBack,
  }),
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockHasEntitlement = jest.fn(() => false);

jest.mock("@app/hooks/pro/useEntitlement", () => ({
  useEntitlement: () => ({
    isPro: false,
    inTrial: false,
    inGracePeriod: false,
    isLoading: false,
    hasEntitlement: mockHasEntitlement,
  }),
}));

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createSchedule } from "@app/services/v2/scheduleService";
import ScheduleFormContent from "../_components/ScheduleFormContent";

const mockCreate = createSchedule as jest.MockedFunction<typeof createSchedule>;

const TODAY = "2026-08-03";

function renderContent() {
  return render(
    <ScheduleFormContent
      schedule={null}
      menus={[]}
      menuSets={[]}
      today={TODAY}
    />,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCreate.mockResolvedValue({
    ok: true,
    data: { id: 1 },
  } as Awaited<ReturnType<typeof createSchedule>>);
});

describe("ScheduleFormContent", () => {
  it("登録ボタンを連打しても1件しか作成しない", async () => {
    const user = userEvent.setup();
    // 解決を遅らせて、1回目の送信が終わる前に2回目を押せる状態にする。
    type CreateResult = Awaited<ReturnType<typeof createSchedule>>;
    let resolveCreate: (value: CreateResult) => void = () => {};
    mockCreate.mockReturnValue(
      new Promise<CreateResult>((resolve) => {
        resolveCreate = resolve;
      }),
    );

    renderContent();
    await user.type(screen.getByLabelText(/タイトル/), "朝練");

    const saveButton = screen.getByRole("button", { name: "登録する" });
    await user.click(saveButton);
    await user.click(saveButton);

    expect(mockCreate).toHaveBeenCalledTimes(1);

    resolveCreate({ ok: true, data: { id: 1 } } as CreateResult);
  });

  it("登録に成功したらカレンダーへ戻す", async () => {
    const user = userEvent.setup();
    renderContent();

    await user.type(screen.getByLabelText(/タイトル/), "朝練");
    await user.click(screen.getByRole("button", { name: "登録する" }));

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith("/practice/plans?tab=calendar"),
    );
  });

  it("登録に失敗したら再送信できる状態に戻す", async () => {
    const user = userEvent.setup();
    mockCreate.mockResolvedValue({
      ok: false,
      errors: ["保存に失敗しました"],
    } as Awaited<ReturnType<typeof createSchedule>>);
    renderContent();

    await user.type(screen.getByLabelText(/タイトル/), "朝練");
    const saveButton = screen.getByRole("button", { name: "登録する" });
    await user.click(saveButton);
    await screen.findByText("保存に失敗しました");
    await user.click(saveButton);

    expect(mockCreate).toHaveBeenCalledTimes(2);
  });
});
