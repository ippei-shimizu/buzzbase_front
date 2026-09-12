"use client";

import type { DashboardData } from "../actions";
import Link from "next/link";
import { useInviteCardDismissal } from "@app/hooks/onboarding/useInviteCardDismissal";
import RecordGameButton from "./RecordGameButton";
import WelcomeCard from "./WelcomeCard";

interface DashboardWelcomeProps {
  data: DashboardData | null;
}

const RECORD_ACTION = <RecordGameButton label="最初の試合を記録する" />;

const INVITE_ACTION = (
  <Link
    href="/groups/new"
    className="flex items-center justify-center w-full rounded-full bg-[#d08000] px-5 py-2.5 text-base font-bold text-white"
  >
    友達を招待する
  </Link>
);

/**
 * オンボーディングの進み具合に応じてウェルカムカードを出し分ける。
 * 未記録 → 記録カード、記録済みかつグループ未所属 → 招待カード、どちらも済んでいれば何も出さない。
 * 2枚が同時に出ることはない。
 */
export default function DashboardWelcome({ data }: DashboardWelcomeProps) {
  const { isDismissed, dismiss } = useInviteCardDismissal();

  // 取得に失敗したときは進み具合を判定できないため、どちらの導線も出さない
  if (!data) return null;

  const hasRecord =
    data.recent_game_results.length > 0 ||
    data.batting_stats?.aggregate != null ||
    data.pitching_stats?.aggregate != null;

  if (!hasRecord) {
    return <WelcomeCard variant="record" action={RECORD_ACTION} />;
  }

  const inGroup = data.group_rankings.length > 0;
  // isDismissed が確定するまで（null）は描画しない。SSR 後に一瞬出て消えるのを防ぐ。
  if (inGroup || isDismissed !== false) return null;

  return (
    <WelcomeCard variant="invite" action={INVITE_ACTION} onDismiss={dismiss} />
  );
}
