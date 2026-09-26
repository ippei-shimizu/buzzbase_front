const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: `${process.env.NEXT_PUBLIC_IMAGE_PROTOCOL}`,
        hostname: `${process.env.NEXT_PUBLIC_IMAGE_HOSTNAME}`,
        port: `${process.env.NEXT_PUBLIC_IMAGE_PORT}`,
        pathname: `${process.env.NEXT_PUBLIC_IMAGE_PATHNAME}`,
      },
    ],
    qualities: [75],
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
  async redirects() {
    // 数値別コラムを目安記事に統合したため、旧 URL は該当セクションへ恒久リダイレクトする
    return [
      {
        source: "/column/ops-700",
        destination: "/column/ops-criteria#ops-700",
        permanent: true,
      },
      {
        source: "/column/ops-800",
        destination: "/column/ops-criteria#ops-800",
        permanent: true,
      },
      {
        source: "/column/ops-max",
        destination: "/column/ops-criteria#ops-max",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXT_PUBLIC_BACKEND_URL,
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
};

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  hideSourceMaps: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // SENTRY_AUTH_TOKEN が未設定の環境ではソースマップアップロードはスキップされる
  // 本番ビルド時のみ CI/CD で SENTRY_ORG / SENTRY_PROJECT / SENTRY_AUTH_TOKEN を設定する
});
