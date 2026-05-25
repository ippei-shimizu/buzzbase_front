"use client";

import type { ProPlan } from "@app/(app)/pro/actions";
import type { ProFeature } from "@app/types/pro";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useState } from "react";
import ProUpgradeModal from "@app/components/pro/ProUpgradeModal";

export interface OpenProUpgradeModalOptions {
  /** 表示時に「○○を使うには Pro 加入が必要」のコンテキスト訴求を出すための機能キー。 */
  trigger?: ProFeature;
  /** 初期選択させたい料金プラン。未指定なら ProUpgradeModal のデフォルト（年額）。 */
  defaultPlan?: ProPlan;
}

interface ProUpgradeModalContextValue {
  open: (options?: OpenProUpgradeModalOptions) => void;
  close: () => void;
}

const ProUpgradeModalContext =
  createContext<ProUpgradeModalContextValue | null>(null);

/**
 * Pro 加入を促す共通モーダル（ProUpgradeModal）の開閉を全画面共通で管理する。
 * `useProUpgradeModal().open({ trigger, defaultPlan })` で機能名・初期プランを指定して開ける。
 * 引数を省略すれば LP の CTA など機能非依存の汎用文言・年額デフォルトで開く。
 */
export function ProUpgradeModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [trigger, setTrigger] = useState<ProFeature | undefined>(undefined);
  const [defaultPlan, setDefaultPlan] = useState<ProPlan | undefined>(
    undefined,
  );
  // open するたびにインクリメントして ProUpgradeModal を remount する。
  // これで defaultPlan が「初回マウント時の初期値」として毎回再評価され、
  // 内部で useEffect による派生 state 同期を持たずに済む。
  const [openCount, setOpenCount] = useState(0);

  const open = useCallback((options?: OpenProUpgradeModalOptions) => {
    setTrigger(options?.trigger);
    setDefaultPlan(options?.defaultPlan);
    setOpenCount((prev) => prev + 1);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ProUpgradeModalContext.Provider value={{ open, close }}>
      {children}
      <ProUpgradeModal
        key={openCount}
        isOpen={isOpen}
        onClose={close}
        trigger={trigger}
        defaultPlan={defaultPlan}
      />
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
