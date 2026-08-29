jest.mock("@app/hooks/pro/useEntitlement", () => ({
  useEntitlement: jest.fn(),
}));

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({ open: jest.fn(), close: jest.fn() }),
}));

jest.mock("@app/lib/analytics", () => ({
  trackEvent: jest.fn(),
}));

import type { MenuSet } from "@app/types/menuSet";
import type { PracticeMenu } from "@app/types/practice";
import type { Schedule, ScheduleInput } from "@app/types/schedule";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import ScheduleForm from "../_components/ScheduleForm";

const mockUseEntitlement = useEntitlement as jest.MockedFunction<
  typeof useEntitlement
>;

function mockEntitlement(granted: boolean) {
  mockUseEntitlement.mockReturnValue({
    isPro: granted,
    inTrial: false,
    inGracePeriod: false,
    isLoading: false,
    hasEntitlement: jest.fn(() => granted),
  });
}

const menus: PracticeMenu[] = [
  {
    id: 1,
    name: "素振り",
    category: "batting",
    unit: "count",
    unit_label: "本",
    default_value: "200.0",
    is_favorite: false,
    sort_order: 1,
  },
  {
    id: 2,
    name: "ランニング",
    category: "training",
    unit: "distance",
    unit_label: "km",
    default_value: null,
    is_favorite: false,
    sort_order: 2,
  },
];

const menuSets: MenuSet[] = [
  {
    id: 3,
    name: "オフ日ルーティン",
    note: null,
    sort_order: 1,
    items: [
      {
        practice_menu_id: 1,
        name: "素振り",
        unit_label: "本",
        target_value: 200,
      },
      {
        practice_menu_id: 2,
        name: "ランニング",
        unit_label: "km",
        target_value: 5,
      },
    ],
  },
  { id: 4, name: "空のセット", note: null, sort_order: 2, items: [] },
];

function buildSchedule(overrides: Partial<Schedule> = {}): Schedule {
  return {
    id: 10,
    title: "朝の素振り",
    days_of_week: null,
    planned_on: "2026-08-10",
    scheduled_time: "06:00",
    end_time: null,
    event_type: "self_practice",
    recurring: false,
    menu_set_id: null,
    game_result_id: null,
    note: null,
    notification_enabled: true,
    active: true,
    notification_message: null,
    menus: [],
    logged_practice_menu_ids: [],
    ...overrides,
  };
}

function renderForm({
  schedule = null,
  onSubmit = jest.fn(),
}: {
  schedule?: Schedule | null;
  onSubmit?: jest.Mock;
} = {}) {
  render(
    <ScheduleForm
      schedule={schedule}
      menus={menus}
      menuSets={menuSets}
      today="2026-08-03"
      isSaving={false}
      serverErrors={[]}
      onSubmit={onSubmit}
      onCancel={jest.fn()}
    />,
  );
  return { onSubmit };
}

function submittedInput(onSubmit: jest.Mock): ScheduleInput {
  return onSubmit.mock.calls[0][0] as ScheduleInput;
}

const save = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole("button", { name: /登録する|更新する/ }));

