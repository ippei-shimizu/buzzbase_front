import type { Notifications } from "@app/interface";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AxiosError, AxiosHeaders } from "axios";
import React from "react";
import { toast } from "sonner";
import { SWRConfig } from "swr";
import axiosInstance from "@app/utils/axiosInstance";
import NotificationItem from "../NotificationItem";

jest.mock("@app/utils/axiosInstance", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("@app/contexts/userContext", () => ({
  useUser: () => ({ state: { usersUserId: { user_id: "buzz_user" } } }),
}));

jest.mock("@app/hooks/auth/useRequireAuth", () => ({
  __esModule: true,
  default: () => true,
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("sonner", () => ({
  toast: { error: jest.fn(), success: jest.fn(), info: jest.fn() },
}));

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
}));

const mockOpenProUpgradeModal = jest.fn();
jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({ open: mockOpenProUpgradeModal }),
}));

const mockGet = axiosInstance.get as jest.Mock;
const mockPost = axiosInstance.post as jest.Mock;
const mockDelete = axiosInstance.delete as jest.Mock;
const mockToastError = toast.error as jest.Mock;

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60 * 1000).toISOString();

const buildNotification = (
  overrides: Partial<Notifications> = {},
): Notifications => ({
  id: 1,
  actor_user_id: 100,
  actor_name: "テスト太郎",
  event_type: "followed",
  event_id: 10,
  read_at: null,
  created_at: minutesAgo(5),
  actor_icon: { url: "/icon.png" },
  group_name: "バズベース",
  group_invitation: "",
  ...overrides,
});

const renderNotifications = (notifications: Notifications[]) => {
  mockGet.mockImplementation(() => Promise.resolve({ data: notifications }));
  return render(
    <SWRConfig
      value={{
        provider: () => new Map(),
        dedupingInterval: 0,
        shouldRetryOnError: false,
      }}
    >
      <NotificationItem />
    </SWRConfig>,
  );
};

