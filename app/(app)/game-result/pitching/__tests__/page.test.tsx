import { render } from "@testing-library/react";
import PitchingRecord from "../page";

const mockCapture = jest.fn();
jest.mock("@app/utils/posthog", () => ({
  capture: (...args: unknown[]) => mockCapture(...args),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/game-result/pitching",
}));

jest.mock("@app/contexts/useAuthContext", () => ({
  useAuthContext: () => ({ isLoggedIn: true, loading: false }),
}));

jest.mock("@app/components/header/HeaderResult", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@app/services/pitchingResultsService", () => ({
  checkExistingPitchingResult: () => Promise.resolve(null),
  createPitchingResult: () => Promise.resolve({}),
  updatePitchingResult: () => Promise.resolve({}),
}));

jest.mock("@app/services/gameResultsService", () => ({
  updatePitchingResultId: () => Promise.resolve({}),
}));

jest.mock("@app/services/userService", () => ({
  getCurrentUserId: () => Promise.resolve(1),
}));

describe("投手成績入力ページの計測", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("投手成績ステップの表示を game record step viewed で送る", () => {
    render(<PitchingRecord />);

    expect(mockCapture).toHaveBeenCalledWith("game record step viewed", {
      step: 3,
    });
  });
});
