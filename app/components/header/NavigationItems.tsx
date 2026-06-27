import { BallIcon } from "@app/components/icon/BallIcon";
import { GroupIcon } from "@app/components/icon/GroupIcon";
import { HomeIcon } from "@app/components/icon/HomeIcon";
import { StatsIcon } from "@app/components/icon/StatsIcon";
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
      label: "試合結果",
      icon: BallIcon,
      authRequired: !isLoggedIn,
    },
    {
      href: isLoggedIn ? "/stats" : "/signup?auth_required=true",
      label: "成績",
      icon: StatsIcon,
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
