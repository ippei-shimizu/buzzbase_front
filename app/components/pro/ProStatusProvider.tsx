"use client";

import Cookies from "js-cookie";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { getProStatus } from "@app/(app)/pro/actions";
import { DEFAULT_PRO_STATUS, type ProStatus } from "@app/types/pro";

const ANONYMOUS_IDENTITY = "anonymous";

interface ProStatusContextValue {
  proStatus: ProStatus;
  isLoading: boolean;
  isRefreshing: boolean;
  refresh: () => void;
}

export const ProStatusContext = createContext<ProStatusContextValue | null>(
  null,
);

interface ResolvedProStatus {
  identity: string;
  proStatus: ProStatus | null;
}

/**
 * ブラウザの認証 cookie からログイン中ユーザーの識別子を読む。
 * 3点セットが揃わなければ未認証扱い: uid だけ残って access-token が失効した状態を
 * ログイン中と誤判定すると、失効後も前の Pro 状態を保持し続けてしまう。
 * サーバー実行時（静的生成・SSR）は常に anonymous を返し、hydration 前後で
 * isLoading の初期値が食い違わないようにする。
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
 * Pro 状態をアプリ配下に配布する Context Provider。
 *
 * Pro 状態はサーバーでは取得しない。(app)/layout.tsx で cookies() を読むと
 * コラム記事やツールなど配下の静的ページがすべて dynamic 扱いになり、
 * ビルド時プリレンダリングと CDN 配信を失うため。
 * 認証 cookie は SameSite=Strict で、検索結果や Stripe Checkout からの
 * トップレベル遷移ではそもそもサーバーに届かず信用できない。一方 Server Action は
 * 同一サイト起点の POST なので cookie が必ず送られる。
 *
 * 判定が確定するまでは isLoading: true とし、Pro 加入者にロック UI を見せない。
 */
export function ProStatusProvider({ children }: { children: ReactNode }) {
  const [resolved, setResolved] = useState<ResolvedProStatus | null>(null);
  const [isRefreshing, startRefresh] = useTransition();

  // ログイン/ログアウト直後の router.refresh() でこの Provider も再レンダーされる。
  // そこで識別子の変化を拾い、前ユーザーの Pro 状態を持ち越さない。
  const identity = readClientIdentity();
  const isStale = resolved !== null && resolved.identity !== identity;

  useEffect(() => {
    let active = true;
    // 未認証なら API を叩かずに無料状態で確定させる
    const pending =
      identity === ANONYMOUS_IDENTITY ? Promise.resolve(null) : getProStatus();

    void pending
      .then((next) => {
        if (active) setResolved({ identity, proStatus: next });
      })
      .catch(() => {
        // Server Action の通信自体が失敗した場合は無料状態で確定させる。
        // 未確定のままだと isLoading が永久に true になり、Pro 判定に依存する UI（広告枠など）が
        // 二度と描画されない
        if (active) setResolved({ identity, proStatus: null });
      });

    return () => {
      active = false;
    };
  }, [identity]);

  const refresh = useCallback(() => {
    startRefresh(async () => {
      const next = await getProStatus();
      if (next)
        setResolved({ identity: readClientIdentity(), proStatus: next });
    });
  }, []);

  const value = useMemo<ProStatusContextValue>(
    () => ({
      proStatus: (isStale ? null : resolved?.proStatus) ?? DEFAULT_PRO_STATUS,
      isLoading: resolved === null || isStale,
      isRefreshing,
      refresh,
    }),
    [resolved, isStale, isRefreshing, refresh],
  );

  return (
    <ProStatusContext.Provider value={value}>
      {children}
    </ProStatusContext.Provider>
  );
}
