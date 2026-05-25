"use client";

import type { Feature } from "@app/types/pro";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useState } from "react";
import ProUpgradeModal from "@app/components/pro/ProUpgradeModal";

interface ProUpgradeModalContextValue {
  open: (trigger?: Feature) => void;
  close: () => void;
}

const ProUpgradeModalContext =
  createContext<ProUpgradeModalContextValue | null>(null);

/**
 * Pro 加入を促す共通モーダル（ProUpgradeModal）の開閉を全画面共通で管理する。
 * `useProUpgradeModal().open(feature)` で機能名つきで開ける。
 * trigger を省略すれば LP の CTA など機能非依存の汎用文言で開く。
 */
export function ProUpgradeModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [trigger, setTrigger] = useState<Feature | undefined>(undefined);

  const open = useCallback((triggerFeature?: Feature) => {
    setTrigger(triggerFeature);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ProUpgradeModalContext.Provider value={{ open, close }}>
      {children}
      <ProUpgradeModal isOpen={isOpen} onClose={close} trigger={trigger} />
    </ProUpgradeModalContext.Provider>
  );
}

export function useProUpgradeModal(): ProUpgradeModalContextValue {
  const ctx = useContext(ProUpgradeModalContext);
  if (!ctx) {
    throw new Error(
      "useProUpgradeModal must be used within ProUpgradeModalProvider",
    );
  }
  return ctx;
}
