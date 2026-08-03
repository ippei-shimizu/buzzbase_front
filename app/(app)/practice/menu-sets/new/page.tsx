import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "@app/components/header/Header";
import { getPracticeMenus } from "@app/services/v2/practiceMenuService";
import { CREATE_PAGE_TITLE } from "../_components/menuSetCopy";
import MenuSetFormContent from "../_components/MenuSetFormContent";

export const metadata = {
  title: "セットを作る",
};

export default async function NewMenuSetPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  const menusResult = await getPracticeMenus();

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <Header />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">
            <h2 className="mb-6 text-2xl font-bold">{CREATE_PAGE_TITLE}</h2>
            <MenuSetFormContent
              menuSet={null}
              menus={menusResult.status === "ok" ? menusResult.data : []}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
