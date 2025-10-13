import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmailInput from "../EmailInput";

describe("EmailInput", () => {
  it("入力フィールドが正しくレンダリングされる", () => {
    render(<EmailInput value="" onChange={jest.fn()} />);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("入力が正しく動作する", async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();

    render(<EmailInput value="" onChange={mockOnChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "test@example.com");

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("バリデーションエラーが表示される", () => {
    render(
      <EmailInput
        value="invalid-email"
        onChange={jest.fn()}
        isInvalid={true}
        errorMessage="正しいメールアドレスを入力してください"
      />,
    );

    expect(
      screen.getByText("正しいメールアドレスを入力してください"),
    ).toBeInTheDocument();
  });

  it("正しいメールアドレスではエラーが表示されない", () => {
    render(
      <EmailInput
        value="test@example.com"
        onChange={jest.fn()}
        isInvalid={false}
      />,
    );

    expect(
      screen.queryByText("正しいメールアドレスを入力してください"),
    ).not.toBeInTheDocument();
  });

  it("labelが指定された場合に表示される", () => {
    render(<EmailInput value="" onChange={jest.fn()} label="メールアドレス" />);

    expect(screen.getByText("メールアドレス")).toBeInTheDocument();
  });

  it("placeholderが指定された場合に表示される", () => {
    render(
      <EmailInput
        value=""
        onChange={jest.fn()}
        placeholder="example@email.com"
      />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("placeholder", "example@email.com");
  });
});
