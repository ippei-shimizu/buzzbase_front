"use client";

import type { MenuSet } from "@app/types/menuSet";
import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { ProUpsellCard } from "@app/components/pro/ProUpsellCard";
import { MENU_SET_FREE_LIMIT } from "@app/constants/menuSet";
import { useProUpgradeModal } from "@app/contexts/proUpgradeModalContext";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import {
  CREATE_LABEL,
  FREE_LIMIT_DESCRIPTION,
  FREE_LIMIT_TITLE,
  PAGE_DESCRIPTION,
  PAGE_TITLE,
} from "./menuSetCopy";
import MenuSetList from "./MenuSetList";

interface MenuSetsContentProps {
  menuSets: MenuSet[];
}

/**
 * メニューセット一覧の Container。
 * 無料枠の判定と作成導線の出し分けを担い、一覧の表示は MenuSetList に委ねる。
 */
export default function MenuSetsContent({ menuSets }: MenuSetsContentProps) {
  const router = useRouter();
  const { hasEntitlement, isLoading: isEntitlementLoading } = useEntitlement();
  const { open: openProUpgradeModal } = useProUpgradeModal();

  const hasUnlimited = hasEntitlement("unlimited_menu_sets");
  // 判定が確定するまでは上限扱いにしない。未確定のまま塞ぐと Pro 加入者に上限を誤って告知してしまう。
  const isAtFreeLimit =
    !isEntitlementLoading &&
    !hasUnlimited &&
    menuSets.length >= MENU_SET_FREE_LIMIT;

  const handleAdd = () => {
    if (isAtFreeLimit) {
      openProUpgradeModal({ trigger: "unlimited_menu_sets" });
      return;
    }
    router.push("/practice/menu-sets/new");
  };

  return (
    <>
      <h2 className="text-2xl font-bold">{PAGE_TITLE}</h2>
      <p className="mt-2 text-sm text-zinc-300">{PAGE_DESCRIPTION}</p>

      <div className="my-6">
        <MenuSetList menuSets={menuSets} />
      </div>

      {isAtFreeLimit ? (
        <ProUpsellCard
          feature="unlimited_menu_sets"
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
        {CREATE_LABEL}
      </Button>
    </>
  );
}
