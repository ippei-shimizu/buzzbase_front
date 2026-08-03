"use client";

import type {
  ReflectionTemplate,
  ReflectionTemplateInput,
} from "@app/interface/reflectionTemplate";
import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { useState } from "react";
import {
  PRESET_EDIT_NOTICE,
  QUESTION_REQUIRED_ERROR,
  TITLE_REQUIRED_ERROR,
} from "./reflectionTemplateCopy";

interface ReflectionTemplateFormModalProps {
  /** 編集対象。null なら新規作成。 */
  template: ReflectionTemplate | null;
  isSaving: boolean;
  /** 保存に失敗したときにフォーム内へ出すサーバー由来のメッセージ。 */
  serverErrors: string[];
  onClose: () => void;
  onSubmit: (input: ReflectionTemplateInput) => void;
}

/** 行の並べ替え・削除で入力中のテキストが他の行へずれないよう、行ごとに不変の id を持たせる。 */
interface QuestionRow {
  id: number;
  text: string;
}

const DEFAULT_ROW_COUNT = 3;

function buildInitialRows(template: ReflectionTemplate | null): QuestionRow[] {
  const texts =
    template && template.questions.length > 0
      ? template.questions
      : Array.from({ length: DEFAULT_ROW_COUNT }, () => "");
  return texts.map((text, index) => ({ id: index, text }));
}

/**
 * 振り返りテンプレの作成・編集フォーム。
 *
 * このコンポーネントは入力値の保持と必須チェックだけを担い、
 * API 呼び出し・上限判定は呼び出し元（Container）に委ねる。
 * 開くたびに呼び出し元が key を変えて再マウントするため、
 * 初期値の同期に useEffect を使わずに済ませている。
 */
export default function ReflectionTemplateFormModal({
  template,
  isSaving,
  serverErrors,
  onClose,
  onSubmit,
}: ReflectionTemplateFormModalProps) {
  const [title, setTitle] = useState(template?.title ?? "");
  const [rows, setRows] = useState<QuestionRow[]>(() =>
    buildInitialRows(template),
  );
  // 初期行の id は 0..n-1 なので、追加行はその続きから振れば衝突しない。
  const [nextRowId, setNextRowId] = useState(rows.length);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [questionError, setQuestionError] = useState<string | null>(null);

  const setQuestion = (id: number, text: string) =>
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, text } : row)),
    );

  const addQuestion = () => {
    setRows((prev) => [...prev, { id: nextRowId, text: "" }]);
    setNextRowId((prev) => prev + 1);
  };

  const removeQuestion = (id: number) =>
    setRows((prev) => prev.filter((row) => row.id !== id));

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    const questions = rows
      .map((row) => row.text.trim())
      .filter((text) => text.length > 0);

    setTitleError(trimmedTitle ? null : TITLE_REQUIRED_ERROR);
    setQuestionError(questions.length > 0 ? null : QUESTION_REQUIRED_ERROR);
    if (!trimmedTitle || questions.length === 0) return;

    onSubmit({ title: trimmedTitle, questions });
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      placement="center"
      scrollBehavior="inside"
      className="buzz-dark"
    >
      <ModalContent>
        <ModalHeader className="text-white">
          {template ? "テンプレを編集" : "テンプレを作る"}
        </ModalHeader>
        <ModalBody className="gap-4">
          {template?.is_preset ? (
            <p className="text-xs text-zinc-400">{PRESET_EDIT_NOTICE}</p>
          ) : null}

          <Input
            type="text"
            variant="bordered"
            label="テンプレ名"
            labelPlacement="outside"
            isRequired
            placeholder="例: 今日のフォーム意識"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            isInvalid={titleError !== null}
            errorMessage={titleError}
          />

          <div>
            <p className="mb-1.5 text-sm text-white">
              問い<span className="ml-1 text-danger">*</span>
            </p>
            <ul className="space-y-2">
              {rows.map((row, index) => (
                <li key={row.id} className="flex items-center gap-2">
                  <Input
                    type="text"
                    variant="bordered"
                    aria-label={`問い ${index + 1}`}
                    placeholder={`問い ${index + 1}`}
                    value={row.text}
                    onChange={(event) =>
                      setQuestion(row.id, event.target.value)
                    }
                  />
                  {rows.length > 1 ? (
                    <button
                      type="button"
                      aria-label={`問い ${index + 1}を削除`}
                      onClick={() => removeQuestion(row.id)}
                      className="shrink-0 rounded-full p-1 text-zinc-400 transition-colors hover:text-danger"
                    >
                      <XMarkIcon className="h-5 w-5" aria-hidden />
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
            {questionError !== null ? (
              <p className="mt-1.5 text-sm text-danger">{questionError}</p>
            ) : null}
            <button
              type="button"
              onClick={addQuestion}
              className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-[#d08000]"
            >
              <PlusIcon className="h-4 w-4" aria-hidden />
              問いを追加
            </button>
          </div>

          {serverErrors.length > 0 ? (
            <ul role="alert" className="space-y-1 text-sm text-danger">
              {serverErrors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={isSaving}>
            キャンセル
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isDisabled={isSaving}
            isLoading={isSaving}
            className="font-bold"
          >
            保存
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
