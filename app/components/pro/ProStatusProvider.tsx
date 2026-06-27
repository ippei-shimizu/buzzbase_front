"use client";

import {
  createContext,
  useCallback,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { getProStatus } from "@app/(app)/pro/actions";
import { DEFAULT_PRO_STATUS, type ProStatus } from "@app/types/pro";

interface ProStatusContextValue {
  proStatus: ProStatus;
  isRefreshing: boolean;
  refresh: () => void;
}

export const ProStatusContext = createContext<ProStatusContextValue | null>(
  null,
);

interface ProStatusProviderProps {
  initialValue: ProStatus | null;
  children: ReactNode;
}

/**
 * Pro 状態をアプリ配下に配布する Context Provider。
 * Server Component で getProStatus() の戻り値を initialValue として渡し、
 * クライアント側では refresh() でサーバーアクションを再実行できる。
 * initialValue が null（未認証や API 失敗）なら無料状態として扱う。
 */
export function ProStatusProvider({
  initialValue,
  children,
}: ProStatusProviderProps) {
  const [proStatus, setProStatus] = useState<ProStatus>(
    initialValue ?? DEFAULT_PRO_STATUS,
  );
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      const next = await getProStatus();
      if (next) setProStatus(next);
    });
  }, []);

  const value = useMemo<ProStatusContextValue>(
    () => ({ proStatus, isRefreshing: isPending, refresh }),
    [proStatus, isPending, refresh],
  );

  return (
    <ProStatusContext.Provider value={value}>
      {children}
    </ProStatusContext.Provider>
  );
}
