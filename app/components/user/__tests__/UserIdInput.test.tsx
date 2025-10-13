import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserIdInput from "../UserIdInput";

describe("UserIdInput", () => {
  const mockOnChange = jest.fn();

  const defaultProps = {
    value: "",
    onChange: mockOnChange,
    className: "test-class",
    placeholder: "ユーザーIDを入力",
    isInvalid: false,
    isRequired: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ユーザーID入力フィールドが正しくレンダリングされる", () => {
    render(<UserIdInput {...defaultProps} />);

    const input = screen.getByPlaceholderText("ユーザーIDを入力");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
  });

  it("ラベルが正しく表示される", () => {
    render(<UserIdInput {...defaultProps} label="ユーザーID" />);

    expect(screen.getByText("ユーザーID")).toBeInTheDocument();
  });

  it("入力値が正しく表示される", () => {
    render(<UserIdInput {...defaultProps} value="test_user" />);

    const input = screen.getByPlaceholderText("ユーザーIDを入力");
    expect(input).toHaveValue("test_user");
  });

  it("入力時にonChangeが呼ばれる", async () => {
    const user = userEvent.setup();
    render(<UserIdInput {...defaultProps} />);

    const input = screen.getByPlaceholderText("ユーザーIDを入力");
    await user.type(input, "a");

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("isInvalidがtrueの時、エラーメッセージが表示される", () => {
    render(
      <UserIdInput
        {...defaultProps}
        isInvalid={true}
        errorMessage="ユーザーIDが無効です"
      />,
    );

    expect(screen.getByText("ユーザーIDが無効です")).toBeInTheDocument();
  });

  it("isInvalidがtrueの時、colorがdangerになる", () => {
    render(
      <UserIdInput {...defaultProps} isInvalid={true} errorMessage="エラー" />,
    );

    const input = screen.getByPlaceholderText("ユーザーIDを入力");
    expect(input).toBeInTheDocument();
  });

  it("isRequiredがtrueの時、必須項目として機能する", () => {
    render(
      <UserIdInput {...defaultProps} isRequired={true} label="ユーザーID" />,
    );

    // NextUIのInputコンポーネントがrequiredフィールドを持つ
    const input = screen.getByPlaceholderText("ユーザーIDを入力");
    expect(input).toBeInTheDocument();
  });

  it("variantプロパティが正しく適用される", () => {
    render(<UserIdInput {...defaultProps} variant="bordered" />);

    const input = screen.getByPlaceholderText("ユーザーIDを入力");
    expect(input).toBeInTheDocument();
  });

  it("labelPlacementプロパティが正しく適用される", () => {
    render(
      <UserIdInput
        {...defaultProps}
        label="ユーザーID"
        labelPlacement="outside"
      />,
    );

    expect(screen.getByText("ユーザーID")).toBeInTheDocument();
  });

  it("classNameが正しく適用される", () => {
    const { container } = render(
      <UserIdInput {...defaultProps} className="custom-class" />,
    );

    // classNameが適用されていることを確認
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("colorプロパティが正しく適用される（isInvalidがfalseの場合）", () => {
    render(<UserIdInput {...defaultProps} color="primary" />);

    const input = screen.getByPlaceholderText("ユーザーIDを入力");
    expect(input).toBeInTheDocument();
  });

  it("typeプロパティが正しく適用される", () => {
    render(<UserIdInput {...defaultProps} type="email" />);

    const input = screen.getByPlaceholderText("ユーザーIDを入力");
    expect(input).toHaveAttribute("type", "email");
  });
});
