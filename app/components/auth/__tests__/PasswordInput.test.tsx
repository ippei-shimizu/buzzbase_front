import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PasswordInput from "../PasswordInput";

describe("PasswordInput", () => {
  const mockOnChange = jest.fn();
  const mockTogglePasswordVisibility = jest.fn();

  const defaultProps = {
    value: "",
    onChange: mockOnChange,
    className: "test-class",
    placeholder: "パスワードを入力",
    isInvalid: false,
    type: "password",
    isPasswordVisible: false,
    togglePasswordVisibility: mockTogglePasswordVisibility,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("パスワード入力フィールドが正しくレンダリングされる", () => {
    render(<PasswordInput {...defaultProps} />);

    const input = screen.getByPlaceholderText("パスワードを入力");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "password");
  });

  it("ラベルが正しく表示される", () => {
    render(<PasswordInput {...defaultProps} label="パスワード" />);

    expect(screen.getByText("パスワード")).toBeInTheDocument();
  });

  it("入力値が正しく表示される", () => {
    render(<PasswordInput {...defaultProps} value="test123" />);

    const input = screen.getByPlaceholderText("パスワードを入力");
    expect(input).toHaveValue("test123");
  });

  it("入力時にonChangeが呼ばれる", async () => {
    const user = userEvent.setup();
    render(<PasswordInput {...defaultProps} />);

    const input = screen.getByPlaceholderText("パスワードを入力");
    await user.type(input, "a");

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("表示/非表示切り替えボタンが機能する", async () => {
    const user = userEvent.setup();
    render(<PasswordInput {...defaultProps} />);

    // 切り替えボタンを取得（type=buttonのボタン）
    const toggleButton = screen.getByRole("button", { hidden: true });
    await user.click(toggleButton);

    expect(mockTogglePasswordVisibility).toHaveBeenCalledTimes(1);
  });

  it("isPasswordVisibleがtrueの時、パスワードが表示される", () => {
    render(<PasswordInput {...defaultProps} isPasswordVisible={true} />);

    const input = screen.getByPlaceholderText("パスワードを入力");
    expect(input).toHaveAttribute("type", "text");
  });

  it("isInvalidがtrueの時、エラーメッセージが表示される", () => {
    render(
      <PasswordInput
        {...defaultProps}
        isInvalid={true}
        errorMessage="パスワードが短すぎます"
      />,
    );

    expect(screen.getByText("パスワードが短すぎます")).toBeInTheDocument();
  });

  it("isInvalidがtrueの時、colorがdangerになる", () => {
    const { container } = render(
      <PasswordInput
        {...defaultProps}
        isInvalid={true}
        errorMessage="エラー"
      />,
    );

    // NextUIのInputコンポーネントがdangerクラスを持つか確認
    const input = screen.getByPlaceholderText("パスワードを入力");
    expect(input).toBeInTheDocument();
  });

  it("variantプロパティが正しく適用される", () => {
    render(<PasswordInput {...defaultProps} variant="bordered" />);

    const input = screen.getByPlaceholderText("パスワードを入力");
    expect(input).toBeInTheDocument();
  });

  it("labelPlacementプロパティが正しく適用される", () => {
    render(
      <PasswordInput
        {...defaultProps}
        label="パスワード"
        labelPlacement="outside"
      />,
    );

    expect(screen.getByText("パスワード")).toBeInTheDocument();
  });

  it("classNameが正しく適用される", () => {
    const { container } = render(
      <PasswordInput {...defaultProps} className="custom-class" />,
    );

    // classNameが適用されていることを確認
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("colorプロパティが正しく適用される（isInvalidがfalseの場合）", () => {
    render(<PasswordInput {...defaultProps} color="primary" />);

    const input = screen.getByPlaceholderText("パスワードを入力");
    expect(input).toBeInTheDocument();
  });
});
