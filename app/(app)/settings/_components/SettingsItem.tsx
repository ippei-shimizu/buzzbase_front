import type { ReactNode } from "react";
import Link from "next/link";
import SettingsItemContent from "./SettingsItemContent";

interface SettingsItemProps {
  href: string;
  icon: ReactNode;
  title: string;
  description?: string;
}

/** 別ページへ遷移する設定項目の行。 */
export default function SettingsItem({
  href,
  icon,
  title,
  description,
}: SettingsItemProps) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-3 px-4 py-3.5">
        <SettingsItemContent
          icon={icon}
          title={title}
          description={description}
        />
      </Link>
    </li>
  );
}
