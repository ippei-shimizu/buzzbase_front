import { act, renderHook, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";
import { getProStatus } from "@app/(app)/pro/actions";
import { ProStatusProvider } from "@app/components/pro/ProStatusProvider";
import { useProGatedFeatures } from "@app/hooks/pro/useProGatedFeatures";
import { useProStatus } from "@app/hooks/pro/useProStatus";
import {
  DEFAULT_PRO_STATUS,
  type Feature,
  type ProFeature,
  type ProStatus,
} from "@app/types/pro";

jest.mock("@app/(app)/pro/actions", () => ({
  getProStatus: jest.fn(),
}));

const mockGetProStatus = getProStatus as jest.MockedFunction<
  typeof getProStatus
>;

const GATED_FEATURES: ProFeature[] = [
  "count_situation_average",
  "pitch_type_average",
];

function setAuthCookies() {
  document.cookie = "access-token=test-access-token";
  document.cookie = "client=test-client";
  document.cookie = "uid=user@example.com";
}

function clearAuthCookies() {
  for (const name of ["access-token", "client", "uid"]) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

function makeProStatus(extraFeatures: ProFeature[]): ProStatus {
  return {
    subscription: {
      ...DEFAULT_PRO_STATUS.subscription,
      status: "active",
      pro_active: true,
    },
    entitlements: [
      ...DEFAULT_PRO_STATUS.entitlements,
      ...extraFeatures,
    ] as Feature[],
  };
}

const Wrapper = ({ children }: { children: ReactNode }) => (
  <ProStatusProvider>{children}</ProStatusProvider>
);
Wrapper.displayName = "TestProStatusWrapper";

async function renderGatedFeatures(initialGranted: readonly ProFeature[] = []) {
  const rendered = renderHook(() => useProGatedFeatures(initialGranted), {
    wrapper: Wrapper,
  });
  await act(async () => {});
  return rendered;
}

describe("useProGatedFeatures", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAuthCookies();
  });

  describe("判定が確定するまで", () => {
    it("サーバーで解決済みの可否を使う", async () => {
      setAuthCookies();
      mockGetProStatus.mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(
        () => useProGatedFeatures(["count_situation_average"]),
        { wrapper: Wrapper },
      );

      expect(result.current.canView("count_situation_average")).toBe(true);
      expect(result.current.canView("pitch_type_average")).toBe(false);
    });

    it("確定後はクライアントの entitlement を優先する", async () => {
      setAuthCookies();
      mockGetProStatus.mockResolvedValue(makeProStatus(["pitch_type_average"]));

      const { result } = await renderGatedFeatures(["count_situation_average"]);

      await waitFor(() => {
        expect(result.current.canView("pitch_type_average")).toBe(true);
      });
      expect(result.current.canView("count_situation_average")).toBe(false);
    });
  });

  describe("unwrap", () => {
    it("status:ok ならデータをそのまま返す", async () => {
      setAuthCookies();
      mockGetProStatus.mockResolvedValue(makeProStatus(GATED_FEATURES));

      const { result } = await renderGatedFeatures();

      expect(
        result.current.unwrap("count_situation_average", {
          status: "ok",
          data: { total: 3 },
        }),
      ).toEqual({ total: 3 });
    });

    it("403 ならその機能だけロックし、null を返す", async () => {
      setAuthCookies();
      mockGetProStatus.mockResolvedValue(makeProStatus(GATED_FEATURES));

      const { result } = await renderGatedFeatures();
      expect(result.current.canView("count_situation_average")).toBe(true);

      let unwrapped: unknown = "unset";
      await act(async () => {
        unwrapped = result.current.unwrap("count_situation_average", {
          status: "pro_required",
        });
      });

      expect(unwrapped).toBeNull();
      expect(result.current.canView("count_situation_average")).toBe(false);
      expect(result.current.canView("pitch_type_average")).toBe(true);
    });

    it("複数機能の 403 を積み上げ、同じ機能の重複追加では state を作り直さない", async () => {
      setAuthCookies();
      mockGetProStatus.mockResolvedValue(makeProStatus(GATED_FEATURES));

      const { result } = await renderGatedFeatures();
      const canViewBeforeRedeny = result.current.canView;

      await act(async () => {
        result.current.unwrap("count_situation_average", {
          status: "pro_required",
        });
        result.current.unwrap("pitch_type_average", { status: "pro_required" });
      });
      expect(result.current.canView("count_situation_average")).toBe(false);
      expect(result.current.canView("pitch_type_average")).toBe(false);

      const canViewAfterDeny = result.current.canView;
      expect(canViewAfterDeny).not.toBe(canViewBeforeRedeny);

      await act(async () => {
        result.current.unwrap("count_situation_average", {
          status: "pro_required",
        });
      });
      // 同じ機能を再度拒否しても deny リストは変わらないため、判定関数も再生成されない。
      expect(result.current.canView).toBe(canViewAfterDeny);
    });
  });

  it("Pro 状態を取り直したら過去の 403 によるロックを解除する", async () => {
    setAuthCookies();
    // 実際の Server Action は毎回 JSON をパースして別インスタンスを返す。
    mockGetProStatus.mockImplementation(async () =>
      makeProStatus(GATED_FEATURES),
    );

    const { result } = renderHook(
      () => ({ gated: useProGatedFeatures(), pro: useProStatus() }),
      { wrapper: Wrapper },
    );
    await act(async () => {});

    await act(async () => {
      result.current.gated.unwrap("count_situation_average", {
        status: "pro_required",
      });
    });
    expect(result.current.gated.canView("count_situation_average")).toBe(false);

    // 加入直後の refresh() では entitlements が別インスタンスに差し替わる。
    await act(async () => {
      result.current.pro.refresh();
    });

    expect(result.current.gated.canView("count_situation_average")).toBe(true);
  });
});
