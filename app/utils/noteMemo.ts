import type { ReflectionAnswer } from "@app/interface/baseballNoteV2";

// ノートの memo は Slate 互換の JSON 文字列で保存する。mobile と同じ表現を使うことで
// 同じノートを両アプリで開いても本文が壊れない。v1 時代のノートはプレーンテキストが
// そのまま入っていることがあるため、読み取り側は必ずフォールバックを持つ。

export interface MemoTextNode {
  text: string;
}

export interface MemoParagraph {
  type: "paragraph";
  children: MemoTextNode[];
}

const emptyParagraph = (): MemoParagraph => ({
  type: "paragraph",
  children: [{ text: "" }],
});

/** プレーンテキストを Slate 互換の JSON 文字列にする（v1 ノートと表示互換）。 */
export const buildMemoJson = (text: string): string =>
  JSON.stringify([{ type: "paragraph", children: [{ text }] }]);

/** Slate JSON / プレーンテキストからテキストを取り出す。 */
export const extractMemoText = (memo: string | null | undefined): string => {
  if (!memo) return "";
  try {
    const data = JSON.parse(memo) as { children: { text: string }[] }[];
    return data.map((p) => p.children.map((c) => c.text).join("")).join("\n");
  } catch {
    // 旧データ（プレーンテキスト）・壊れた JSON・想定外構造はそのまま本文として扱う。
    return memo;
  }
};

/**
 * テンプレ回答からメモ本文を合成する。見出しを【】で囲み、本文を改行下・
 * 回答間を空行で区切る。メモ未入力時の一覧プレビュー本文として使う。
 */
export const buildReflectionMemoText = (answers: ReflectionAnswer[]): string =>
  answers.map((item) => `【${item.question}】\n${item.answer}`).join("\n\n");

/**
 * メモ本文がテンプレ回答から自動合成されたもの（新旧フォーマット）かを判定する。
 * 編集時に合成メモを自由メモ欄へ流し込まないための判別に使う。
 */
export const isReflectionMemo = (
  memoText: string,
  answers: ReflectionAnswer[],
): boolean => {
  if (answers.length === 0) return false;
  const legacy = answers
    .map((item) => `${item.question}: ${item.answer}`)
    .join("\n");
  return memoText === buildReflectionMemoText(answers) || memoText === legacy;
};

/**
 * 問いの並び順どおりに回答を組み立てる。未入力（空白のみ）の問いは落とす。
 * 回答は問い文をキーにしたマップで持つため、問いを出し入れしても他の回答が消えない。
 */
export const buildAnswerList = (
  questions: string[],
  answers: Record<string, string>,
): ReflectionAnswer[] =>
  questions
    .map((question) => ({ question, answer: (answers[question] ?? "").trim() }))
    .filter((item) => item.answer.length > 0);

/**
 * 保存する memo を決める。自由メモが空のときだけテンプレ回答から本文を合成する。
 *
 * 一覧のプレビューは memo から作られるため、テンプレだけで書いたノートが
 * 「本文なし」に見えないよう合成する。自由メモが入力されていればそちらを正とし、
 * 合成で上書きしない（ユーザーが書いた本文を失わせない）。
 */
export const resolveNoteMemo = (
  memo: string,
  answers: ReflectionAnswer[],
): string => {
  if (extractMemoText(memo).trim() !== "") return memo;
  return buildMemoJson(
    answers.length > 0 ? buildReflectionMemoText(answers) : "",
  );
};

const isMemoParagraph = (value: unknown): value is MemoParagraph => {
  if (typeof value !== "object" || value === null) return false;
  const children = (value as { children?: unknown }).children;
  if (!Array.isArray(children) || children.length === 0) return false;
  return children.every(
    (child) =>
      typeof child === "object" &&
      child !== null &&
      typeof (child as { text?: unknown }).text === "string",
  );
};

/**
 * memo を Slate エディタの初期値に変換する。
 *
 * Slate は不正なノードを渡されると描画時に例外を投げるため、JSON として読めない・
 * 構造が想定外・v1 のプレーンテキストといったケースは 1 行 1 段落に組み直して返す。
 */
export const parseMemoToSlateValue = (
  memo: string | null | undefined,
): MemoParagraph[] => {
  if (!memo) return [emptyParagraph()];
  try {
    const parsed: unknown = JSON.parse(memo);
    if (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      parsed.every(isMemoParagraph)
    ) {
      return parsed.map((paragraph) => ({
        type: "paragraph",
        children: paragraph.children.map((child) => ({ text: child.text })),
      }));
    }
  } catch {
    // JSON として読めない memo はプレーンテキストとして扱う。
  }
  return memo
    .split("\n")
    .map((line) => ({ type: "paragraph", children: [{ text: line }] }));
};
