import type { Notifications } from "@app/interface";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders } from "axios";
import React from "react";
import NotificationGroup from "../NotificationGroup";

const mockToastError = jest.fn();
jest.mock("sonner", () => ({
  toast: { error: (...args: unknown[]) => mockToastError(...args) },
}));

const mockOpenProUpgradeModal = jest.fn();
jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({ open: mockOpenProUpgradeModal }),
}));

const mockCapture = jest.fn();
jest.mock("@app/utils/posthog", () => ({
  capture: (...args: unknown[]) => mockCapture(...args),
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
}));

const mockAcceptGroupInvitation = jest.fn();
jest.mock("@app/services/groupInvitationsService", () => ({
  acceptGroupInvitation: (...args: unknown[]) =>
    mockAcceptGroupInvitation(...args),
  declinedGroupInvitation: jest.fn(),
}));

jest.mock("@app/services/notificationsService", () => ({
  deleteNotification: jest.fn().mockResolvedValue(undefined),
}));

const forbiddenError = () =>
  new AxiosError("forbidden", "ERR_BAD_REQUEST", undefined, undefined, {
    status: 403,
    statusText: "Forbidden",
    data: {
      error: "group_limit_exceeded",
      message: "Pro プランでグループを無制限に作成・参加できます",
    },
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  });

const invitation: Notifications = {
  id: 1,
  actor_user_id: 100,
  actor_name: "招待者",
  event_type: "group_invitation",
  event_id: 42,
  read_at: null,
  created_at: new Date().toISOString(),
  actor_icon: { url: "/icon.png" },
  group_name: "テストグループ",
  group_invitation: "pending",
};

const acceptInvitation = async () => {
  const user = userEvent.setup();
  render(<NotificationGroup notice={invitation} />);
  await user.click(screen.getByText("参加する"));
};

describe("グループ招待の承諾", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAcceptGroupInvitation.mockResolvedValue(undefined);
  });

  it("承諾できたら group joined を送ってグループへ遷移する", async () => {
    await acceptInvitation();

    await waitFor(() =>
      expect(mockCapture).toHaveBeenCalledWith("group joined", {
        group_id: 42,
      }),
    );
    expect(mockPush).toHaveBeenCalledWith("/groups/42");
  });

  it("無料枠の上限で拒否されたら free limit reached を送りPro訴求を出す", async () => {
    mockAcceptGroupInvitation.mockRejectedValue(forbiddenError());

    await acceptInvitation();

    await waitFor(() =>
      expect(mockCapture).toHaveBeenCalledWith("free limit reached", {
        feature: "unlimited_groups",
        source: "group_invitation",
        detection: "server",
      }),
    );
    expect(mockToastError).toHaveBeenCalledWith(
      expect.stringContaining("無料プランで参加できるグループは1つまで"),
    );
    expect(mockOpenProUpgradeModal).toHaveBeenCalledWith({
      trigger: "unlimited_groups",
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("上限以外の失敗ではPro訴求を出さない", async () => {
    mockAcceptGroupInvitation.mockRejectedValue(new Error("failed"));

    await acceptInvitation();

    await waitFor(() => expect(mockAcceptGroupInvitation).toHaveBeenCalled());
    expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
    expect(mockCapture).not.toHaveBeenCalledWith(
      "free limit reached",
      expect.anything(),
    );
  });
});
