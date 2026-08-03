import type {
  BaseballNoteUpdateInput,
  ReflectionAnswer,
} from "@app/interface/baseballNoteV2";

/** ノート編集画面が扱う入力項目（紐付け・タグはこの画面では編集しない）。 */
export interface NoteEditableFields {
  date: string;
  title: string;
  memo: string;
  /**
   * テンプレ回答。回答を扱わない呼び出し元は省略する
   * （省略した場合は `reflection_answers` キー自体を生やさない）。
   */
  reflectionAnswers?: ReflectionAnswer[];
}

/** 回答の比較用の正規形。並び順も表示順として意味を持つため配列のまま比較する。 */
function serializeAnswers(answers: ReflectionAnswer[] = []): string {
  return JSON.stringify(answers.map((item) => [item.question, item.answer]));
}

/**
 * 変更されたキーだけを含む部分更新ペイロードを作る。
 *
 * back は送られてこなかったキーを「変更なし」として扱うため、編集していない項目は
 * キーごと落とす。特に試合 / 課題 / タグの紐付けは本画面の管轄外なので、
 * ここでキーを生やしてはならない（送った時点でその内容に置き換えられる）。
 * タイトルの空文字は「消す」操作なので、`undefined` ではなく `null` を明示して送る。
 * テンプレ回答も全消しは `[]` を明示して送る（未送信では消えない）。
 */
export function buildNoteUpdateInput(
  initial: NoteEditableFields,
  current: NoteEditableFields,
): BaseballNoteUpdateInput {
  const input: BaseballNoteUpdateInput = {};
  if (current.date !== initial.date) input.date = current.date;
  if (current.title !== initial.title)
    input.title = current.title === "" ? null : current.title;
  if (current.memo !== initial.memo) input.memo = current.memo;
  if (
    serializeAnswers(current.reflectionAnswers) !==
    serializeAnswers(initial.reflectionAnswers)
  ) {
    input.reflection_answers = current.reflectionAnswers ?? [];
  }
  return input;
}

/** 部分更新ペイロードに送信すべき変更が含まれているか。 */
export function hasNoteChanges(input: BaseballNoteUpdateInput): boolean {
  return Object.keys(input).length > 0;
}
