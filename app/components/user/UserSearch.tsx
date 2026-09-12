import Link from "next/link";
import { SearchIcon } from "@app/components/icon/SearchIcon";

export default function UserSearch() {
  return (
    <>
      <Link href="/users/search" prefetch={false}>
        <SearchIcon width="22" height="22" stroke="#f4f4f4" />
      </Link>
    </>
  );
}
