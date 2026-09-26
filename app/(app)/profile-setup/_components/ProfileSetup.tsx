"use client";

import type { PositionOption } from "./ProfileSetupFields";
import type { BattingSide } from "@app/constants/handedness";
import type { ThrowHand } from "@app/interface/pitcher";
import { Spinner } from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import useSWR from "swr";
import useRequireAuth from "@app/hooks/auth/useRequireAuth";
import { getPositions } from "@app/services/positionService";
import { getTeamName } from "@app/services/teamsService";
import { getUserData } from "@app/services/userService";
import {
  trackProfileSetupCompleted,
  trackProfileSetupViewed,
} from "@app/utils/analytics";
import { resolveNextPath } from "../../onboarding/_utils/nextPath";
import ProfileSetupForm, {
  type ProfileSetupInitialValues,
  type ProfileSetupSummary,
} from "./ProfileSetupForm";
import ProfileSetupLayout from "./ProfileSetupLayout";

interface CurrentUser {
  id: number;
  team_id: number | null;
  positions: { id: number }[];
  throw_hand: ThrowHand | null;
  batting_side: BattingSide | null;
}

const SKIPPED_BEFORE_LOAD: ProfileSetupSummary = {
  skipped: true,
  has_team: false,
  position_count: 0,
};

/**
 * ユーザー名登録の直後に挟む任意のプロフィール入力。
 * 所属チームとポジションは試合記録フォームの初期値に使われるため、ここで埋めておくと
 * 初回の記録で入力が必要なのは相手チーム名だけになる。完了・スキップのどちらでもウォークスルーへ進む。
 */
export default function ProfileSetup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLoggedIn = useRequireAuth();
  const hasLeftRef = useRef(false);

  const onboardingPath = `/onboarding?next=${encodeURIComponent(
    resolveNextPath(searchParams.get("next")),
  )}`;

  useEffect(() => {
    trackProfileSetupViewed();
  }, []);

  const { data: user, error: userError } = useSWR<CurrentUser>(
    isLoggedIn === true ? "/api/v1/user" : null,
    getUserData,
  );
  const { data: positions, error: positionsError } = useSWR<PositionOption[]>(
    isLoggedIn === true ? "/api/v1/positions" : null,
    getPositions,
  );
  const teamId = user?.team_id ?? null;
  // getTeamName は失敗時に空文字を返すので、空文字は「解決できなかった」として扱う。
  const { data: teamName } = useSWR(
    teamId === null ? null : ["profile-setup/team-name", teamId],
    ([, id]) => getTeamName(id),
  );

  const leave = (summary: ProfileSetupSummary) => {
    if (hasLeftRef.current) return;
    hasLeftRef.current = true;
    trackProfileSetupCompleted(summary);
    router.replace(onboardingPath);
  };

  const isTeamNameUnresolved = teamId !== null && teamName === "";
  if (userError || positionsError || isTeamNameUnresolved) {
    return (
      <ProfileSetupLayout onSkip={() => leave(SKIPPED_BEFORE_LOAD)}>
        <p className="text-sm text-zinc-400">
          プロフィールを読み込めませんでした。スキップして、あとからプロフィール編集で設定できます。
        </p>
      </ProfileSetupLayout>
    );
  }

  // 既存の所属チームは表示名まで揃ってからフォームを出す。名前が空のまま保存すると
  // 未入力扱いになり、既存の所属チームを消してしまう。
  const isTeamNameReady = teamId === null || teamName !== undefined;
  if (!user || !positions || !isTeamNameReady) {
    return (
      <ProfileSetupLayout onSkip={() => leave(SKIPPED_BEFORE_LOAD)}>
        <div className="flex justify-center py-10">
          <Spinner color="primary" aria-label="読み込み中" />
        </div>
      </ProfileSetupLayout>
    );
  }

  const initialValues: ProfileSetupInitialValues = {
    team: teamId !== null && teamName ? { id: teamId, name: teamName } : null,
    positionIds: user.positions.map((position) => position.id),
    throwHand: user.throw_hand ?? null,
    battingSide: user.batting_side ?? null,
  };

  return (
    <ProfileSetupForm
      key={user.id}
      userId={user.id}
      initialValues={initialValues}
      positions={positions}
      onLeave={leave}
    />
  );
}
