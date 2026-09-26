import { render, screen } from "@testing-library/react";
import { useEffect } from "react";
import Page from "../page";

const mockPush = jest.fn();
let searchParams = new URLSearchParams();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => searchParams,
}));

let isLoggedIn: boolean | undefined = false;
jest.mock("@app/contexts/useAuthContext", () => ({
  useAuthContext: () => ({ isLoggedIn }),
}));

jest.mock("@app/components/auth/SignIn", () => ({
  __esModule: true,
  default: () => <div data-testid="sign-in-form" />,
}));

jest.mock("../_components/SignUpCompletionTracker", () => ({
  __esModule: true,
  default: () => null,
}));

// 自動ログインの進行状況だけを外から制御し、ページ側の出し分けを検証する
let notifyAutoLogin: ((isAutoLoggingIn: boolean) => void) | null = null;

// 実体と同じく effect で通知する。レンダー中に呼ぶと親の更新警告が出る
function MockEmailConfirmationAutoLogin({
  onAutoLoginChange,
}: {
  onAutoLoginChange: (isAutoLoggingIn: boolean) => void;
}) {
  useEffect(() => {
    if (notifyAutoLogin) onAutoLoginChange(true);
  }, [onAutoLoginChange]);
  return null;
}
jest.mock("../_components/EmailConfirmationAutoLogin", () => ({
  __esModule: true,
  default: MockEmailConfirmationAutoLogin,
  hasConfirmationTokens: ({
    accessToken,
    client,
    uid,
  }: {
    accessToken: string | null;
    client: string | null;
    uid: string | null;
  }) => Boolean(accessToken && client && uid),
}));

const AUTO_LOGIN_TEXT =
  "メールアドレスの認証が完了しました。ログインしています...";
// br で分割された p 要素なので、要素の textContent 全体とは一致しない
const MANUAL_LOGIN_TEXT =
  /先ほどのメールアドレスとパスワードを入力してください/;

describe("signin ページ", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    searchParams = new URLSearchParams();
    isLoggedIn = false;
    notifyAutoLogin = null;
  });

  it("自動ログイン中はログインフォームを出さず進行中の案内を出す", () => {
    searchParams = new URLSearchParams(
      "account_confirmation_success=true&access-token=t&client=c&uid=user%40example.com",
    );
    notifyAutoLogin = () => {};

    render(<Page />);

    expect(screen.getByText(AUTO_LOGIN_TEXT)).toBeInTheDocument();
    expect(screen.queryByTestId("sign-in-form")).not.toBeInTheDocument();
  });

  it("トークン付きで着地しても自動ログインが始まらなければフォームを出す", () => {
    searchParams = new URLSearchParams(
      "account_confirmation_success=true&access-token=t&client=c&uid=user%40example.com",
    );

    render(<Page />);

    expect(screen.getByTestId("sign-in-form")).toBeInTheDocument();
    expect(screen.queryByText(AUTO_LOGIN_TEXT)).not.toBeInTheDocument();
  });

  it("トークンが無い確認完了では手動ログインの案内を出す", () => {
    searchParams = new URLSearchParams("account_confirmation_success=true");

    render(<Page />);

    expect(screen.getByText(MANUAL_LOGIN_TEXT)).toBeInTheDocument();
    expect(screen.getByTestId("sign-in-form")).toBeInTheDocument();
  });

  it("トークン付きで着地したときはセッション復元のリダイレクトを動かさない", () => {
    searchParams = new URLSearchParams(
      "access-token=t&client=c&uid=user%40example.com",
    );
    isLoggedIn = true;

    render(<Page />);

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("トークンが無くログイン済みならトップへ送る", () => {
    isLoggedIn = true;

    render(<Page />);

    expect(mockPush).toHaveBeenCalledWith("/");
  });
});
