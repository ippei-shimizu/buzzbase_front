"use client";
import "@app/globals.css";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HeaderUserMenu from "@app/components/header/HeaderUserMenu";
import { useAuthContext } from "@app/contexts/useAuthContext";
import { useGroupNavBadge } from "@app/hooks/onboarding/useGroupNavBadge";
import { showAuthRequiredToast } from "@app/utils/showAuthRequiredToast";
import NavigationItems from "./NavigationItems";

const GROUPS_HREF = "/groups";

export default function NavigationMenu() {
  const pathName = usePathname();
  const { isLoggedIn } = useAuthContext();
  const navigationItems = NavigationItems();
  const { showBadge: showGroupBadge, markSeen: markGroupBadgeSeen } =
    useGroupNavBadge();

  const handleAuthRequiredClick = () => {
    if (!isLoggedIn) {
      showAuthRequiredToast();
    }
  };

  const isActive = (path: string, itemHref: string) => {
    if (path === "/signin" || path === "/signup") {
      return false;
    }
    const basePath = [
      "/game-result/lists",
      "/game-result/record",
      "/groups",
      "/stats",
    ];
    const isBasePath = basePath.some((base) => itemHref.startsWith(base));

    if (isBasePath) {
      return path.startsWith(itemHref);
    } else {
      return path === itemHref;
    }
  };

  const shouldHideNavigationMenu = pathName.includes("/register-username");

  return (
    <>
      {!shouldHideNavigationMenu && (
        <nav className="fixed bottom-0 w-full bg-main pt-2.5 pb-1.5 border-t border-t-zinc-500 z-100 lg:w-56 lg:bottom-0 lg:left-0 lg:top-[var(--top-banner-offset,0px)] lg:h-full lg:border-t-0 lg:pl-6 lg:pt-16 lg:border-r-1 lg:border-r-zinc-500 lg:z-50">
          <Link
            href={isLoggedIn ? "/dashboard" : "/"}
            className="hidden lg:block"
          >
            <Image
              src="/images/buzz-logo-v2.png"
              width="164"
              height="40"
              alt="BUZZ BASE"
              className="lg:block lg:mb-8"
            />
          </Link>
          <ul className="flex items-center justify-around max-w-[720px] mx-auto lg:grid-cols-1 lg:ml-0 lg:h-full lg:items-start lg:gap-y-5 lg:flex-col lg:justify-start">
            {navigationItems.map((item, index) => {
              const isGroupsItem = item.href === GROUPS_HREF;

              return (
                <li key={index}>
                  <Link
                    href={item.href}
                    onClick={
                      isGroupsItem
                        ? markGroupBadgeSeen
                        : item.authRequired
                          ? handleAuthRequiredClick
                          : undefined
                    }
                    className={`flex items-center min-w-[50px] flex-col gap-y-1 px-0 bg-transparent overflow-visible text-[10px] font-medium ${
                      isActive(pathName, item.href)
                        ? `text-yellow-500`
                        : `text-white`
                    } lg:flex-row lg:text-base lg:w-fit lg:font-bold lg:gap-x-5 [&_svg]:lg:w-6 [&_svg]:lg:h-6 [&_svg]:lg:mr-4`}
                  >
                    <span className="relative inline-flex">
                      <item.icon
                        fill={
                          isActive(pathName, item.href) ? `#e08e0a` : `#F4F4F4`
                        }
                        filled={
                          isActive(pathName, item.href) ? `#e08e0a` : `#F4F4F4`
                        }
                        height="22"
                        width="22"
                        label=""
                      />
                      {isGroupsItem && showGroupBadge ? (
                        <span
                          role="status"
                          aria-label="グループ未参加"
                          className="absolute top-0 right-0 block w-2 h-2 rounded-full bg-red-500 lg:right-3"
                        />
                      ) : null}
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <HeaderUserMenu />
            </li>
          </ul>
        </nav>
      )}
    </>
  );
}
