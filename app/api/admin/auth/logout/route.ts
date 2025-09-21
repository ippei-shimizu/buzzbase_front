import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();

    cookieStore.delete("admin-session");

    return NextResponse.json({
      success: true,
      message: "ログアウトしました"
    });

  } catch (error) {
    console.error("Admin logout error:", error);
    return NextResponse.json(
      { success: false, error: "ログアウト処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
