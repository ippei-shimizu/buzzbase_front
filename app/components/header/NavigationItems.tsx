import { BallIcon } from "@app/components/icon/BallIcon";
import { GroupIcon } from "@app/components/icon/GroupIcon";
import { HomeIcon } from "@app/components/icon/HomeIcon";
import { RecordIcon } from "@app/components/icon/RecordIcon";
import { useAuthContext } from "@app/contexts/useAuthContext";

export type NavigationItem = {
  href: string;
  label: string;
  icon: typeof HomeIcon;
  authRequired: boolean;
};

const NavigationItems = (): NavigationItem[] => {
  const { isLoggedIn } = useAuthContext();

  return [
    {
      href: isLoggedIn ? "/dashboard" : "/",
      label: isLoggedIn ? "ダッシュボード" : "トップ",
      icon: HomeIcon,
      authRequired: false,
    },
    {
      href: isLoggedIn ? "/game-result/lists" : "/signup?auth_required=true",
      label: "試合一覧",
      icon: BallIcon,
      authRequired: !isLoggedIn,
    },
    {
      href: isLoggedIn ? "/game-result/record" : "/signup?auth_required=true",
      label: "記録",
      icon: RecordIcon,
      authRequired: !isLoggedIn,
    },
    {
      href: isLoggedIn ? "/groups" : "/signup?auth_required=true",
      label: "グループ",
      icon: GroupIcon,
      authRequired: !isLoggedIn,
    },
  ];
};

export default NavigationItems;
