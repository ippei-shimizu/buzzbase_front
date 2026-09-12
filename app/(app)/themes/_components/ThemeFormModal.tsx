"use client";

import type {
  ImprovementTheme,
  ImprovementThemeInput,
} from "@app/types/improvementTheme";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@heroui/react";
import { useState } from "react";
import { THEME_CATEGORIES } from "@app/constants/improvementTheme";
import { TITLE_REQUIRED_ERROR } from "./themeCopy";

interface ThemeFormModalProps {
  /** 編集対象。null なら新規作成。 */
  theme: ImprovementTheme | null;
  isSaving: boolean;
  /** 保存に失敗したときにフォーム内へ出すサーバー由来のメッセージ。 */
  serverErrors: string[];
  onClose: () => void;
  onSubmit: (input: ImprovementThemeInput) => void;
}

const TITLE_MAX_LENGTH = 100;

/**
 * 課題の作成・編集フォーム。
 *
 * 入力値の保持と必須チェックだけを担い、API 呼び出し・上限判定は呼び出し元に委ねる。
 * 開くたびに呼び出し元が key を変えて再マウントするため、初期値の同期に useEffect を使わない。
 */
export default function ThemeFormModal({
  theme,
  isSaving,
  serverErrors,
  onClose,
  onSubmit,
}: ThemeFormModalProps) {
  const [title, setTitle] = useState(theme?.title ?? "");
  const [category, setCategory] = useState<string>(
    theme?.category ?? THEME_CATEGORIES[0].value,
  );
  const [purpose, setPurpose] = useState(theme?.purpose ?? "");
  const [titleError, setTitleError] = useState<string | null>(null);

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    if (trimmedTitle === "") {
      setTitleError(TITLE_REQUIRED_ERROR);
      return;
    }
    setTitleError(null);
    onSubmit({
      title: trimmedTitle,
      category,
      // 空欄は「目的なし」を意味するため null で送る（空文字だと back に空文字が保存される）。
      purpose: purpose.trim() === "" ? null : purpose.trim(),
    });
  };

  return (
    <Modal isOpen onClose={onClose} placement="center" className="buzz-dark">
      <ModalContent>
        <ModalHeader className="text-white">
          {theme ? "課題を編集" : "課題を決める"}
        </ModalHeader>
        <ModalBody className="gap-4">
          <Input
            isRequired
            label="いま取り組む課題"
            labelPlacement="outside"
            placeholder="例: 肩の開きを抑える"
            maxLength={TITLE_MAX_LENGTH}
            value={title}
            onValueChange={setTitle}
            isInvalid={titleError !== null}
            errorMessage={titleError}
          />

          <div>
            <p className="mb-2 text-sm text-zinc-300">カテゴリ</p>
            <div className="flex flex-wrap gap-2" role="group">
              {THEME_CATEGORIES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={category === item.value}
                  onClick={() => setCategory(item.value)}
                  className={`rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
                    category === item.value
                      ? "bg-[#d08000] text-white"
                      : "bg-sub text-zinc-400 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="目的・メモ（任意）"
            labelPlacement="outside"
            placeholder="何のために取り組むか。克服の基準など"
            minRows={3}
            value={purpose}
            onValueChange={setPurpose}
          />

          {serverErrors.length > 0 ? (
            <div role="alert" className="text-xs text-red-400">
              {serverErrors.map((message) => (
                <p key={message}>{message}</p>
              ))}
            </div>
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
          >
            {theme ? "更新" : "この課題に取り組む"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
