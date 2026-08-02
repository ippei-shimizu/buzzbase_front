const mockGetFeatureFlags = jest.fn();

jest.mock("@app/featureFlags/actions", () => ({
  getFeatureFlags: (keys: string[]) => mockGetFeatureFlags(keys),
}));

import { act, render, screen, type RenderResult } from "@testing-library/react";
import ProNavLink from "../ProNavLink";

function setAuthCookies(uid: string) {
  document.cookie = "access-token=test-access-token";
  document.cookie = "client=test-client";
  document.cookie = `uid=${encodeURIComponent(uid)}`;
}

function clearAuthCookies() {
  for (const name of ["access-token", "client", "uid"]) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

// flag はマウント後に Server Action で解決されるため、非同期 act で確定まで進める
async function renderNavLink() {
  let rendered!: RenderResult;
  await act(async () => {
    rendered = render(<ProNavLink />);
  });

  return rendered;
}

function queryProLink() {
  return screen.queryByRole("link", { name: "BUZZ BASE Pro" });
}

describe("ProNavLink", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAuthCookies();
  });

  it("pro_features が有効なら Pro 導線を出す", async () => {
    setAuthCookies("user@example.com");
    mockGetFeatureFlags.mockResolvedValue({ pro_features: true });

    await renderNavLink();

    expect(queryProLink()).toHaveAttribute("href", "/pro");
  });

  it("pro_features が無効なら Pro 導線を出さない", async () => {
    setAuthCookies("user@example.com");
    mockGetFeatureFlags.mockResolvedValue({ pro_features: false });

    await renderNavLink();

    expect(queryProLink()).not.toBeInTheDocument();
  });

  it("flag 取得自体が失敗しても Pro 導線を出さない", async () => {
    setAuthCookies("user@example.com");
    mockGetFeatureFlags.mockRejectedValue(new Error("network"));

    await renderNavLink();

    expect(queryProLink()).not.toBeInTheDocument();
  });

  it("判定が確定するまで Pro 導線を出さない", async () => {
    setAuthCookies("user@example.com");
    mockGetFeatureFlags.mockReturnValue(new Promise(() => {}));

    render(<ProNavLink />);

    expect(queryProLink()).not.toBeInTheDocument();
  });

  it("未認証では flag API を叩かず Pro 導線も出さない", async () => {
    await renderNavLink();

    expect(queryProLink()).not.toBeInTheDocument();
    expect(mockGetFeatureFlags).not.toHaveBeenCalled();
  });

  it("ユーザー切替直後は前ユーザーの判定を持ち越さない", async () => {
    setAuthCookies("flag-on@example.com");
    mockGetFeatureFlags.mockResolvedValue({ pro_features: true });

    const rendered = await renderNavLink();
    expect(queryProLink()).toBeInTheDocument();

    setAuthCookies("another@example.com");
    mockGetFeatureFlags.mockReturnValue(new Promise(() => {}));
    await act(async () => {
      rendered.rerender(<ProNavLink />);
    });

    expect(queryProLink()).not.toBeInTheDocument();
  });

  it("別ユーザーでログインし直すとその判定に切り替わる", async () => {
    setAuthCookies("flag-off@example.com");
    mockGetFeatureFlags.mockResolvedValue({ pro_features: false });

    const rendered = await renderNavLink();
    expect(queryProLink()).not.toBeInTheDocument();

    setAuthCookies("flag-on@example.com");
    mockGetFeatureFlags.mockResolvedValue({ pro_features: true });
    await act(async () => {
      rendered.rerender(<ProNavLink />);
    });

    expect(queryProLink()).toHaveAttribute("href", "/pro");
  });
});
