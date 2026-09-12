const mockReplace = jest.fn();
const mockGetProStatusResult = jest.fn();
let searchParams = new URLSearchParams();

// 本物の useRouter は参照が安定しており、再レンダーだけではポーリング用の effect は
// 貼り直されない。毎回新しいオブジェクトを返すと実装より緩い前提でテストしてしまう。
const mockRouter = { replace: mockReplace };

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => searchParams,
}));

jest.mock("@app/(app)/pro/actions", () => ({
  getProStatusResult: () => mockGetProStatusResult(),
}));

import { act, render, screen } from "@testing-library/react";
import { DEFAULT_PRO_STATUS, type ProStatus } from "@app/types/pro";
import ProSuccessPage, { metadata } from "../page";

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 10;

function buildStatus(pro_active: boolean): ProStatus {
  return {
    ...DEFAULT_PRO_STATUS,
    subscription: { ...DEFAULT_PRO_STATUS.subscription, pro_active },
  };
}

const okResult = (pro_active: boolean) => ({
  status: "ok" as const,
  proStatus: buildStatus(pro_active),
});

function renderWithSession(sessionId: string | null = "cs_test_123") {
  searchParams = new URLSearchParams(
    sessionId === null ? "" : `session_id=${sessionId}`,
  );
  return render(<ProSuccessPage />);
}

// ポーリングの待機を進める。setTimeout を跨いで await を挟むため act で包む。
async function advanceOnePoll() {
  await act(async () => {
    jest.advanceTimersByTime(POLL_INTERVAL_MS);
  });
}

