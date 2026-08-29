const mockAxiosGet = jest.fn();

jest.mock("@app/utils/axiosInstance", () => ({
  __esModule: true,
  default: { get: (...args: unknown[]) => mockAxiosGet(...args) },
}));

import { getUserTournaments } from "../tournamentsService";

function requestedUrl(): string {
  return mockAxiosGet.mock.calls[0][0] as string;
}

describe("getUserTournaments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxiosGet.mockResolvedValue({ data: [{ id: 7, name: "県大会" }] });
  });

  it("ユーザーの試合に紐づく大会だけを取りにいく（全大会 index は使わない）", async () => {
    await getUserTournaments();

    expect(requestedUrl()).toBe("/api/v1/tournaments/user_tournaments");
  });

  it("ユーザー指定時は user_id を送る", async () => {
    await getUserTournaments(12);

    expect(requestedUrl()).toBe(
      "/api/v1/tournaments/user_tournaments?user_id=12",
    );
  });

  it("取得した大会をそのまま返す", async () => {
    await expect(getUserTournaments()).resolves.toEqual([
      { id: 7, name: "県大会" },
    ]);
  });

  it("失敗時は空配列に畳んで throw しない（チップだけ消えて画面は壊れない）", async () => {
    mockAxiosGet.mockRejectedValue(new Error("network"));

    await expect(getUserTournaments(12)).resolves.toEqual([]);
  });
});
