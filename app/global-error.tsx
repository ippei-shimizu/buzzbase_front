"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ja">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            fontFamily: "sans-serif",
          }}
        >
          <h2>エラーが発生しました</h2>
          <p>予期しないエラーが発生しました。</p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              borderRadius: "0.25rem",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            もう一度試す
          </button>
        </div>
      </body>
    </html>
  );
}
