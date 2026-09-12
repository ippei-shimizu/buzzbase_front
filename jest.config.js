// 日時表示のテストを実行環境のタイムゾーンに依存させないため、サービスの主要ユーザーの
// タイムゾーンに固定する（worker はこの env を引き継いで起動する）
process.env.TZ = "Asia/Tokyo";

// 環境変数を先に設定（next.config.jsで必要）
process.env.NEXT_PUBLIC_IMAGE_PROTOCOL = "http";
process.env.NEXT_PUBLIC_IMAGE_HOSTNAME = "localhost";
process.env.NEXT_PUBLIC_IMAGE_PORT = "3000";
process.env.NEXT_PUBLIC_IMAGE_PATHNAME = "/**";
process.env.NEXT_PUBLIC_BACKEND_URL = "http://localhost:3000";
// Server Action を経由するコンポーネント（ProStatusProvider 等）を描画するテストは
// app/constants/api.ts を読み込む。未設定だとモジュール評価時に throw する
process.env.RAILS_API_URL = "http://localhost:3000";

const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // next.config.jsとテスト環境用の.envファイルが配置されたディレクトリをセット
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    // パスエイリアスの設定
    "^@/(.*)$": "<rootDir>/app/$1",
    "^@app/(.*)$": "<rootDir>/app/$1",
  },
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "!app/**/*.d.ts",
    "!app/**/_*.{js,jsx,ts,tsx}",
    "!app/**/layout.tsx",
    "!app/**/loading.tsx",
    "!app/**/providers.tsx",
  ],
};

module.exports = createJestConfig(customJestConfig);
