import { render, screen, waitFor } from "@testing-library/react";
import {
  GAME_RESULT_ID_STORAGE_KEY,
  RECORD_PATTERN_STORAGE_KEY,
} from "@app/constants/gameRecord";
import PlateAppearanceListPage from "../page";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/game-result/plate-appearances",
}));

jest.mock("@app/contexts/useAuthContext", () => ({
  useAuthContext: () => ({ isLoggedIn: true, loading: false }),
}));

const mockGetPlateAppearancesByGame = jest.fn();
jest.mock("@app/services/v2/plateAppearanceService", () => ({
  getPlateAppearancesByGame: (id: number) => mockGetPlateAppearancesByGame(id),
}));

jest.mock("@app/services/pitchingResultsService", () => ({
  getCurrentPitchingResult: () => Promise.resolve([]),
}));

describe("打席一覧ページ", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockGetPlateAppearancesByGame.mockResolvedValue([]);
  });

  it("記録中の試合を見失ったときは試合一覧へ逃がす", async () => {
    localStorage.setItem(RECORD_PATTERN_STORAGE_KEY, '"both"');

    render(<PlateAppearanceListPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/game-result/lists");
    });
    // 記録画面へ戻すと空の試合が自動作成されるため、そこへは送らない。
    expect(mockPush).not.toHaveBeenCalledWith("/game-result/record");
    expect(mockGetPlateAppearancesByGame).not.toHaveBeenCalled();
  });

  it("記録中の試合があればその打席を読み込む", async () => {
    localStorage.setItem(GAME_RESULT_ID_STORAGE_KEY, "42");

    render(<PlateAppearanceListPage />);

    await waitFor(() => {
      expect(mockGetPlateAppearancesByGame).toHaveBeenCalledWith(42);
    });
    expect(mockPush).not.toHaveBeenCalled();
    expect(
      await screen.findByText(/最初の打席を記録しよう/),
    ).toBeInTheDocument();
  });
});
