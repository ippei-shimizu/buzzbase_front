import { resolveNextPath } from "../nextPath";

describe("resolveNextPath", () => {
  it("サイト内の絶対パスはそのまま採用する", () => {
    expect(resolveNextPath("/mypage/buzz_user")).toBe("/mypage/buzz_user");
    expect(resolveNextPath("/dashboard?tab=batting")).toBe(
      "/dashboard?tab=batting",
    );
  });

  it("未指定ならダッシュボードに倒す", () => {
    expect(resolveNextPath(null)).toBe("/dashboard");
    expect(resolveNextPath(undefined)).toBe("/dashboard");
    expect(resolveNextPath("")).toBe("/dashboard");
  });

  it("外部サイトに飛ばしうる値は採用しない", () => {
    expect(resolveNextPath("//evil.example.com")).toBe("/dashboard");
    expect(resolveNextPath("/\\evil.example.com")).toBe("/dashboard");
    expect(resolveNextPath("https://evil.example.com")).toBe("/dashboard");
    expect(resolveNextPath("javascript:alert(1)")).toBe("/dashboard");
    expect(resolveNextPath("mypage/buzz_user")).toBe("/dashboard");
  });
});
