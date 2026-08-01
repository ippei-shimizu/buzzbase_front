const mockCookieGet = jest.fn();
const mockGetProStatus = jest.fn();

jest.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: mockCookieGet }),
}));

jest.mock("../actions", () => ({
  getProStatus: () => mockGetProStatus(),
}));

import { DEFAULT_PRO_STATUS, type ProStatus } from "@app/types/pro";
import { getCachedProStatus } from "../proStatus";

function setAuthCookies(uid = "user@example.com") {
  mockCookieGet.mockImplementation((key: string) => {
    const values: Record<string, { value: string }> = {
      "access-token": { value: "test-access-token" },
      client: { value: "test-client" },
      uid: { value: uid },
    };
    return values[key];
  });
}

const proStatus: ProStatus = {
  subscription: {
    ...DEFAULT_PRO_STATUS.subscription,
    status: "active",
    pro_active: true,
  },
  entitlements: [...DEFAULT_PRO_STATUS.entitlements, "no_ads"],
};

describe("getCachedProStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("認証済みなら Pro 状態を返す", async () => {
    setAuthCookies();
    mockGetProStatus.mockResolvedValueOnce(proStatus);

    await expect(getCachedProStatus()).resolves.toEqual(proStatus);
  });

  it("認証 cookie が無いときは API を呼ばずに null を返す", async () => {
    mockCookieGet.mockReturnValue(undefined);

    await expect(getCachedProStatus()).resolves.toBeNull();
    expect(mockGetProStatus).not.toHaveBeenCalled();
  });

  it("認証 cookie が一部だけのときも API を呼ばずに null を返す", async () => {
    mockCookieGet.mockImplementation((key: string) =>
      key === "uid" ? { value: "user@example.com" } : undefined,
    );

    await expect(getCachedProStatus()).resolves.toBeNull();
    expect(mockGetProStatus).not.toHaveBeenCalled();
  });
});
