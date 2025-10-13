import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PasswordConfirmInput from "../PasswordConfirmInput";

describe("PasswordConfirmInput", () => {
  const mockOnChange = jest.fn();
  const mockToggleConfirmVisibility = jest.fn();

  const defaultProps = {
    value: "",
    onChange: mockOnChange,
    className: "test-class",
    placeholder: "パスワード（確認）を入力",
    type: "password",
    isConfirmVisible: false,
    toggleConfirmVisibility: mockToggleConfirmVisibility,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("パスワード確認入力フィールドが正しくレンダリングされる", () => {
    render(<PasswordConfirmInput {...defaultProps} />);

    const input = screen.getByPlaceholderText("パスワード（確認）を入力");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "password");
  });

  it("ラベルが正しく表示される", () => {
    render(
      <PasswordConfirmInput {...defaultProps} label="パスワード（確認）" />,
    );

    expect(screen.getByText("パスワード（確認）")).toBeInTheDocument();
  });

  it("入力値が正しく表示される", () => {
    render(<PasswordConfirmInput {...defaultProps} value="test123" />);

    const input = screen.getByPlaceholderText("パスワード（確認）を入力");
    expect(input).toHaveValue("test123");
  });

  it("入力時にonChangeが呼ばれる", async () => {
    const user = userEvent.setup();
    render(<PasswordConfirmInput {...defaultProps} />);

    const input = screen.getByPlaceholderText("パスワード（確認）を入力");
    await user.type(input, "a");

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("表示/非表示切り替えボタンが機能する", async () => {
    const user = userEvent.setup();
    render(<PasswordConfirmInput {...defaultProps} />);

    // 切り替えボタンを取得（type=buttonのボタン）
    const toggleButton = screen.getByRole("button", { hidden: true });
    await user.click(toggleButton);

    expect(mockToggleConfirmVisibility).toHaveBeenCalledTimes(1);
  });

  it("isConfirmVisibleがtrueの時、パスワードが表示される", () => {
    render(<PasswordConfirmInput {...defaultProps} isConfirmVisible={true} />);

    const input = screen.getByPlaceholderText("パスワード（確認）を入力");
    expect(input).toHaveAttribute("type", "text");
  });

  it("variantプロパティが正しく適用される", () => {
    render(<PasswordConfirmInput {...defaultProps} variant="bordered" />);

    const input = screen.getByPlaceholderText("パスワード（確認）を入力");
    expect(input).toBeInTheDocument();
  });

  it("labelPlacementプロパティが正しく適用される", () => {
    render(
      <PasswordConfirmInput
        {...defaultProps}
        label="パスワード（確認）"
        labelPlacement="outside"
      />,
    );

    expect(screen.getByText("パスワード（確認）")).toBeInTheDocument();
  });

  it("classNameが正しく適用される", () => {
    const { container } = render(
      <PasswordConfirmInput {...defaultProps} className="custom-class" />,
    );

    // classNameが適用されていることを確認
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });
});
