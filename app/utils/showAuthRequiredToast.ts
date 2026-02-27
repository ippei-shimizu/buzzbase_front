import { toast } from "sonner";

export const showAuthRequiredToast = () => {
  toast.info("この機能を使うには会員登録（無料）が必要です", {
    id: "auth-required",
  });
};
