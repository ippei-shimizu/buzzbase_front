"use client";

import { Button } from "@heroui/react";
import { useProUpgradeModal } from "@app/contexts/proUpgradeModalContext";

interface CheckoutButtonProps {
  label: string;
  variant?: "solid" | "bordered";
  color?: "primary" | "default";
  fullWidth?: boolean;
}

/**
 * LP /pro 内の CTA ボタン。
 * 直接 Stripe Checkout は呼ばず、共通の Pro 加入モーダル（ProUpgradeModal）を開く。
 * モーダル内でプラン選択 → Stripe Checkout へ遷移する。
 */
export default function CheckoutButton({
  label,
  variant = "solid",
  color = "primary",
  fullWidth = false,
}: CheckoutButtonProps) {
  const { open } = useProUpgradeModal();

  return (
    <Button
      color={color}
      variant={variant}
      onPress={() => open()}
      fullWidth={fullWidth}
      className="font-bold"
    >
      {label}
    </Button>
  );
}
