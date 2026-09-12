import type { Pagination } from "@app/interface/plateAppearanceMasters";

export interface StadiumPrefecture {
  id: number;
  name: string;
}

// 球場はグローバルマスタ（全ユーザー共有、create で created_by_user_id を自動セット）。
export interface Stadium {
  id: number;
  name: string;
  prefecture: StadiumPrefecture | null;
}

export interface StadiumSearchResponse {
  data: Stadium[];
  pagination: Pagination;
}

// POST /api/v2/stadiums の body（{ stadium: CreateStadiumPayload }）。
export interface CreateStadiumPayload {
  name: string;
  prefecture_id?: number;
}
