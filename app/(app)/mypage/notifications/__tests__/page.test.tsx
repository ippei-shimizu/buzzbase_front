import { render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { markManagementNoticesRead } from "@app/services/notificationsService";
import Notifications from "../page";

jest.mock("@app/services/notificationsService", () => ({
  markManagementNoticesRead: jest.fn(),
}));

jest.mock("@app/components/header/Header", () => ({
  __esModule: true,
  default: () => <header />,
}));

jest.mock("@app/components/notification/NotificationItem", () => ({
  __esModule: true,
  default: () => null,
}));

const markReadMock = markManagementNoticesRead as jest.Mock;

describe("通知一覧ページ", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    markReadMock.mockResolvedValue({ message: "既読にしました" });
  });

  it("開いたときに運営お知らせを既読化する", async () => {
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <Notifications />
      </SWRConfig>,
    );

    await waitFor(() => {
      expect(markReadMock).toHaveBeenCalledTimes(1);
    });
  });
});
