export interface SignUpData {
  email: string;
  password: string;
  passwordConfirmation: string;
  confirm_success_url: string | undefined;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface EmailInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  type?: string;
  label?: string;
  placeholder?: string;
  labelPlacement?: "outside" | "outside-left" | "inside";
  isInvalid: boolean;
  color?:
    | "danger"
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning";
  errorMessage?: string;
  variant?: "flat" | "faded" | "bordered" | "underlined" | undefined;
}

export interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className: string;
  label?: string;
  placeholder: string;
  labelPlacement?: "outside" | "outside-left" | "inside";
  isInvalid: boolean;
  color?:
    | "danger"
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning";
  errorMessage?: string;
  togglePasswordVisibility: () => void;
  isPasswordVisible: boolean;
  type: string;
  variant?: "flat" | "faded" | "bordered" | "underlined" | undefined;
}

export interface PasswordConfirmationInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className: string;
  label?: string;
  placeholder: string;
  labelPlacement?: "outside" | "outside-left" | "inside";
  toggleConfirmVisibility: () => void;
  isConfirmVisible: boolean;
  type: string;
  variant?: "flat" | "faded" | "bordered" | "underlined" | undefined;
}

export interface ErrorMessagesProps {
  errors: string[];
}

export interface SendButtonProps {
  className: string;
  type?: "submit" | "button" | "reset" | undefined;
  text: string;
  disabled: boolean;
}

export interface ToastSuccessProps {
  text: string;
}

export interface UserNameInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  type?: string;
  label?: string;
  placeholder?: string;
  labelPlacement?: "outside" | "outside-left" | "inside";
  isInvalid: boolean;
  color?:
    | "danger"
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning";
  errorMessage?: string;
  variant?: "flat" | "faded" | "bordered" | "underlined" | undefined;
  isRequired: boolean;
}

export interface UserIdInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  type?: string;
  label?: string;
  placeholder?: string;
  labelPlacement?: "outside" | "outside-left" | "inside";
  isInvalid: boolean;
  color?:
    | "danger"
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning";
  errorMessage?: string;
  variant?: "flat" | "faded" | "bordered" | "underlined" | undefined;
  isRequired: boolean;
}

export interface updateUser {
  name: string;
  user_id: string;
}

export type AvailableYear = number | string;

export interface ResultsSelectBoxProps {
  radius?: "none" | "sm" | "md" | "lg" | "full" | undefined;
  className?: string;
  data: { label: string }[];
  color?:
    | "danger"
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning";
  ariaLabel: string;
  variant?: "flat" | "faded" | "bordered" | "underlined" | undefined;
  labelPlacement?: "outside" | "outside-left" | "inside";
  size?: "sm" | "md" | "lg" | undefined;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  propsYears: AvailableYear[];
  selectedKeys?: string[];
  placeholder?: string;
}

export interface updateUserPositions {
  userId: number;
  positionIds: number[];
}

export interface getUserPositions {
  userId: string;
}

export interface teamData {
  team: {
    name: string;
    category_id: number | undefined;
    prefecture_id: number | undefined;
  };
}

export interface PlusButtonProps {
  className: string;
  type?: "submit" | "button" | "reset" | undefined;
  onPress: () => void;
}

export interface AwardData {
  award: {
    title: string;
    userId: string;
  };
}

export interface UserAwards {
  id: number;
  title: string;
}

export interface TournamentData {
  id: number;
  name: string;
}

export interface SeasonData {
  id: number;
  name: string;
  game_results_count?: number;
}

export interface GameResultData {
  game_result: {
    user_id?: number;
    match_result_id?: number | null;
    batting_average_id?: number | null;
    pitching_result_id?: number | null;
    season_id?: number | null;
  };
}

export interface MatchResultsData {
  match_result: {
    game_result_id: number | null;
    user_id: number;
    date_and_time: string;
    match_type: string;
    my_team_id: number;
    opponent_team_id: number;
    my_team_score: number | null;
    opponent_team_score: number | null;
    batting_order: string;
    defensive_position: string;
    tournament_id: number | null;
    memo: string | null;
  };
}

export interface BattingAverageData {
  batting_average: {
    runs_batted_in: number;
    run: number;
    error: number;
    stealing_base: number;
    caught_stealing: number;
  };
}

