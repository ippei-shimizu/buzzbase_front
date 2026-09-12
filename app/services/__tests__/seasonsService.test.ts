const mockAxiosPatch = jest.fn();
const mockAxiosPut = jest.fn();

jest.mock("@app/utils/axiosInstance", () => ({
  __esModule: true,
  default: {
    patch: (...args: unknown[]) => mockAxiosPatch(...args),
    put: (...args: unknown[]) => mockAxiosPut(...args),
  },
}));

import { updateSeason } from "../seasonsService";

describe("シーズン更新", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxiosPatch.mockResolvedValue({ data: { id: 3, name: "2024年秋季" } });
  });

  it("PATCH でシーズン名を更新する", async () => {
    const result = await updateSeason(3, "2024年秋季");

    expect(mockAxiosPatch).toHaveBeenCalledWith("/api/v1/seasons/3", {
      season: { name: "2024年秋季" },
    });
    expect(mockAxiosPut).not.toHaveBeenCalled();
    expect(result).toEqual({ id: 3, name: "2024年秋季" });
  });

  it("APIがエラーを返した場合はそのままスローする", async () => {
    mockAxiosPatch.mockRejectedValueOnce(new Error("Request failed"));

    await expect(updateSeason(3, "2024年秋季")).rejects.toThrow(
      "Request failed",
    );
  });
});
