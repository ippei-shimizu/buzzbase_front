"use client";

import type {
  ImprovementTheme,
  ImprovementThemeInput,
  ImprovementThemeStatus,
} from "@app/types/improvementTheme";
import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
import { Button } from "@heroui/react";
import { useState } from "react";
import { toast } from "sonner";
import { ProUpsellCard } from "@app/components/pro/ProUpsellCard";
import { useProUpgradeModal } from "@app/contexts/proUpgradeModalContext";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import { createImprovementTheme } from "@app/services/v2/improvementThemeService";
import {
  THEME_TABS,
  groupThemesByStatus,
  isAtThemeFreeLimit,
} from "../_utils/themeList";
import {
  EMPTY_MESSAGE,
  FREE_LIMIT_DESCRIPTION,
  FREE_LIMIT_SERVER_ERROR,
  FREE_LIMIT_TITLE,
} from "./themeCopy";
import ThemeFormModal from "./ThemeFormModal";
import ThemeList from "./ThemeList";

interface ThemesContentProps {
  initialThemes: ImprovementTheme[];
}

/**
 * 課題一覧画面の Container。
 * タブの状態保持・Server Action 呼び出し・無料枠の判定を担い、表示は子コンポーネントへ委ねる。
 */
export default function ThemesContent({ initialThemes }: ThemesContentProps) {
  const [themes, setThemes] = useState<ImprovementTheme[]>(initialThemes);
  const [tab, setTab] = useState<ImprovementThemeStatus>("open");
  const [formToken, setFormToken] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { hasEntitlement, isLoading: isEntitlementLoading } = useEntitlement();
  const { open: openProUpgradeModal } = useProUpgradeModal();

  const themesByStatus = groupThemesByStatus(themes);
  const isAtFreeLimit = isAtThemeFreeLimit({
    themes,
    hasUnlimited: hasEntitlement("unlimited_improvement_themes"),
    isEntitlementLoading,
  });

  const handleAdd = () => {
    if (isAtFreeLimit) {
      openProUpgradeModal({ trigger: "unlimited_improvement_themes" });
      return;
    }
    setFormErrors([]);
    setFormToken(Date.now());
  };

  const handleSubmit = async (input: ImprovementThemeInput) => {
    setIsSaving(true);
    setFormErrors([]);
    const result = await createImprovementTheme(input);
    setIsSaving(false);

    if (result.ok) {
      setThemes((prev) => [...prev, result.data]);
      setFormToken(null);
      // 作成した課題は必ず取組中なので、そのタブへ寄せて追加結果を見せる。
      setTab("open");
      toast.success("課題を作成しました");
      return;
    }

    // 作成時の 403 は Pro 限定機能ではなく無料枠の超過を意味する。
    if (result.reason === "forbidden") {
      setFormErrors([FREE_LIMIT_SERVER_ERROR]);
      openProUpgradeModal({ trigger: "unlimited_improvement_themes" });
      return;
    }
    setFormErrors(result.errors);
  };

  return (
    <>
      <h2 className="text-2xl font-bold">課題</h2>
      <p className="mt-2 text-sm text-zinc-300">
        いま集中して取り組むテーマを決めると、練習記録やノートをその課題に束ねて振り返れます。
      </p>

      <div className="my-5 flex gap-2" role="tablist" aria-label="課題の状態">
        {THEME_TABS.map((item) => {
          const isActive = item.key === tab;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(item.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-bold transition-colors ${
                isActive ? "bg-[#d08000] text-white" : "bg-sub text-zinc-400"
              }`}
            >
              {item.label}
              <span className="text-xs">{themesByStatus[item.key].length}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-6">
        <ThemeList
          themes={themesByStatus[tab]}
          emptyMessage={EMPTY_MESSAGE[tab]}
        />
      </div>

      {isAtFreeLimit ? (
        <ProUpsellCard
          feature="unlimited_improvement_themes"
          title={FREE_LIMIT_TITLE}
          description={FREE_LIMIT_DESCRIPTION}
          ctaLabel="Pro プランを見る"
          className="mb-4"
        />
      ) : null}

      <Button
        color="primary"
        fullWidth
        radius="sm"
        className="font-bold"
        startContent={<PlusIcon className="h-5 w-5" aria-hidden />}
        isDisabled={isEntitlementLoading}
        onPress={handleAdd}
      >
        新しい課題に取り組む
      </Button>

      {formToken === null ? null : (
        <ThemeFormModal
          key={formToken}
          theme={null}
          isSaving={isSaving}
          serverErrors={formErrors}
          onClose={() => setFormToken(null)}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