describe("ScheduleForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEntitlement(false);
  });

  describe("繰り返し種別の切り替え", () => {
    it("既定はこの日だけで、日付入力を出す", () => {
      renderForm();

      expect(screen.getByLabelText("日付")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "月" }),
      ).not.toBeInTheDocument();
    });

    it("毎週に切り替えると曜日の選択に変わる", async () => {
      const user = userEvent.setup();
      renderForm();

      await user.click(screen.getByRole("button", { name: "毎週" }));

      expect(screen.getByRole("button", { name: "月" })).toBeInTheDocument();
      expect(screen.queryByLabelText("日付")).not.toBeInTheDocument();
    });

    it("毎週で選んだ曜日を days_of_week として送り、planned_on は送らない", async () => {
      const user = userEvent.setup();
      const { onSubmit } = renderForm();

      await user.click(screen.getByRole("button", { name: "毎週" }));
      await user.click(screen.getByRole("button", { name: "水" }));
      await user.click(screen.getByRole("button", { name: "月" }));
      await user.type(screen.getByLabelText(/タイトル/), "朝練");
      await save(user);

      const input = submittedInput(onSubmit);
      expect(input.days_of_week).toBe("1,3");
      expect(input.planned_on).toBeNull();
    });
  });

  describe("バリデーション", () => {
    it("毎週で曜日を選ばないと保存できない", async () => {
      const user = userEvent.setup();
      const { onSubmit } = renderForm();

      await user.click(screen.getByRole("button", { name: "毎週" }));
      await user.type(screen.getByLabelText(/タイトル/), "朝練");
      await save(user);

      expect(
        screen.getByText("曜日または日付のいずれかを指定してください"),
      ).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("メニューセット未指定でタイトルが空なら保存できない", async () => {
      const user = userEvent.setup();
      const { onSubmit } = renderForm();

      await save(user);

      expect(
        screen.getByText(
          "タイトルを入力してください（メニューセットを選ぶと省略できます）",
        ),
      ).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("メニューセットを選べばタイトル無しでも保存できる", async () => {
      const user = userEvent.setup();
      const { onSubmit } = renderForm();

      await user.click(screen.getByRole("button", { name: "セットから" }));
      await user.click(
        screen.getByRole("button", { name: /オフ日ルーティン/ }),
      );
      await save(user);

      expect(submittedInput(onSubmit).menu_set_id).toBe(3);
    });

    it("タイトルは50文字を超えて入力できない", () => {
      renderForm();

      expect(screen.getByLabelText(/タイトル/)).toHaveAttribute(
        "maxlength",
        "50",
      );
    });
  });

  describe("メニューの編集ロック", () => {
    const lockedSchedule = buildSchedule({
      menus: [
        {
          practice_menu_id: 1,
          name: "素振り",
          unit_label: "本",
          target_value: 200,
        },
      ],
      logged_practice_menu_ids: [1],
    });

    it("記録済みメニューのチェックと目標量を操作できない", () => {
      renderForm({ schedule: lockedSchedule });

      expect(screen.getByRole("checkbox", { name: /素振り/ })).toBeDisabled();
      expect(screen.getByLabelText("素振りの目標量")).toBeDisabled();
      expect(
        screen.getByRole("checkbox", { name: "ランニング" }),
      ).toBeEnabled();
    });

    it("記録済みメニューを外そうとしても保存内容から消えない", async () => {
      const user = userEvent.setup();
      const { onSubmit } = renderForm({ schedule: lockedSchedule });

      await user.click(screen.getByRole("checkbox", { name: /素振り/ }));
      await save(user);

      expect(submittedInput(onSubmit).menus).toContainEqual({
        practice_menu_id: 1,
        target_value: 200,
      });
    });

    it("記録済みメニューがあるとメニューセットへ切り替えられない", () => {
      renderForm({ schedule: lockedSchedule });

      expect(screen.getByRole("button", { name: "セットから" })).toBeDisabled();
    });

    it("記録済みメニューが無ければメニューの選択を解除できる", async () => {
      const user = userEvent.setup();
      const { onSubmit } = renderForm({
        schedule: buildSchedule({
          menus: [
            {
              practice_menu_id: 1,
              name: "素振り",
              unit_label: "本",
              target_value: 200,
            },
          ],
        }),
      });

      await user.click(screen.getByRole("checkbox", { name: "素振り" }));
      await save(user);

      expect(submittedInput(onSubmit).menus).toEqual([]);
    });
  });

  // web には通知の配信基盤が無いため、Pro 有無に関わらず通知文の設定自体を置かない。
  describe("カスタム通知文", () => {
    it("無料プランでは入力欄も訴求カードも出さない", () => {
      renderForm();

      expect(screen.queryByLabelText("カスタム通知文")).not.toBeInTheDocument();
      expect(
        screen.queryByText("通知メッセージをカスタマイズ"),
      ).not.toBeInTheDocument();
    });

    it("Pro でも入力欄を出さない", () => {
      mockEntitlement(true);
      renderForm();

      expect(screen.queryByLabelText("カスタム通知文")).not.toBeInTheDocument();
    });

    // 自主練スケジュールは無料でも無制限に作れるため、件数上限の訴求を出してはいけない。
    it("無料プランでも Pro 訴求は出さない", () => {
      renderForm();

      expect(
        screen.queryByRole("button", { name: /Pro プランを見る/ }),
      ).not.toBeInTheDocument();
    });
  });

  // セット名だけでは中身が分からず、意図しないセットを選んでしまう。
  it("セット選択ではセット名の下に含まれるメニューを見せる", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "セットから" }));

    expect(
      screen.getByRole("button", { name: /オフ日ルーティン/ }),
    ).toHaveAccessibleName(/素振り \/ ランニング/);
  });

  it("メニュー未設定のセットはその旨を出す", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "セットから" }));

    expect(screen.getByText("メニュー未設定")).toBeInTheDocument();
  });

  describe("終了時刻とメモ", () => {
    it("入力した終了時刻とメモを送信する", async () => {
      const user = userEvent.setup();
      const { onSubmit } = renderForm();

      await user.type(screen.getByLabelText(/タイトル/), "全体練習");
      fireEvent.change(screen.getByLabelText("終了時刻"), {
        target: { value: "12:30" },
      });
      await user.type(screen.getByLabelText("メモ"), "集合はグラウンド前");
      await save(user);

      const input = submittedInput(onSubmit);
      expect(input.end_time).toBe("12:30");
      expect(input.note).toBe("集合はグラウンド前");
    });

    // 省略すると back の assign_attributes で既存値が残るため、クリア時は null を送る。
    it("未入力の終了時刻は null で送る", async () => {
      const user = userEvent.setup();
      const { onSubmit } = renderForm();

      await user.type(screen.getByLabelText(/タイトル/), "朝練");
      await save(user);

      expect(submittedInput(onSubmit).end_time).toBeNull();
    });

    it("終了時刻が開始時刻以前ならエラーにして送信しない", async () => {
      const user = userEvent.setup();
      const { onSubmit } = renderForm();

      await user.type(screen.getByLabelText(/タイトル/), "朝練");
      fireEvent.change(screen.getByLabelText("終了時刻"), {
        target: { value: "06:00" },
      });
      await save(user);

      expect(onSubmit).not.toHaveBeenCalled();
      expect(
        screen.getByText("終了時刻は開始時刻より後にしてください"),
      ).toBeInTheDocument();
    });
  });

  it("選んだ種別を back の enum のまま送る", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.click(screen.getByRole("button", { name: "試合" }));
    await user.type(screen.getByLabelText(/タイトル/), "vs 港南高");
    await save(user);

    expect(submittedInput(onSubmit).event_type).toBe("game");
  });

  it("リマインド通知のオン・オフは web からは変更できない（アプリ側でのみ設定）", () => {
    renderForm();

    expect(
      screen.queryByRole("switch", { name: "リマインド通知" }),
    ).not.toBeInTheDocument();
  });
});
