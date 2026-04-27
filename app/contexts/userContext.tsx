"use client";
import type { UserContextType } from "@app/interface";
import * as Sentry from "@sentry/nextjs";
import React, {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
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

  useEffect(() => {
    if (state.userId.id) {
      Sentry.setUser({ id: String(state.userId.id) });
    } else {
      Sentry.setUser(null);
    }
  }, [state.userId.id]);

  return (
    <UserContext.Provider value={{ state }}>{children}</UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
