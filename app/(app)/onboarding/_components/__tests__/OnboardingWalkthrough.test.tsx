import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OnboardingWalkthrough from "../OnboardingWalkthrough";

const mockCapture = jest.fn();
jest.mock("@app/utils/posthog", () => ({
  capture: (...args: unknown[]) => mockCapture(...args),
}));

const STEP_TITLES = [
  "打者も投手も、入力するだけで自動計算",
  "チームメイトとランキングで競う",
  "成長を1枚のグラフで",
];

const STEP_COPIES = [
  "もう自分で電卓を叩かなくていい。打率・OPS から防御率・奪三振まで、打撃も投球も29指標を自動で算出します。",
  "友達と打率を競い合おう。グループ内ランキングでモチベーションが続きます。",
  "成績の推移をグラフで振り返り。自分の成長が一目でわかります。",
];

const renderWalkthrough = () => {
  const onFinish = jest.fn();
  render(<OnboardingWalkthrough onFinish={onFinish} />);
  return { onFinish, user: userEvent.setup() };
};

const activeStepIndex = () =>
  screen
    .getAllByRole("listitem")
    .findIndex((item) => item.getAttribute("aria-current") === "step");

const swipe = (fromX: number, toX: number) => {
  const region = screen.getByRole("region", { name: "BUZZ BASE の使い方" });
  fireEvent.touchStart(region, { changedTouches: [{ clientX: fromX }] });
  fireEvent.touchEnd(region, { changedTouches: [{ clientX: toX }] });
};

const capturedEvents = (event: string) =>
  mockCapture.mock.calls
    .filter(([capturedEvent]) => capturedEvent === event)
    .map(([, properties]) => properties);

beforeEach(() => {
  mockCapture.mockClear();
});

