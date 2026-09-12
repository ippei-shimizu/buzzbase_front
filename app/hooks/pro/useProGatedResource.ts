"use client";

import type { ProFeature, ProGatedResult } from "@app/types/pro";
import { useEffect, useRef, useState } from "react";

interface UseProGatedResourceOptions<T, K> {
  feature: ProFeature;
  /** 閲覧可能なときだけ取得する。無料ユーザーに無駄な 403 を出さないための条件。 */
  canView: boolean;
  /** SSR で解決済みの初期値。閲覧不可・取得できなかった場合は null。 */
  initialData: T | null;
  /** 取得条件。identity が変わったときだけ再取得する。 */
  criteria: K;
  fetcher: (criteria: K) => Promise<ProGatedResult<T>>;
  unwrap: <U>(feature: ProFeature, result: ProGatedResult<U>) => U | null;
}

/**
 * Pro 限定ブロックのデータを保持する。
 * 初期値は SSR 済みのものを使い、取得条件（フィルタ）が変わったときだけ再取得する。
 *
 * @returns 表示すべきデータ。閲覧不可・取得前・403 で拒否された場合は null。
 */
export function useProGatedResource<T, K>({
  feature,
  canView,
  initialData,
  criteria,
  fetcher,
  unwrap,
}: UseProGatedResourceOptions<T, K>): T | null {
  const [data, setData] = useState<T | null>(initialData);
  // 取得済み（または SSR 済み）の条件。同じ条件での重複取得を防ぐ。
  const loadedCriteriaRef = useRef<K | null>(
    initialData === null ? null : criteria,
  );
  // fetcher / unwrap は entitlement の確定などで identity が変わる。依存に入れると
  // 取得中に effect が張り直され、進行中のレスポンスが捨てられるため ref 経由で読む。
  const latestRef = useRef({ fetcher, unwrap });

  useEffect(() => {
    latestRef.current = { fetcher, unwrap };
  });

  useEffect(() => {
    if (!canView) return;
    if (loadedCriteriaRef.current === criteria) return;
    loadedCriteriaRef.current = criteria;

    let active = true;
    void latestRef.current.fetcher(criteria).then((result) => {
      if (active) setData(latestRef.current.unwrap(feature, result));
    });
    return () => {
      active = false;
    };
  }, [feature, canView, criteria]);

  return data;
}
