"use client";

import type { FeatureFlagKey } from "@app/types/featureFlags";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { getFeatureFlags } from "@app/featureFlags/actions";

const ANONYMOUS_IDENTITY = "anonymous";

export interface FeatureFlagResult {
  enabled: boolean;
  /** 判定が未確定の状態。導線の出し分けでは、確定するまで描画しないこと。 */
  isLoading: boolean;
}

interface ResolvedFlag {
  identity: string;
  enabled: boolean;
}

/**
 * ブラウザの認証 cookie からログイン中ユーザーの識別子を読む。
 * ProStatusProvider と同じ判定: 3点セットが揃わなければ未認証扱いにして、
 * access-token が失効し uid だけ残った状態をログイン中と誤認しない。
 */
function readClientIdentity(): string {
  if (typeof document === "undefined") return ANONYMOUS_IDENTITY;

  const accessToken = Cookies.get("access-token");
  const client = Cookies.get("client");
  const uid = Cookies.get("uid");
  if (!accessToken || !client || !uid) return ANONYMOUS_IDENTITY;

  return uid;
}

/**
 * Feature Flag をクライアントから評価する。判定できない状態はすべて false に倒す。
 *
 * サーバーでは取得しない。共通レイアウトから cookies() を読むと配下の静的ページが
 * すべて dynamic 扱いになるため。加えて認証 cookie は SameSite=Strict で、検索結果や
 * Stripe からのトップレベル遷移ではサーバーに届かず、Server Action（同一サイト起点の POST）
 * でしか確実に評価できない。
 *
 * 単一ルートの Server Component から使う場合は getCachedFeatureFlag を使うこと。
 * SSR 時点で確定値を持てるので、未確定状態を挟まずに済む。
 */
export function useFeatureFlag(key: FeatureFlagKey): FeatureFlagResult {
  const [resolved, setResolved] = useState<ResolvedFlag | null>(null);

  // ログイン/ログアウト直後の router.refresh() で識別子の変化を拾い、
  // 前ユーザー向けの判定を持ち越さない。
  const identity = readClientIdentity();
  const isStale = resolved !== null && resolved.identity !== identity;

  useEffect(() => {
    // back の flag API は認証必須。未認証は問い合わせずに無効で確定させる。
    if (identity === ANONYMOUS_IDENTITY) return;

    let active = true;
    void getFeatureFlags([key])
      .then((flags) => flags[key])
      // Server Action 呼び出し自体の失敗（通信断・デプロイ中の action id 不一致など）も無効側に倒す。
      .catch(() => false)
      .then((enabled) => {
        if (active) setResolved({ identity, enabled });
      });

    return () => {
      active = false;
    };
  }, [key, identity]);

  if (identity === ANONYMOUS_IDENTITY) {
    return { enabled: false, isLoading: false };
  }

  return {
    enabled: !isStale && resolved?.enabled === true,
    isLoading: resolved === null || isStale,
  };
}