describe("OnboardingWalkthrough", () => {
  it("1ステップ目のタイトルと説明を表示する", () => {
    renderWalkthrough();

    expect(screen.getByText(STEP_TITLES[0])).toBeInTheDocument();
    expect(screen.getByText(STEP_COPIES[0])).toBeInTheDocument();
    expect(screen.queryByText(STEP_TITLES[1])).not.toBeInTheDocument();
  });

  it("「次へ」で3ステップを順番に表示する", async () => {
    const { user } = renderWalkthrough();

    await user.click(screen.getByRole("button", { name: "次へ" }));
    expect(screen.getByText(STEP_TITLES[1])).toBeInTheDocument();
    expect(screen.getByText(STEP_COPIES[1])).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "次へ" }));
    expect(screen.getByText(STEP_TITLES[2])).toBeInTheDocument();
    expect(screen.getByText(STEP_COPIES[2])).toBeInTheDocument();
  });

  it("「戻る」で前のステップに戻る", async () => {
    const { user } = renderWalkthrough();

    await user.click(screen.getByRole("button", { name: "次へ" }));
    await user.click(screen.getByRole("button", { name: "戻る" }));

    expect(screen.getByText(STEP_TITLES[0])).toBeInTheDocument();
  });

  it("1ステップ目には「戻る」がない", async () => {
    const { user } = renderWalkthrough();

    expect(screen.queryByRole("button", { name: "戻る" })).toBeNull();

    await user.click(screen.getByRole("button", { name: "次へ" }));
    expect(screen.getByRole("button", { name: "戻る" })).toBeInTheDocument();
  });

  it("キーボードの左右でステップを移動できる", async () => {
    const { user } = renderWalkthrough();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByText(STEP_TITLES[1])).toBeInTheDocument();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByText(STEP_TITLES[2])).toBeInTheDocument();

    await user.keyboard("{ArrowLeft}");
    expect(screen.getByText(STEP_TITLES[1])).toBeInTheDocument();
  });

  it("最初のステップで左キーを押しても最初のまま", async () => {
    const { user } = renderWalkthrough();

    await user.keyboard("{ArrowLeft}");

    expect(screen.getByText(STEP_TITLES[0])).toBeInTheDocument();
    expect(activeStepIndex()).toBe(0);
  });

  it("最後のステップで右キーを押しても最後のまま", async () => {
    const { user } = renderWalkthrough();

    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}");

    expect(screen.getByText(STEP_TITLES[2])).toBeInTheDocument();
    expect(activeStepIndex()).toBe(2);
  });

  it("PageIndicator が現在のステップを示す", async () => {
    const { user } = renderWalkthrough();

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(activeStepIndex()).toBe(0);

    await user.click(screen.getByRole("button", { name: "次へ" }));
    expect(activeStepIndex()).toBe(1);

    await user.click(screen.getByRole("button", { name: "次へ" }));
    expect(activeStepIndex()).toBe(2);
  });

  it("最後のステップでは「次へ」ではなく「はじめる」を出す", async () => {
    const { user, onFinish } = renderWalkthrough();

    await user.click(screen.getByRole("button", { name: "次へ" }));
    await user.click(screen.getByRole("button", { name: "次へ" }));

    expect(screen.queryByRole("button", { name: "次へ" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "はじめる" }));

    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it("どのステップからでもスキップできる", async () => {
    const { user, onFinish } = renderWalkthrough();

    expect(
      screen.getByRole("button", { name: "スキップ" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "次へ" }));
    await user.click(screen.getByRole("button", { name: "スキップ" }));

    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it("左スワイプで次、右スワイプで前のステップに移動する", () => {
    renderWalkthrough();

    swipe(200, 40);
    expect(screen.getByText(STEP_TITLES[1])).toBeInTheDocument();

    swipe(40, 200);
    expect(screen.getByText(STEP_TITLES[0])).toBeInTheDocument();
  });

  it("わずかな横移動ではステップを動かさない", () => {
    renderWalkthrough();

    swipe(200, 190);

    expect(screen.getByText(STEP_TITLES[0])).toBeInTheDocument();
  });

  it("アンマウント後はキー操作を拾わない", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<OnboardingWalkthrough onFinish={jest.fn()} />);

    unmount();

    await expect(user.keyboard("{ArrowRight}")).resolves.not.toThrow();
  });

  describe("計測", () => {
    it("初期表示と各ステップへの移動でステップ表示イベントを送る", async () => {
      const { user } = renderWalkthrough();

      await user.click(screen.getByRole("button", { name: "次へ" }));
      await user.click(screen.getByRole("button", { name: "次へ" }));

      expect(capturedEvents("onboarding step viewed")).toEqual([
        { step_index: 0, illustration: "autoCalc" },
        { step_index: 1, illustration: "ranking" },
        { step_index: 2, illustration: "growth" },
      ]);
    });

    it("端で押し戻してステップが変わらないときは再送しない", async () => {
      const { user } = renderWalkthrough();

      await user.keyboard("{ArrowLeft}");

      expect(capturedEvents("onboarding step viewed")).toEqual([
        { step_index: 0, illustration: "autoCalc" },
      ]);
    });

    it("最後のステップで進めてもステップ表示イベントを再送しない", async () => {
      const { user } = renderWalkthrough();

      await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}");

      expect(capturedEvents("onboarding step viewed")).toEqual([
        { step_index: 0, illustration: "autoCalc" },
        { step_index: 1, illustration: "ranking" },
        { step_index: 2, illustration: "growth" },
      ]);
    });

    it("スワイプでの移動でもステップ表示イベントを送る", () => {
      renderWalkthrough();

      swipe(200, 40);

      expect(capturedEvents("onboarding step viewed")).toEqual([
        { step_index: 0, illustration: "autoCalc" },
        { step_index: 1, illustration: "ranking" },
      ]);
    });

    it("スキップで skipped: true の完了イベントを送る", async () => {
      const { user } = renderWalkthrough();

      await user.click(screen.getByRole("button", { name: "次へ" }));
      await user.click(screen.getByRole("button", { name: "スキップ" }));

      expect(capturedEvents("onboarding completed")).toEqual([
        { skipped: true, last_step_index: 1 },
      ]);
    });

    it("「はじめる」で skipped: false の完了イベントを送る", async () => {
      const { user } = renderWalkthrough();

      await user.click(screen.getByRole("button", { name: "次へ" }));
      await user.click(screen.getByRole("button", { name: "次へ" }));
      await user.click(screen.getByRole("button", { name: "はじめる" }));

      expect(capturedEvents("onboarding completed")).toEqual([
        { skipped: false, last_step_index: 2 },
      ]);
    });

    it("連続で押しても完了イベントと onFinish は1回だけ", async () => {
      const { user, onFinish } = renderWalkthrough();

      await user.dblClick(screen.getByRole("button", { name: "スキップ" }));

      expect(capturedEvents("onboarding completed")).toHaveLength(1);
      expect(onFinish).toHaveBeenCalledTimes(1);
    });
  });
});
