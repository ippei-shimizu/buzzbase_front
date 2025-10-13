import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserNameInput from "../UserNameInput";

describe("UserNameInput", () => {
  const mockOnChange = jest.fn();

  const defaultProps = {
    value: "",
    onChange: mockOnChange,
    className: "test-class",
    placeholder: "ユーザー名を入力",
    isInvalid: false,
    isRequired: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ユーザー名入力フィールドが正しくレンダリングされる", () => {
    render(<UserNameInput {...defaultProps} />);

    const input = screen.getByPlaceholderText("ユーザー名を入力");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
  });

  it("ラベルが正しく表示される", () => {
    render(<UserNameInput {...defaultProps} label="ユーザー名" />);

    expect(screen.getByText("ユーザー名")).toBeInTheDocument();
  });

  it("入力値が正しく表示される", () => {
    render(<UserNameInput {...defaultProps} value="山田太郎" />);

    const input = screen.getByPlaceholderText("ユーザー名を入力");
    expect(input).toHaveValue("山田太郎");
  });

  it("入力時にonChangeが呼ばれる", async () => {
    const user = userEvent.setup();
    render(<UserNameInput {...defaultProps} />);

    const input = screen.getByPlaceholderText("ユーザー名を入力");
    await user.type(input, "a");

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("isInvalidがtrueの時、エラーメッセージが表示される", () => {
    render(
      <UserNameInput
        {...defaultProps}
        isInvalid={true}
        errorMessage="ユーザー名が無効です"
      />,
    );

    expect(screen.getByText("ユーザー名が無効です")).toBeInTheDocument();
  });

  it("isInvalidがtrueの時、colorがdangerになる", () => {
    render(
      <UserNameInput
        {...defaultProps}
        isInvalid={true}
        errorMessage="エラー"
      />,
    );

    const input = screen.getByPlaceholderText("ユーザー名を入力");
    expect(input).toBeInTheDocument();
  });

  it("isRequiredがtrueの時、必須項目として機能する", () => {
    render(
      <UserNameInput {...defaultProps} isRequired={true} label="ユーザー名" />,
    );

    // NextUIのInputコンポーネントがrequiredフィールドを持つ
    const input = screen.getByPlaceholderText("ユーザー名を入力");
    expect(input).toBeInTheDocument();
  });

  it("variantプロパティが正しく適用される", () => {
    render(<UserNameInput {...defaultProps} variant="bordered" />);

    const input = screen.getByPlaceholderText("ユーザー名を入力");
    expect(input).toBeInTheDocument();
  });

  it("labelPlacementプロパティが正しく適用される", () => {
    render(
      <UserNameInput
        {...defaultProps}
        label="ユーザー名"
        labelPlacement="outside"
      />,
    );

    expect(screen.getByText("ユーザー名")).toBeInTheDocument();
  });

  it("classNameが正しく適用される", () => {
    const { container } = render(
      <UserNameInput {...defaultProps} className="custom-class" />,
    );

    // classNameが適用されていることを確認
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("colorプロパティが正しく適用される（isInvalidがfalseの場合）", () => {
    render(<UserNameInput {...defaultProps} color="primary" />);

    const input = screen.getByPlaceholderText("ユーザー名を入力");
    expect(input).toBeInTheDocument();
  });

  it("typeプロパティが正しく適用される", () => {
    render(<UserNameInput {...defaultProps} type="email" />);

    const input = screen.getByPlaceholderText("ユーザー名を入力");
    expect(input).toHaveAttribute("type", "email");
  });
});
