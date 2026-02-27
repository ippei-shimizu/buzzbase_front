"use client";
import { Divider, Input, Spinner, User } from "@heroui/react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { LockIcon } from "@app/components/icon/LockIcon";
import { SearchIcon } from "@app/components/icon/SearchIcon";

interface UserResult {
  id: string;
  name: string;
  user_id: string;
  image: { url: string };
  is_private?: boolean;
}

export default function UserAutocomplete() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    const fetchUsers = async () => {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/search?query=${query}`,
      );
      const data = await response.json();
      setUsers(data);
      setIsLoading(false);
    };

    fetchUsers();
  }, [query]);

  const displayUsers = query ? users : [];

  const clearInput = () => {
    setQuery("");
    setUsers([]);
  };

  return (
    <div className="mt-4">
      <Input
        isClearable
        radius="lg"
        placeholder="ユーザー名・ユーザーIDで検索..."
        variant="faded"
        startContent={<SearchIcon width="18" height="18" stroke="#f4f4f4" />}
        value={query}
        onClear={() => clearInput()}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-md mx-auto"
      />
      <ul className="grid gap-y-4 mt-6">
        {isLoading ? (
          <li className="flex justify-center mx-auto">
            <Spinner color="primary" />
          </li>
        ) : (
          displayUsers.map((user) => (
            <li key={user.id}>
              <Link href={`/mypage/${user.user_id}/`} className="block">
                <div className="flex items-center gap-x-1">
                  <User
                    name={
                      <span className="flex items-center gap-1">
                        {user.name}
                        {user.is_private && (
                          <LockIcon fill="#a1a1aa" width="12" height="12" />
                        )}
                      </span>
                    }
                    description={`@${user.user_id}`}
                    avatarProps={{
                      src:
                        process.env.NODE_ENV === "production"
                          ? user.image.url
                          : `${process.env.NEXT_PUBLIC_API_URL}${user.image.url}`,
                    }}
                  />
                </div>
              </Link>
              <Divider className="mt-2" />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
