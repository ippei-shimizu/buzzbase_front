import { act, render, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { SWRConfig } from "swr";
import NotificationBadge from "@app/components/notification/NotificationBadge";
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

const markReadMock = markManagementNoticesRead as jest.Mock;
const getMock = axiosInstance.get as jest.Mock;

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

function renderWithSWR(ui: React.ReactNode) {
  return render(withSWR(ui));
}

describe("MarkNoticesRead", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    markReadMock.mockResolvedValue({ message: "既読にしました" });
  });

  it("マウント時に運営お知らせを既読化する", async () => {
    getMock.mockResolvedValue({ data: { count: 0 } });

    renderWithSWR(<MarkNoticesRead />);

    await waitFor(() => {
      expect(markReadMock).toHaveBeenCalledTimes(1);
    });
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

  it("Strict Mode で再マウントされても既読化は一度しか実行しない", async () => {
    getMock.mockResolvedValue({ data: { count: 0 } });

    render(<StrictMode>{withSWR(<MarkNoticesRead />)}</StrictMode>);

    await waitFor(() => {
      expect(markReadMock).toHaveBeenCalled();
    });
    expect(markReadMock).toHaveBeenCalledTimes(1);
  });

  it("未ログインで既読化に失敗してもバッジの再検証を行わない", async () => {
    markReadMock.mockRejectedValue(new Error("Unauthorized"));
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
  });
});