describe("NotificationItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDelete.mockResolvedValue({ data: { success: true } });
  });

  describe("未読表示", () => {
    it("read_at が null の通知には未読であることを示す", async () => {
      renderNotifications([buildNotification({ read_at: null })]);

      expect(await screen.findByText("未読")).toBeInTheDocument();
    });

    it("read_at がある通知には未読表示を出さない", async () => {
      renderNotifications([
        buildNotification({ read_at: "2024-03-10T12:00:00+09:00" }),
      ]);

      await screen.findByText("テスト太郎");
      expect(screen.queryByText("未読")).not.toBeInTheDocument();
    });
  });

  describe("相対時刻", () => {
    it("作成からの経過時間を表示する", async () => {
      renderNotifications([buildNotification({ created_at: minutesAgo(5) })]);

      expect(await screen.findByText("5分前")).toBeInTheDocument();
    });
  });

  describe("イベント別アイコン", () => {
    it.each([
      ["followed", "フォロー"],
      ["follow_request", "フォローリクエスト"],
      ["follow_request_accepted", "フォローリクエスト承認"],
    ])("%s には %s のアイコンを表示する", async (eventType, label) => {
      renderNotifications([buildNotification({ event_type: eventType })]);

      expect(await screen.findByLabelText(label)).toBeInTheDocument();
    });

    it("group_invitation にはグループ招待のアイコンを表示する", async () => {
      renderNotifications([
        buildNotification({
          event_type: "group_invitation",
          group_invitation: "pending",
        }),
      ]);

      expect(await screen.findByLabelText("グループ招待")).toBeInTheDocument();
    });

    it("management_notice には運営からのお知らせのアイコンを表示する", async () => {
      renderNotifications([
        buildNotification({
          id: "mn_1",
          event_type: "management_notice",
          title: "メンテナンスのお知らせ",
          management_notice_id: 1,
        }),
      ]);

      expect(
        await screen.findByLabelText("運営からのお知らせ"),
      ).toBeInTheDocument();
    });
  });

  describe("削除", () => {
    it("確認してから削除すると通知が消え、一覧を再取得する", async () => {
      renderNotifications([buildNotification({ id: 1 })]);
      await screen.findByText("テスト太郎");
      const initialFetchCount = mockGet.mock.calls.length;

      fireEvent.click(screen.getByRole("button", { name: "通知を削除" }));
      expect(
        await screen.findByText("この通知を削除しますか？"),
      ).toBeInTheDocument();
      expect(mockDelete).not.toHaveBeenCalled();

      mockGet.mockImplementation(() => Promise.resolve({ data: [] }));
      fireEvent.click(screen.getByRole("button", { name: "削除する" }));

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith("/api/v1/notifications/1");
      });
      await waitFor(() => {
        expect(screen.queryByText("テスト太郎")).not.toBeInTheDocument();
      });
      await waitFor(() => {
        expect(mockGet.mock.calls.length).toBeGreaterThan(initialFetchCount);
      });
    });

    it("確認をキャンセルすると削除しない", async () => {
      renderNotifications([buildNotification({ id: 1 })]);
      await screen.findByText("テスト太郎");

      fireEvent.click(screen.getByRole("button", { name: "通知を削除" }));
      await screen.findByText("この通知を削除しますか？");
      fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));

      await waitFor(() => {
        expect(
          screen.queryByText("この通知を削除しますか？"),
        ).not.toBeInTheDocument();
      });
      expect(mockDelete).not.toHaveBeenCalled();
      expect(screen.getByText("テスト太郎")).toBeInTheDocument();
    });

    it("削除に失敗したら通知は一覧に残る", async () => {
      mockDelete.mockRejectedValue(new Error("削除に失敗"));
      renderNotifications([buildNotification({ id: 1 })]);
      await screen.findByText("テスト太郎");

      fireEvent.click(screen.getByRole("button", { name: "通知を削除" }));
      await screen.findByText("この通知を削除しますか？");
      // 再取得が返ってこない状況でも巻き戻せていることを見るため、以降の取得は保留のままにする
      mockGet.mockImplementation(() => new Promise(() => {}));
      fireEvent.click(screen.getByRole("button", { name: "削除する" }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("通知の削除に失敗しました");
      });
      expect(screen.getByText("テスト太郎")).toBeInTheDocument();
    });

    it("運営からのお知らせには削除ボタンを出さない", async () => {
      renderNotifications([
        buildNotification({
          id: "mn_1",
          event_type: "management_notice",
          title: "メンテナンスのお知らせ",
          management_notice_id: 1,
        }),
      ]);

      await screen.findByText("メンテナンスのお知らせ");
      expect(
        screen.queryByRole("button", { name: "通知を削除" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("グループ招待", () => {
    const groupInvitation = (state: string) =>
      buildNotification({
        id: 2,
        event_type: "group_invitation",
        group_invitation: state,
        group_name: "バズベース",
      });

    it("保留中は参加・拒否のボタンを表示する", async () => {
      renderNotifications([groupInvitation("pending")]);

      expect(
        await screen.findByRole("button", { name: "参加する" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "拒否する" }),
      ).toBeInTheDocument();
      expect(screen.queryByText("参加済み")).not.toBeInTheDocument();
    });

    it("承認済みでも履歴として表示し、状態が分かる", async () => {
      renderNotifications([groupInvitation("accepted")]);

      expect(await screen.findByText("バズベース")).toBeInTheDocument();
      expect(screen.getByText("参加済み")).toBeInTheDocument();
    });

    it("辞退済みでも履歴として表示し、状態が分かる", async () => {
      renderNotifications([groupInvitation("declined")]);

      expect(await screen.findByText("バズベース")).toBeInTheDocument();
      expect(screen.getByText("辞退済み")).toBeInTheDocument();
    });

    it.each(["accepted", "declined"])(
      "%s では参加・拒否のボタンを出さない",
      async (state) => {
        renderNotifications([groupInvitation(state)]);

        await screen.findByText("バズベース");
        expect(
          screen.queryByRole("button", { name: "参加する" }),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole("button", { name: "拒否する" }),
        ).not.toBeInTheDocument();
      },
    );

    it("無料枠の上限で参加を拒否されたら専用文言とPro訴求モーダルを出す", async () => {
      mockPost.mockRejectedValue(
        new AxiosError("forbidden", "ERR_BAD_REQUEST", undefined, undefined, {
          status: 403,
          statusText: "Forbidden",
          data: {
            error: "group_limit_exceeded",
            message: "Pro プランでグループを無制限に作成・参加できます",
          },
          headers: new AxiosHeaders(),
          config: { headers: new AxiosHeaders() },
        }),
      );
      renderNotifications([groupInvitation("pending")]);

      fireEvent.click(await screen.findByRole("button", { name: "参加する" }));

      await waitFor(() =>
        expect(mockToastError).toHaveBeenCalledWith(
          expect.stringContaining("無料プランで参加できるグループは1つまで"),
        ),
      );
      expect(mockOpenProUpgradeModal).toHaveBeenCalledWith({
        trigger: "unlimited_groups",
      });
    });
  });
});
