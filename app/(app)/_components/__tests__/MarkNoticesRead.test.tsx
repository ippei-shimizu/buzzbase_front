import * as Sentry from "@sentry/nextjs";
import { act, render, screen, waitFor } from "@testing-library/react";
import { AxiosError, AxiosHeaders } from "axios";
import { StrictMode } from "react";
import { SWRConfig } from "swr";
import NotificationBadge from "@app/components/notification/NotificationBadge";
import { UserContext } from "@app/contexts/userContext";
import { useNotifications } from "@app/hooks/notification/getNotifications";
import { markManagementNoticesRead } from "@app/services/notificationsService";
import axiosInstance from "@app/utils/axiosInstance";
import MarkNoticesRead from "../MarkNoticesRead";

jest.mock("@app/services/notificationsService", () => ({
  markManagementNoticesRead: jest.fn(),
}));

jest.mock("@app/utils/axiosInstance", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
  setUser: jest.fn(),
}));

const markReadMock = markManagementNoticesRead as jest.Mock;
const getMock = axiosInstance.get as jest.Mock;
const captureExceptionMock = Sentry.captureException as jest.Mock;

const USER_ID = "buzz-user";
const NOTIFICATION_LIST_KEY = `/api/v1/notifications?user_id=${USER_ID}`;

function buildAxiosError(status: number) {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError("request failed", "ERR_BAD_RESPONSE", config, null, {
    status,
    statusText: "",
    data: {},
    headers: {},
    config,
  });
}

function withSWR(ui: React.ReactNode) {
  return (
    <SWRConfig
      value={{
        dedupingInterval: 0,
        provider: () => new Map(),
        shouldRetryOnError: false,
      }}
    >
      {ui}
    </SWRConfig>
  );
}

function withUser(ui: React.ReactNode) {
  return (
    <UserContext.Provider
      value={{
        state: {
          userId: { id: 1, team_id: 1, user_id: USER_ID },
          usersUserId: { user_id: USER_ID },
        },
      }}
    >
      {ui}
    </UserContext.Provider>
  );
}

function renderWithSWR(ui: React.ReactNode) {
  return render(withSWR(ui));
}

/** 通知一覧の SWR キーが再検証されたかを、未読/既読の表示差分で観測するための probe */
function NotificationListProbe() {
  const { notifications } = useNotifications();
  const notice = notifications?.[0];
  if (!notice) return null;
  return <p>{notice.read_at ? "既読" : "未読"}</p>;
}

describe("MarkNoticesRead", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    markReadMock.mockResolvedValue({ message: "既読にしました" });
  });

  it("既読化に成功すると未読バッジのカウントを再検証する", async () => {
    let completeMarkRead!: () => void;
    markReadMock.mockReturnValue(
      new Promise<void>((resolve) => {
        completeMarkRead = resolve;
      }),
    );
    getMock
      .mockResolvedValueOnce({ data: { count: 3 } })
      .mockResolvedValue({ data: { count: 0 } });

    renderWithSWR(
      <>
        <MarkNoticesRead />
        <NotificationBadge />
      </>,
    );

    expect(await screen.findByText("3")).toBeInTheDocument();

    await act(async () => {
      completeMarkRead();
    });

    await waitFor(() => {
      expect(screen.queryByText("3")).not.toBeInTheDocument();
    });
    expect(getMock).toHaveBeenCalledWith("/api/v1/notifications/count");
    expect(getMock).toHaveBeenCalledTimes(2);
  });

  it("既読化に成功すると通知一覧のキャッシュも再検証する", async () => {
    let completeMarkRead!: () => void;
    markReadMock.mockReturnValue(
      new Promise<void>((resolve) => {
        completeMarkRead = resolve;
      }),
    );

    let listRequestCount = 0;
    getMock.mockImplementation((url: string) => {
      if (url === NOTIFICATION_LIST_KEY) {
        listRequestCount += 1;
        return Promise.resolve({
          data: [
            {
              id: 1,
              event_type: "management_notice",
              read_at: listRequestCount === 1 ? null : "2026-08-01T00:00:00Z",
            },
          ],
        });
      }
      return Promise.resolve({ data: { count: 0 } });
    });

    renderWithSWR(
      withUser(
        <>
          <MarkNoticesRead />
          <NotificationListProbe />
        </>,
      ),
    );

    expect(await screen.findByText("未読")).toBeInTheDocument();

    await act(async () => {
      completeMarkRead();
    });

    expect(await screen.findByText("既読")).toBeInTheDocument();
    expect(getMock).toHaveBeenCalledWith(NOTIFICATION_LIST_KEY);
    expect(listRequestCount).toBe(2);
  });

  it("Strict Mode で再マウントされても既読化は一度しか実行しない", async () => {
    getMock.mockResolvedValue({ data: { count: 0 } });

    render(<StrictMode>{withSWR(<MarkNoticesRead />)}</StrictMode>);

    await waitFor(() => {
      expect(markReadMock).toHaveBeenCalled();
    });
    expect(markReadMock).toHaveBeenCalledTimes(1);
  });

  it("未ログイン（401）で既読化に失敗しても再検証せず Sentry にも通知しない", async () => {
    markReadMock.mockRejectedValue(buildAxiosError(401));
    getMock.mockResolvedValue({ data: { count: 3 } });

    renderWithSWR(
      <>
        <MarkNoticesRead />
        <NotificationBadge />
      </>,
    );

    expect(await screen.findByText("3")).toBeInTheDocument();

    await waitFor(() => {
      expect(markReadMock).toHaveBeenCalledTimes(1);
    });
    expect(getMock).toHaveBeenCalledTimes(1);
    expect(captureExceptionMock).not.toHaveBeenCalled();
  });

  it("401 以外で既読化に失敗した場合は Sentry に通知する", async () => {
    const serverError = buildAxiosError(500);
    markReadMock.mockRejectedValue(serverError);
    getMock.mockResolvedValue({ data: { count: 3 } });

    renderWithSWR(
      <>
        <MarkNoticesRead />
        <NotificationBadge />
      </>,
    );

    await waitFor(() => {
      expect(captureExceptionMock).toHaveBeenCalledWith(serverError, {
        tags: { source: "mark-notices-read" },
      });
    });
    expect(getMock).toHaveBeenCalledTimes(1);
  });
});
