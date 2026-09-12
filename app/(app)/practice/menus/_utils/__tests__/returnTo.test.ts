import { resolveReturnTo } from "../returnTo";

describe("resolveReturnTo", () => {
  it("アプリ内の相対パスはそのまま返す", () => {
    expect(resolveReturnTo("/practice/record?date=2026-08-08")).toBe(
      "/practice/record?date=2026-08-08",
    );
  });

  it("未指定なら null", () => {
    expect(resolveReturnTo(undefined)).toBeNull();
  });

  it("`/` 始まりでない値は null（外部 URL のオープンリダイレクト防止）", () => {
    expect(resolveReturnTo("https://evil.example.com")).toBeNull();
  });

  it("`//` 始まりの値は null（プロトコル相対 URL のオープンリダイレクト防止）", () => {
    expect(resolveReturnTo("//evil.example.com")).toBeNull();
  });

  it("`/\\` 始まりの値は null（ブラウザが `\\` を `/` と同一視するバイパス防止）", () => {
    expect(resolveReturnTo("/\\evil.example.com")).toBeNull();
  });
});
