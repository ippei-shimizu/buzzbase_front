"use client";

import { Button } from "@heroui/react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { startProCheckout, type ProPlan } from "../actions";

interface CheckoutButtonProps {
  plan: ProPlan;
  label: string;
  variant?: "solid" | "bordered";
  color?: "primary" | "default";
  fullWidth?: boolean;
}

/**
 * Stripe Checkout への遷移ボタン。
 * window.location.origin を取得して Server Action に渡し、
 * 返ってきた checkout_url にブラウザを遷移させる。
 */
export default function CheckoutButton({
  plan,
  label,
  variant = "solid",
  color = "primary",
  fullWidth = false,
}: CheckoutButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handlePress = () => {
    startTransition(async () => {
      const result = await startProCheckout({
        plan,
        baseUrl: window.location.origin,
      });

      if (result.ok) {
        setIsRedirecting(true);
        window.location.assign(result.checkoutUrl);
        return;
      }

      const messages: Record<typeof result.error, string> = {
        unauthorized: "ログインしてからお試しください",
        already_subscribed: "すでに Pro に加入済みです",
        invalid_plan: "プランの指定が不正です",
        stripe_api_error:
          "決済サービスとの通信に失敗しました。しばらく経ってから再度お試しください",
        unknown: "予期せぬエラーが発生しました。時間を置いて再度お試しください",
      };
      toast.error(messages[result.error]);
    });
  };

  return (
    <Button
      color={color}
      variant={variant}
      onPress={handlePress}
      isDisabled={isPending || isRedirecting}
      isLoading={isPending || isRedirecting}
      fullWidth={fullWidth}
      className="font-bold"
    >
      {label}
    </Button>
  );
}
