import { GroupIcon } from "@app/components/icon/GroupIcon";
import { HomeIcon } from "@app/components/icon/HomeIcon";
import { NoteIcon } from "@app/components/icon/NoteIcon";
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
    { href: "/", label: "トップ", icon: HomeIcon, authRequired: false },
    {
      href: isLoggedIn ? "/note" : "/signup?auth_required=true",
      label: "野球ノート",
      icon: NoteIcon,
      authRequired: !isLoggedIn,
    },
    {
      href: isLoggedIn ? "/game-result/lists" : "/signup?auth_required=true",
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
