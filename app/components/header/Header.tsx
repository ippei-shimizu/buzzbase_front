import { Button } from "@nextui-org/react";
import { UserIcon } from "@app/components/modules/UserIcon";

export default function Header() {
  return (
    <>
      <header className="py-2 px-3">
        <div className="flex items-center justify-between h-full">
          <a href="">LOGO</a>
          <div className="flex items-center gap-x-4">
            <a href="" className="text-sm">
              ログイン
            </a>
            <Button
              startContent={
                <UserIcon
                  fill=""
                  filled="#fff"
                  height="18"
                  width="18"
                  label="User Icon"
                />
              }
              className="gap-x-1 bg-yellow-500 text-white text-sm py-1.5 px-3 h-auto rounded-lg"
            >
              新規登録
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
