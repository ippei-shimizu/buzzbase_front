import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "./admin-auth";

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export class AdminApiError extends Error {
  public readonly status: number;
  public readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.code = code;
  }
}

export interface ApiHandlerOptions {
  requireAuth?: boolean;
  logErrors?: boolean;
}

type ApiHandler = (
  request: NextRequest,
  context?: any
) => Promise<NextResponse>;

/**
 * 管理画面API用の共通エラーハンドリングラッパー
 */
export function withAdminErrorHandler(
  handler: ApiHandler,
  options: ApiHandlerOptions = {}
): ApiHandler {
  const { requireAuth = true, logErrors = true } = options;

  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      // 認証チェック
      if (requireAuth) {
        const adminUser = await getAdminUser();
        if (!adminUser) {
          throw new AdminApiError("認証が必要です", 401, "UNAUTHORIZED");
        }
      }

      // メインハンドラーの実行
      return await handler(request, context);
    } catch (error) {
      return handleApiError(error, logErrors);
    }
  };
}

/**
 * エラーレスポンスの統一処理
 */
function handleApiError(error: unknown, logErrors: boolean): NextResponse {
  if (logErrors) {
    console.error("Admin API Error:", error);
  }

  // AdminApiErrorの場合
  if (error instanceof AdminApiError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: error.status }
    );
  }

  // バリデーションエラーなどの一般的なエラー
  if (error instanceof Error) {
    // 特定のエラーメッセージパターンをチェック
    if (error.message.includes("validation")) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }
  }

  // 予期しないエラー
  return NextResponse.json(
    {
      success: false,
      error: "サーバーエラーが発生しました",
      code: "INTERNAL_SERVER_ERROR",
    },
    { status: 500 }
  );
}

/**
 * 外部API呼び出し用のエラーハンドリング
 */
export async function handleExternalApiCall(
  apiCall: () => Promise<Response>,
  errorMessage: string = "外部APIの呼び出しに失敗しました"
): Promise<any> {
  try {
    const response = await apiCall();

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AdminApiError(
        errorData.error || errorMessage,
        response.status,
        "EXTERNAL_API_ERROR"
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof AdminApiError) {
      throw error;
    }
    throw new AdminApiError(errorMessage, 500, "EXTERNAL_API_ERROR");
  }
}

/**
 * リクエストボディのバリデーション
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  validator: (data: any) => T | Promise<T>
): Promise<T> {
  try {
    const body = await request.json();
    return await validator(body);
  } catch (error) {
    if (error instanceof Error) {
      throw new AdminApiError(
        `リクエストデータが無効です: ${error.message}`,
        400,
        "VALIDATION_ERROR"
      );
    }
    throw new AdminApiError(
      "リクエストデータが無効です",
      400,
      "VALIDATION_ERROR"
    );
  }
}
