/** 登録直後の入力フロー。ナビゲーションとフッターを出さず、離脱導線を増やさない。 */
export const REGISTRATION_FLOW_PATHS = [
  "/register-username",
  "/profile-setup",
] as const;

/**
 * 登録直後の入力フローの画面かを判定する。
 *
 * @param pathName 現在のパス（`usePathname()` の値）
 * @returns 登録フローの画面なら true
 */
export const isRegistrationFlowPath = (pathName: string) =>
  REGISTRATION_FLOW_PATHS.some((path) => pathName.startsWith(path));
