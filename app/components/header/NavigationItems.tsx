import { GroupIcon } from "@app/components/icon/GroupIcon";
import { HomeIcon } from "@app/components/icon/HomeIcon";
import { NoteIcon } from "@app/components/icon/NoteIcon";
import { RecordIcon } from "@app/components/icon/RecordIcon";
import { useAuthContext } from "@app/contexts/useAuthContext";

const NavigationItems = () => {
  const { isLoggedIn } = useAuthContext();

  return [
    { href: "/", label: "トップ", icon: HomeIcon },
    {
      href: isLoggedIn ? "/note" : "/signin",
      label: "野球ノート",
      icon: NoteIcon,
    },
    {
      href: isLoggedIn ? "/game-result/lists" : "/signin",
      label: "記録",
      icon: RecordIcon,
    },
    {
      href: isLoggedIn ? "/groups" : "/signin",
      label: "グループ",
      icon: GroupIcon,
    },
  ];
};

export default NavigationItems;
