"use client";

import type { GroupsData } from "@app/interface";
import useSWR from "swr";
import { useAuthContext } from "@app/contexts/useAuthContext";
import { useUser } from "@app/contexts/userContext";
import { fetcher } from "@app/hooks/swrFetcher";
import { useGroupTabBadge } from "./useGroupTabBadge";

/**
 * グローバルナビのグループ未参加バッジの表示可否を決める。
 *
 * 一度閲覧したユーザーには二度と出さないため、閲覧済みが確定している間は
 * グループ一覧の取得自体を行わない（全ページに常設されるナビからの余計な通信を避ける）。
 *
 * @returns showBadge ログイン済み・所属0件が確定・未閲覧のときだけ true。
 * @returns markSeen グループへ遷移したときに閲覧済みとして確定させる。
 */
export function useGroupNavBadge() {
  const { isLoggedIn } = useAuthContext();
  const { state } = useUser();
  const { seen, markSeen } = useGroupTabBadge();

  const userId = state.userId.id;
  const shouldCheckMembership =
    isLoggedIn === true && seen === false && userId !== null;

  const { data: groups } = useSWR<GroupsData[]>(
    shouldCheckMembership ? `/api/v1/groups/?userId=${userId}` : null,
    fetcher,
  );

  // 取得が確定するまでは未参加と断定できないので光らせない
  const showBadge =
    shouldCheckMembership && Array.isArray(groups) && groups.length === 0;

  return { showBadge, markSeen };
}
