// Testing Libraryのカスタムマッチャーを追加
import "@testing-library/jest-dom";

// Framer Motionのアニメーションを無効化（テスト高速化）
jest.mock("framer-motion", () => ({
  ...jest.requireActual("framer-motion"),
  AnimatePresence: ({ children }) => children,
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    section: ({ children, ...props }) => (
      <section {...props}>{children}</section>
    ),
    header: ({ children, ...props }) => <header {...props}>{children}</header>,
    li: ({ children, ...props }) => <li {...props}>{children}</li>,
  },
}));

// NextUIのRippleエフェクトをモック（動的インポートエラー回避）
jest.mock("@nextui-org/ripple", () => ({
  Ripple: ({ children }) => children,
  useRipple: () => ({
    ripples: [],
    onClick: jest.fn(),
    onClear: jest.fn(),
    onPress: jest.fn(),
    onPressStart: jest.fn(),
    onPressEnd: jest.fn(),
    onPressUp: jest.fn(),
  }),
}));

// NextUI Popoverのアニメーションモック（Select用）
jest.mock("@nextui-org/popover", () => {
  const actual = jest.requireActual("@nextui-org/popover");
  return {
    ...actual,
  };
});

// 環境変数のモック
process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";
process.env.NEXT_PUBLIC_IMAGE_PROTOCOL = "http";
process.env.NEXT_PUBLIC_IMAGE_HOSTNAME = "localhost";
process.env.NEXT_PUBLIC_IMAGE_PORT = "3000";
process.env.NEXT_PUBLIC_IMAGE_PATHNAME = "/**";
process.env.NEXT_PUBLIC_BACKEND_URL = "http://localhost:3000";
