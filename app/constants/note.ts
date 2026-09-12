/**
 * 野球ノート一覧の正規パス。
 *
 * 一覧は練習記録一覧のタブとして統合されており、mobile の /(records)/list?tab=note と対応する。
 * 旧 /note はこのパスへリダイレクトする。
 */
export const NOTE_LIST_PATH = "/practice/records?tab=note";

/** 振り返りテンプレ管理画面のパス。 */
export const REFLECTION_TEMPLATES_PATH = "/note/templates";

export const REFLECTION_TEMPLATES_LINK_LABEL = "振り返りテンプレを管理";
