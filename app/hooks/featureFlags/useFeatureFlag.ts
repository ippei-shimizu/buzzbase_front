"use client";

import type {
  FeatureFlagDecision,
  FeatureFlagKey,
} from "@app/types/featureFlags";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { getFeatureFlagDecisions } from "@app/featureFlags/actions";

const ANONYMOUS_IDENTITY = "anonymous";

interface ResolvedFlag {
  identity: string;
  decision: FeatureFlagDecision;
}

interface UseFeatureFlagOptions {
  /**
   * true の間は評価しない。常設マウントのコンポーネント（全ページに載るモーダル等）で
   * 全ページビューに flag の問い合わせが乗るのを避けるために使う。
   */
  skip?: boolean;
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
 * Feature Flag をクライアントから評価する。
 *
 * サーバーでは取得しない。共通レイアウトから cookies() を読むと配下の静的ページが
 * すべて dynamic 扱いになるため。加えて認証 cookie は SameSite=Strict で、検索結果や
 * Stripe からのトップレベル遷移ではサーバーに届かず、Server Action（同一サイト起点の POST）
 * でしか確実に評価できない。
 *
 * 単一ルートの Server Component から使う場合は getCachedFeatureFlagDecision を使うこと。
 * SSR 時点で確定値を持てるので、未確定状態を挟まずに済む。
 *
 * @param key 評価したい flag。
 * @param options `skip` で評価を止められる。
 * @returns back が明示的に false を返したときだけ `"disabled"`。未認証・評価中・取得失敗は
 *   `"indeterminate"`（「無効と確定した」とは言えないため、販売停止の告知には使わない）。
 */
export function useFeatureFlag(
  key: FeatureFlagKey,
  options: UseFeatureFlagOptions = {},
): FeatureFlagDecision {
  const { skip = false } = options;
  const [resolved, setResolved] = useState<ResolvedFlag | null>(null);

  // ログイン/ログアウト直後の router.refresh() で識別子の変化を拾い、
  // 前ユーザー向けの判定を持ち越さない。
  const identity = readClientIdentity();
  const isStale = resolved !== null && resolved.identity !== identity;

  useEffect(() => {
    if (skip) return;
    // back の flag API は認証必須。未認証は問い合わせても判定できない。
    if (identity === ANONYMOUS_IDENTITY) return;

    let active = true;
    void getFeatureFlagDecisions([key])
      .then((decisions) => decisions[key])
      // Server Action 呼び出し自体の失敗（通信断・デプロイ中の action id 不一致など）も
      // 「無効と確定した」とは言えない。
      .catch((): FeatureFlagDecision => "indeterminate")
      .then((decision) => {
        if (active) setResolved({ identity, decision });
      });

    return () => {
      active = false;
    };
  }, [key, identity, skip]);

  if (skip || identity === ANONYMOUS_IDENTITY) return "indeterminate";
  if (resolved === null || isStale) return "indeterminate";

  return resolved.decision;
}
