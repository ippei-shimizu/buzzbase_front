"use client";
import type { UserContextType } from "@app/interface";
import React, { createContext, useContext, ReactNode } from "react";
import useSWR from "swr";
import { fetcher } from "@app/hooks/swrFetcher";

const defaultContextValue: UserContextType = {
  state: {
    userId: { id: null, team_id: null, user_id: "" },
    usersUserId: { user_id: "" },
  },
};

export const UserContext = createContext(defaultContextValue);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { data: userId } = useSWR("/api/v1/users/current", fetcher);
  const { data: usersUserId } = useSWR(
    userId ? `/api/v1/users/${userId.id}/show_current_user_id` : null,
    fetcher,
  );

  const state = {
    userId: userId ?? { id: null, team_id: null, user_id: "" },
    usersUserId: usersUserId ?? { user_id: "" },
  };

  return (
    <UserContext.Provider value={{ state }}>{children}</UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