export interface PlateAppearance {
  plate_appearance: {
    game_result_id: number;
    user_id: number;
    batter_box_number: number | null;
    batting_result: string | null;
  };
}

export interface PitchingResultData {
  pitching_result: {
    game_result_id: number | null;
    user_id: number | null;
    win: number;
    loss: number;
    hold: number;
    saves: number;
    innings_pitched: number;
    number_of_pitches: number;
    got_to_the_distance: boolean;
    run_allowed: number;
    earned_run: number;
    hits_allowed: number;
    home_runs_hit: number;
    strikeouts: number;
    base_on_balls: number;
    hit_by_pitch: number;
  };
}

export interface MatchResult {
  tournament_id: number | null;
  my_team_id: number;
  opponent_team_id: number;
  defensive_position: string;
  user_id: number;
  game_result_id: number;
  opponent_team_name: string;
  my_team_score: number;
  opponent_team_score: number;
}

export interface BattingAverage {
  base_on_balls: number | null;
  caught_stealing: number | null;
  error: number | null;
  game_result_id: number;
  hit: number | null;
  hit_by_pitch: number | null;
  home_run: number | null;
  id: number | null;
  plate_appearances: number | null;
  run: number | null;
  runs_batted_in: number | null;
  sacrifice_hit: number | null;
  sacrifice_fly: number | null;
  stealing_base: number | null;
  strike_out: number | null;
  three_base_hit: number | null;
  times_at_bat: number | null;
  total_bases: number | null;
  two_base_hit: number | null;
  at_bats: number | null;
  user_id: number;
}

export interface PlateAppearanceSummary {
  game_result_id: number;
  user_id: number;
  batter_box_number: number | null;
  batting_result: string;
}

export interface PitchingResult {
  base_on_balls: number;
  earned_run: number;
  game_result_id: number;
  got_to_the_distance: boolean;
  hit_by_pitch: number;
  hits_allowed: number;
  hold: number;
  home_runs_hit: number;
  id: number;
  innings_pitched: number;
  loss: number;
  number_of_pitches: number;
  run_allowed: number;
  saves: number;
  strikeouts: number;
  win: number;
}

export type FollowStatus = "self" | "following" | "pending" | "none";

export interface FollowButtonProps {
  userId: number;
  initialFollowStatus: FollowStatus;
  setErrorsWithTimeout: (errors: string[]) => void;
}

export interface FollowingUser {
  id: number;
  image: {
    url: string;
  };
  name: string;
  user_id: string;
  isFollowing: boolean;
  follow_status?: FollowStatus;
  is_private?: boolean;
}

export interface GroupsData {
  icon: {
    url: string;
  };
  id: number;
  name: string;
}

export interface Notifications {
  id: number;
  actor_user_id: number;
  actor_name: string;
  event_type: string;
  event_id: number;
  read_at: Date;
  created_at: Date;
  actor_icon: {
    url: string;
  };
  group_name: string;
  group_invitation: string;
  follow_request_id?: number;
}

export interface AcceptedUsers {
  id: number;
  name: string;
  user_id: string;
  image: {
    url: string;
  };
}

export interface UserContextType {
  state: {
    userId: {
      id: number | null;
      team_id: number | null;
      user_id: string;
    };
    usersUserId: { user_id: string | null };
  };
}

export interface userData {
  user: {
    image: { url: string };
    name: string;
    user_id: string;
    url: string;
    introduction: string;
    positions: getUserPositions[];
    team_id: number;
    id: number;
  };
  isFollowing: boolean;
  follow_status: FollowStatus;
  is_private: boolean;
  followers_count: number | null;
  following_count: number | null;
}

export interface HeaderNoteSaveProps {
  onNoteSave: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isSubmitting: boolean;
  hasChanges: boolean;
}

export interface createNoteProps {
  date: string;
  title: string;
  memo: string;
}

export interface NoteEditorProps {
  memo: string;
  setMemo: (memo: string) => void;
}

export interface getNoteProps {
  id: number;
  title: string;
  date: string;
  memo: string[];
}

export interface ResendConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  onResendSuccess: () => void;
  showEmailInput: boolean;
}