// 最初の 1 回はマウント直後に走るので、待機で進めるのは残り回数ぶん。
async function exhaustPolling() {
  for (let i = 0; i < MAX_ATTEMPTS; i += 1) {
    await advanceOnePoll();
  }
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockGetProStatusResult.mockResolvedValue(okResult(false));
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe("メタデータ", () => {
  it("加入内容を含むため検索エンジンに登録させない", () => {
    expect(metadata.robots).toEqual({ index: false });
  });
});

describe("Checkout からの復帰", () => {
  it("反映を待っていることを伝える", async () => {
    renderWithSession();

    expect(
      await screen.findByText(
        "決済の反映を確認しています。そのままお待ちください。",
      ),
    ).toBeInTheDocument();
  });

  it("すでに Pro なら待たずにサブスクリプション管理へ送る", async () => {
    mockGetProStatusResult.mockResolvedValue(okResult(true));
    renderWithSession();

    await act(async () => {});

    expect(mockGetProStatusResult).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith("/account/subscription");
  });

  it("反映されるまで再取得を続け、反映されたらサブスクリプション管理へ送る", async () => {
    mockGetProStatusResult
      .mockResolvedValueOnce(okResult(false))
      .mockResolvedValueOnce(okResult(false))
      .mockResolvedValue(okResult(true));
    renderWithSession();

    await act(async () => {});
    expect(mockReplace).not.toHaveBeenCalled();

    await advanceOnePoll();
    expect(mockReplace).not.toHaveBeenCalled();

    await advanceOnePoll();

    expect(mockGetProStatusResult).toHaveBeenCalledTimes(3);
    expect(mockReplace).toHaveBeenCalledWith("/account/subscription");
    expect(
      screen.getByText("Pro 機能が使えるようになりました"),
    ).toBeInTheDocument();
  });

  it("反映後はそれ以上ポーリングしない", async () => {
    mockGetProStatusResult
      .mockResolvedValueOnce(okResult(false))
      .mockResolvedValue(okResult(true));
    renderWithSession();

    await act(async () => {});
    await advanceOnePoll();
    expect(mockGetProStatusResult).toHaveBeenCalledTimes(2);

    await advanceOnePoll();
    await advanceOnePoll();

    expect(mockGetProStatusResult).toHaveBeenCalledTimes(2);
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  // 間隔を詰めると反映待ちの利用者が増えたぶんだけ Rails への負荷が跳ねる。
  it("間隔が経つまでは再取得しない", async () => {
    renderWithSession();

    await act(async () => {});
    expect(mockGetProStatusResult).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(POLL_INTERVAL_MS - 1);
    });
    expect(mockGetProStatusResult).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(mockGetProStatusResult).toHaveBeenCalledTimes(2);
  });

  // Webhook が落ちた場合にタブを開いている限り叩き続けないための上限。
  it("上限回数で打ち切り、それ以上は再取得しない", async () => {
    renderWithSession();

    await exhaustPolling();
    expect(mockGetProStatusResult).toHaveBeenCalledTimes(MAX_ATTEMPTS);

    await advanceOnePoll();
    await advanceOnePoll();

    expect(mockGetProStatusResult).toHaveBeenCalledTimes(MAX_ATTEMPTS);
  });

  it("打ち切ったら反映待ちであることと手動の確認導線を出す", async () => {
    renderWithSession();

    await exhaustPolling();

    expect(
      screen.getByText(
        "反映に時間がかかっています。決済は完了していますので、時間をおいて加入状態をご確認ください。",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "加入状態を確認する" }),
    ).toHaveAttribute("href", "/account/subscription");
    expect(
      screen.getByRole("link", { name: "ダッシュボードへ" }),
    ).toHaveAttribute("href", "/dashboard");
    expect(mockReplace).not.toHaveBeenCalled();
  });

  // 決済は Stripe 側で成立済み。打ち切りを「失敗した」と受け取らせてはいけない。
  it("打ち切りの案内で決済が失敗したとは言わない", async () => {
    renderWithSession();

    await exhaustPolling();

    expect(screen.queryByText(/決済に失敗/)).not.toBeInTheDocument();
    expect(screen.getByText(/決済は完了しています/)).toBeInTheDocument();
  });

  // 反映を待たずに他画面へ移った利用者のぶんまで Rails を叩き続けないようにする。
  it("画面を離れたら再取得を止める", async () => {
    const view = renderWithSession();

    await act(async () => {});
    expect(mockGetProStatusResult).toHaveBeenCalledTimes(1);

    view.unmount();
    await advanceOnePoll();
    await advanceOnePoll();

    expect(mockGetProStatusResult).toHaveBeenCalledTimes(1);
  });

  // 離脱後に応答が返ってきても、利用者が見ている別画面から勝手に遷移させない。
  it("画面を離れたあとに応答が返ってきても遷移しない", async () => {
    let settle: (result: ReturnType<typeof okResult>) => void = () => {};
    mockGetProStatusResult.mockReturnValue(
      new Promise<ReturnType<typeof okResult>>((resolve) => {
        settle = resolve;
      }),
    );
    const view = renderWithSession();

    view.unmount();
    await act(async () => {
      settle(okResult(true));
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("待機中も表示を読み上げさせる", async () => {
    renderWithSession();

    await act(async () => {});

    expect(screen.getByRole("status")).toHaveTextContent(
      "決済の反映を確認しています。そのままお待ちください。",
    );
  });
});

describe("直接アクセス", () => {
  it("session_id が無ければポーリングせず案内だけ出す", async () => {
    renderWithSession(null);

    await act(async () => {});
    await advanceOnePoll();

    expect(mockGetProStatusResult).not.toHaveBeenCalled();
    expect(
      screen.getByText(
        "反映には数分かかる場合があります。マイページから加入状態をご確認ください。",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "加入状態を確認する" }),
    ).toHaveAttribute("href", "/account/subscription");
  });
});

describe("状態を取得できないとき", () => {
  it("トークン失効なら再試行せず再ログインへ誘導する", async () => {
    mockGetProStatusResult.mockResolvedValue({ status: "unauthorized" });
    renderWithSession();

    await act(async () => {});

    expect(screen.getByRole("link", { name: "ログインする" })).toHaveAttribute(
      "href",
      "/signin",
    );
    expect(
      screen.getByText(/ログインの有効期限が切れているため/),
    ).toBeInTheDocument();

    await advanceOnePoll();
    expect(mockGetProStatusResult).toHaveBeenCalledTimes(1);
  });

  it("トークン失効でも決済が完了していることを伝える", async () => {
    mockGetProStatusResult.mockResolvedValue({ status: "unauthorized" });
    renderWithSession();

    await act(async () => {});

    expect(screen.getByText(/決済は完了しています/)).toBeInTheDocument();
  });

  // API 障害は一過性のことが多いので、1 回で諦めず上限まで再試行する。
  it("API 障害でも上限まで再試行し、途中で復帰したら遷移する", async () => {
    mockGetProStatusResult
      .mockResolvedValueOnce({ status: "error" })
      .mockResolvedValueOnce({ status: "error" })
      .mockResolvedValue(okResult(true));
    renderWithSession();

    await act(async () => {});
    await advanceOnePoll();
    expect(mockReplace).not.toHaveBeenCalled();

    await advanceOnePoll();

    expect(mockReplace).toHaveBeenCalledWith("/account/subscription");
  });

  it("最後まで API 障害なら反映待ちではなく確認できなかったことを伝える", async () => {
    mockGetProStatusResult.mockResolvedValue({ status: "error" });
    renderWithSession();

    await exhaustPolling();

    expect(
      screen.getByText(
        "加入状態を確認できませんでした。決済は完了していますので、時間をおいて加入状態をご確認ください。",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "加入状態を確認する" }),
    ).toHaveAttribute("href", "/account/subscription");
  });

  // 途中で復旧したなら通信は問題ないので、通信エラーとして案内してはいけない。
  it("途中の API 障害から復旧して打ち切ったときは反映待ちとして案内する", async () => {
    mockGetProStatusResult
      .mockResolvedValueOnce({ status: "error" })
      .mockResolvedValue(okResult(false));
    renderWithSession();

    await exhaustPolling();

    expect(
      screen.getByText(
        "反映に時間がかかっています。決済は完了していますので、時間をおいて加入状態をご確認ください。",
      ),
    ).toBeInTheDocument();
  });
});
