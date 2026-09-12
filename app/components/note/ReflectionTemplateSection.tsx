"use client";

import type { ReflectionTemplate } from "@app/interface/reflectionTemplate";
import type { FetchResult } from "@app/services/v2/requests";
import { Textarea } from "@heroui/react";

interface ReflectionTemplateSectionProps {
  /** 一覧の取得結果。失敗を空配列に丸めるとテンプレ未作成と誤表示するため結果ごと受け取る。 */
  templatesResult: FetchResult<ReflectionTemplate[]>;
  selectedTemplateId: number | null;
  /** 表示する問い。新規作成は選択テンプレの問い、編集はノートに保存済みの問い。 */
  questions: string[];
  answers: Record<string, string>;
  /** テンプレ選択チップの操作。locked では選択チップを出さないため不要。 */
  onSelectTemplate?: (template: ReflectionTemplate | null) => void;
  onChangeAnswer: (question: string, answer: string) => void;
  /** 編集時などテンプレ選択を固定し、このノートの問いだけを編集させる（切替による回答消失を防ぐ）。 */
  locked?: boolean;
}

/**
 * 振り返りテンプレの選択と、問い→回答の入力欄。
 * 空欄の自由メモより「何を書くか」を問いで示し、内省の質を上げる。
 * locked のときはテンプレ選択チップを出さず、ノートに保存済みの問いだけを扱う
 * （テンプレは更新で id が変わる・削除されることがあるため、問いはノート側の回答を正とする）。
 */
export default function ReflectionTemplateSection({
  templatesResult,
  selectedTemplateId,
  questions,
  answers,
  onSelectTemplate,
  onChangeAnswer,
  locked = false,
}: ReflectionTemplateSectionProps) {
  const templates =
    templatesResult.status === "ok" ? templatesResult.data : null;
  const selected =
    templates?.find((template) => template.id === selectedTemplateId) ?? null;

  if (locked && questions.length === 0) return null;

  return (
    <section aria-labelledby="reflection-section-heading" className="mt-8">
      <h3
        id="reflection-section-heading"
        className="text-sm font-bold text-zinc-400"
      >
        {locked
          ? `振り返り${selected ? `（${selected.title}）` : ""}`
          : "振り返りテンプレ（任意）"}
      </h3>

      {locked ? null : templates === null ? (
        <p className="mt-2 text-xs text-zinc-400">
          振り返りテンプレを取得できませんでした。メモはそのまま入力できます。
        </p>
      ) : (
        <div
          className="mt-2 flex flex-wrap gap-2"
          role="group"
          aria-label="振り返りテンプレ"
        >
          <button
            type="button"
            aria-pressed={selectedTemplateId === null}
            onClick={() => onSelectTemplate?.(null)}
            className={`rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
              selectedTemplateId === null
                ? "bg-[#d08000] text-white"
                : "bg-sub text-zinc-400 hover:text-white"
            }`}
          >
            なし
          </button>
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              aria-pressed={selectedTemplateId === template.id}
              onClick={() => onSelectTemplate?.(template)}
              className={`rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
                selectedTemplateId === template.id
                  ? "bg-[#d08000] text-white"
                  : "bg-sub text-zinc-400 hover:text-white"
              }`}
            >
              {template.title}
            </button>
          ))}
        </div>
      )}

      {questions.length > 0 ? (
        <div className="mt-4 space-y-4">
          {questions.map((question) => (
            <Textarea
              key={question}
              variant="bordered"
              minRows={2}
              label={question}
              labelPlacement="outside"
              placeholder="ここに書く"
              value={answers[question] ?? ""}
              onChange={(event) => onChangeAnswer(question, event.target.value)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
