/**
 * ノートへ紐付ける試合記録の候補・紐付け先カードで使う最小限の情報。
 * back の V2::GameResultSerializer は打席結果や投球成績まで含む重いレスポンスを返すため、
 * 紐付け UI では日付と対戦相手だけに絞って扱う。
 */
export interface GameResultLinkOption {
  game_result_id: number;
  /** YYYY-MM-DD。back の match_result.date_and_time から日付部分だけを取り出したもの。 */
  date: string;
  /** 対戦相手のチーム名。未登録・取得できない場合は空文字。 */
  opponent_team_name: string;
}
