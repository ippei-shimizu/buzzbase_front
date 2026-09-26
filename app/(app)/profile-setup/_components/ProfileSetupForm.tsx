"use client";

import type { PositionOption } from "./ProfileSetupFields";
import type { BattingSide } from "@app/constants/handedness";
import type { Team } from "@app/interface";
import type { ThrowHand } from "@app/interface/pitcher";
import * as Sentry from "@sentry/nextjs";
import { useEffect, useState, type Key } from "react";
import useSWR, { useSWRConfig } from "swr";
import ErrorMessages from "@app/components/auth/ErrorMessages";
import { updateUserPositions } from "@app/services/positionService";
import { createOrUpdateTeam, searchTeams } from "@app/services/teamsService";
import { updateProfile } from "@app/services/userService";
import ProfileSetupFields from "./ProfileSetupFields";
import ProfileSetupLayout from "./ProfileSetupLayout";

export interface ConfirmedTeam {
  id: number;
  name: string;
}

export interface ProfileSetupInitialValues {
  team: ConfirmedTeam | null;
  positionIds: number[];
  throwHand: ThrowHand | null;
  battingSide: BattingSide | null;
}

export interface ProfileSetupSummary {
  skipped: boolean;
  has_team: boolean;
  position_count: number;
}

interface Props {
  userId: number;
  initialValues: ProfileSetupInitialValues;
  positions: PositionOption[];
  onLeave: (summary: ProfileSetupSummary) => void;
}

const NO_TEAMS: Team[] = [];
const TEAM_SEARCH_DEBOUNCE_MS = 250;

export default function ProfileSetupForm({
  userId,
  initialValues,
  positions,
  onLeave,
}: Props) {
  const { mutate } = useSWRConfig();
  const [teamName, setTeamName] = useState(initialValues.team?.name ?? "");
  const [lastSelectedTeam, setLastSelectedTeam] =
    useState<ConfirmedTeam | null>(initialValues.team);
  const [selectedPositionIds, setSelectedPositionIds] = useState(
    initialValues.positionIds,
  );
  const [throwHand, setThrowHand] = useState(initialValues.throwHand);
  const [battingSide, setBattingSide] = useState(initialValues.battingSide);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedTeamName = teamName.trim();
  // 選んだチームの名前と入力が一致する間だけ、その id で確定する。名前で引き直すと
  // 同名チームの先頭にすり替わるため、打ち直して同じ名前に戻った場合も選んだ id を使う。
  const confirmedTeam =
    lastSelectedTeam && lastSelectedTeam.name.trim() === trimmedTeamName
      ? lastSelectedTeam
      : null;
  const [teamSearchQuery, setTeamSearchQuery] = useState(trimmedTeamName);
  // IME の変換途中でも入力が変わるため、打ち止めてから検索して 1 文字ごとのリクエストを避ける。
  useEffect(() => {
    const timer = setTimeout(
      () => setTeamSearchQuery(trimmedTeamName),
      TEAM_SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [trimmedTeamName]);
  const { data: searchedTeams } = useSWR(
    teamSearchQuery ? ["profile-setup/teams", teamSearchQuery] : null,
    ([, query]) => searchTeams(query),
    { keepPreviousData: true },
  );
  // デバウンス中は前の検索語の結果が残る。今の入力に合わない候補を出すと、blur 時に
  // フォーカス中の候補が確定されて入力した名前が置き換わるため、部分一致するものだけ残す。
  const teamSuggestions = trimmedTeamName
    ? (searchedTeams ?? NO_TEAMS).filter((team) =>
        team.name.includes(trimmedTeamName),
      )
    : NO_TEAMS;

  // mobile と揃え、スキップ時も保存済みの値ではなくフォーム上の値（復元値を含む）を送る。
  const summarize = (skipped: boolean): ProfileSetupSummary => ({
    skipped,
    has_team: trimmedTeamName.length > 0,
    position_count: selectedPositionIds.length,
  });

  // allowsCustomValue では blur / Enter でも null が飛ぶが、それはクリアではないので無視する。
  const handleTeamSelectionChange = (key: Key | null) => {
    if (key == null) return;
    const selectedTeam = teamSuggestions.find(
      (team) => String(team.id) === String(key),
    );
    if (!selectedTeam) return;
    setLastSelectedTeam({ id: selectedTeam.id, name: selectedTeam.name });
    setTeamName(selectedTeam.name);
  };

  // 候補から選ばずに既存チーム名を打ち切った場合も、候補に同名があれば作成リクエストを飛ばさない。
  // 候補が届いていなければ、back が同名チームを引き当てるか新規作成する。
  const resolveTeamId = async (): Promise<number | null> => {
    if (!trimmedTeamName) return null;
    if (confirmedTeam) return confirmedTeam.id;
    const matchedTeam = teamSuggestions.find(
      (team) => team.name.trim() === trimmedTeamName,
    );
    if (matchedTeam) return matchedTeam.id;
    const response = await createOrUpdateTeam({
      team: {
        name: trimmedTeamName,
        category_id: undefined,
        prefecture_id: undefined,
      },
    });
    const teamId = Number(response.data?.id);
    if (!teamId || Number.isNaN(teamId)) {
      throw new Error("チームの保存結果に id が含まれていません");
    }
    return teamId;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setErrors([]);
    setIsSubmitting(true);
    try {
      const teamId = await resolveTeamId();
      const formData = new FormData();
      // 未選択は空文字で送り、サーバー側で nil に正規化される。
      formData.append("user[team_id]", teamId === null ? "" : String(teamId));
      formData.append("user[throw_hand]", throwHand ?? "");
      formData.append("user[batting_side]", battingSide ?? "");
      await updateProfile(formData);
      await updateUserPositions({ userId, positionIds: selectedPositionIds });
      // 遷移先のマイページが SWR キャッシュの古いプロフィールを表示しないよう破棄する。
      // 対象を絞るのは、遷移をまたいでマウントされ続ける UserProvider のキーを巻き込まないため。
      await mutate(
        (key) =>
          typeof key === "string" &&
          key.startsWith("/api/v1/users/show_user_id_data"),
        undefined,
      );
      onLeave(summarize(false));
    } catch (error) {
      Sentry.captureException(error, { tags: { source: "profile-setup" } });
      setErrors([
        "保存に失敗しました。あとからプロフィール編集で設定することもできます",
      ]);
      setIsSubmitting(false);
    }
  };

  return (
    <ProfileSetupLayout
      isSkipDisabled={isSubmitting}
      onSkip={() => onLeave(summarize(true))}
    >
      <ErrorMessages errors={errors} />
      <ProfileSetupFields
        teamName={teamName}
        selectedTeamId={confirmedTeam?.id ?? null}
        teamSuggestions={teamSuggestions}
        positions={positions}
        selectedPositionIds={selectedPositionIds}
        throwHand={throwHand}
        battingSide={battingSide}
        isSubmitting={isSubmitting}
        onTeamNameChange={setTeamName}
        onTeamSelectionChange={handleTeamSelectionChange}
        onPositionsChange={setSelectedPositionIds}
        onThrowHandChange={setThrowHand}
        onBattingSideChange={setBattingSide}
        onSubmit={handleSubmit}
      />
    </ProfileSetupLayout>
  );
}
