import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import {
  GROUP_JOIN_TOOLTIP_SHOWN_STORAGE_KEY,
  GROUP_TAB_BADGE_SEEN_STORAGE_KEY,
  INVITE_CARD_DISMISSED_STORAGE_KEY,
  WALKTHROUGH_COMPLETED_STORAGE_KEY,
} from "@app/constants/onboarding";
import { useOnboardingFlag } from "../useOnboardingFlag";

const KEY = "buzzbase.onboarding.test";

function Probe() {
  const { isMarked, mark, markForNextVisit } = useOnboardingFlag(KEY);

  return (
    <div>
      <p>状態: {isMarked === null ? "未確定" : String(isMarked)}</p>
      <button type="button" onClick={mark}>
        今すぐ消す
      </button>
      <button type="button" onClick={markForNextVisit}>
        次回から消す
      </button>
    </div>
  );
}

const state = () => screen.getByText(/^状態:/).textContent;

describe("useOnboardingFlag", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it("SSR では未確定を返す", () => {
    const html = renderToStaticMarkup(<Probe />);

    expect(html).toContain("未確定");
  });

  it("マウント後は未設定のフラグを false として確定する", () => {
    render(<Probe />);

    expect(state()).toBe("状態: false");
  });

  it("mark で即座に true になり、次のマウントでも true のまま", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Probe />);

    await user.click(screen.getByRole("button", { name: "今すぐ消す" }));
    expect(state()).toBe("状態: true");

    unmount();
    render(<Probe />);

    expect(state()).toBe("状態: true");
  });

  it("markForNextVisit は表示中の状態を変えず、次のマウントで true になる", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Probe />);

    await user.click(screen.getByRole("button", { name: "次回から消す" }));
    expect(state()).toBe("状態: false");

    unmount();
    render(<Probe />);

    expect(state()).toBe("状態: true");
  });

  it("読み込みが例外になったら true（＝もう出さない）に倒す", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });

    render(<Probe />);

    expect(state()).toBe("状態: true");
  });

  it("保存が例外になっても落ちず、その場の状態は保たれる", async () => {
    const user = userEvent.setup();
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    render(<Probe />);

    await expect(
      user.click(screen.getByRole("button", { name: "今すぐ消す" })),
    ).resolves.not.toThrow();
    expect(state()).toBe("状態: true");
  });
});

describe("オンボーディングの永続化キー", () => {
  // 変更すると既存ユーザーに導線が再表示されるため、キー名は固定の契約として扱う
  it("機能ごとに衝突しない固定のキー名を持つ", () => {
    expect(GROUP_JOIN_TOOLTIP_SHOWN_STORAGE_KEY).toBe(
      "buzzbase.onboarding.groupJoinTooltipShown",
    );
    expect(GROUP_TAB_BADGE_SEEN_STORAGE_KEY).toBe(
      "buzzbase.onboarding.groupTabBadgeSeen",
    );
    expect(INVITE_CARD_DISMISSED_STORAGE_KEY).toBe(
      "buzzbase.onboarding.inviteCardDismissed",
    );
    expect(WALKTHROUGH_COMPLETED_STORAGE_KEY).toBe(
      "buzzbase.onboarding.walkthroughCompleted",
    );
    expect(
      new Set([
        GROUP_JOIN_TOOLTIP_SHOWN_STORAGE_KEY,
        GROUP_TAB_BADGE_SEEN_STORAGE_KEY,
        INVITE_CARD_DISMISSED_STORAGE_KEY,
        WALKTHROUGH_COMPLETED_STORAGE_KEY,
      ]).size,
    ).toBe(4);
  });
});
