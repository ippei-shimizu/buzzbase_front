"use client";

import type { FetchResult } from "@app/services/v2/requests";
import type { GameResultLinkOption } from "@app/types/gameResultLink";
import { useRef, useState } from "react";
import { searchGameResultOptions } from "@app/services/v2/gameResultLinkService";

/** 入力が止まってから検索するまでの待ち時間。1文字打つたびにリクエストを飛ばさないために置く。 */
export const GAME_SEARCH_DEBOUNCE_MS = 300;

interface UseGameResultSearchReturn {
  query: string;
  /**
   * 直近の検索結果。まだ一度も検索していない間は null。
   * 「未検索」「取得失敗」「0件」を取り違えないよう、FetchResult のまま返す。
   */
  result: FetchResult<GameResultLinkOption[]> | null;
  isSearching: boolean;
  /** 検索語の更新。デバウンス後に検索が走る。 */
  changeQuery: (value: string) => void;
  /** ピッカーを開いたときの初回取得。すでに取得済みなら何もしない。 */
  loadOnce: () => void;
}

/**
 * 対戦相手名による試合記録の絞り込み検索。
 *
 * 検索そのものは back（`search_by_opponent`）に任せ、ここでは
 * 「入力のたびに投げない（デバウンス）」「古いレスポンスで新しい結果を上書きしない
 * （順序逆転対策）」の2点を担保する。
 */
export function useGameResultSearch(): UseGameResultSearchReturn {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<FetchResult<
    GameResultLinkOption[]
  > | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 発行した検索の連番。応答時に最新の連番と一致しなければ破棄する。
  const latestRequestIdRef = useRef(0);
  const hasLoadedRef = useRef(false);

  const runSearch = async (value: string) => {
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;
    hasLoadedRef.current = true;
    setIsSearching(true);

    const response = await searchGameResultOptions(value || undefined);

    // 後から投げた検索が先に返っている場合、この結果はもう古い。表示を巻き戻さない。
    if (requestId !== latestRequestIdRef.current) return;
    setIsSearching(false);
    setResult(response);
  };

  const changeQuery = (value: string) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void runSearch(value);
    }, GAME_SEARCH_DEBOUNCE_MS);
  };

  const loadOnce = () => {
    if (hasLoadedRef.current) return;
    void runSearch(query);
  };

  return { query, result, isSearching, changeQuery, loadOnce };
}
