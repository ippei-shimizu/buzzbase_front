"use client";

import type { InsightCombinationInput } from "@app/types/insight";
import type { PracticeMenu } from "@app/types/practice";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { useState } from "react";
import {
  INSIGHT_INPUT_OPTIONS,
  INSIGHT_METRIC_OPTIONS,
  PRACTICE_MENU_INPUT_TYPE,
} from "@app/constants/insight";
import {
  FIXED_INPUT_MODE_LABEL,
  FORM_DESCRIPTION,
  FORM_TITLE,
  INPUT_MODE_LABEL,
  INPUT_REQUIRED_ERROR,
  MENU_INPUT_MODE_LABEL,
  MENU_REQUIRED_ERROR,
  METRIC_LABEL,
  METRIC_REQUIRED_ERROR,
  NO_PRACTICE_MENU_MESSAGE,
} from "./insightCopy";

type InputMode = "fixed" | "menu";

const INPUT_MODES: ReadonlyArray<{ key: InputMode; label: string }> = [
  { key: "fixed", label: FIXED_INPUT_MODE_LABEL },
  { key: "menu", label: MENU_INPUT_MODE_LABEL },
];

interface InsightCombinationFormModalProps {
  practiceMenus: PracticeMenu[];
  isSaving: boolean;
  /** 作成に失敗したときにフォーム内へ出すサーバー由来のメッセージ。 */
  serverErrors: string[];
  onClose: () => void;
  onSubmit: (input: InsightCombinationInput) => void;
}

function chipClass(isActive: boolean): string {
  return `rounded-full px-3.5 py-2 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d08000] ${
    isActive ? "bg-[#d08000] font-bold text-white" : "bg-[#3A3A3A] text-zic-100"
  }`;
}

/**
 * 自作の組み合わせを作るフォーム。
 *
 * 入力値の保持と必須チェックだけを担い、API 呼び出し・上限判定・重複判定は
 * 呼び出し元（Container）に委ねる。開くたびに呼び出し元が key を変えて再マウントするため、
 * 初期化に useEffect を使わずに済ませている。
 */
export default function InsightCombinationFormModal({
  practiceMenus,
  isSaving,
  serverErrors,
  onClose,
  onSubmit,
}: InsightCombinationFormModalProps) {
  const [inputMode, setInputMode] = useState<InputMode>("fixed");
  const [fixedInput, setFixedInput] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<number | null>(null);
  const [metric, setMetric] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (inputMode === "fixed" && fixedInput === null) {
      setValidationError(INPUT_REQUIRED_ERROR);
      return;
    }
    if (inputMode === "menu" && menuId === null) {
      setValidationError(MENU_REQUIRED_ERROR);
      return;
    }
    if (metric === null) {
      setValidationError(METRIC_REQUIRED_ERROR);
      return;
    }
    setValidationError(null);

    onSubmit(
      inputMode === "menu"
        ? {
            input_type: PRACTICE_MENU_INPUT_TYPE,
            practice_menu_id: menuId,
            metric,
          }
        : { input_type: fixedInput as string, practice_menu_id: null, metric },
    );
  };

  const errors = validationError === null ? serverErrors : [validationError];

  return (
    <Modal
      isOpen
      onClose={onClose}
      placement="center"
      scrollBehavior="inside"
      className="buzz-dark"
    >
      <ModalContent>
        <ModalHeader className="text-white">{FORM_TITLE}</ModalHeader>
        <ModalBody className="gap-4">
          <p className="rounded-[10px] bg-[#3A3A3A] p-3 text-[13px] leading-5 text-zic-100">
            {FORM_DESCRIPTION}
          </p>

          <fieldset>
            <legend className="mb-2 text-[13px] font-semibold text-zinc-400">
              {INPUT_MODE_LABEL}
            </legend>
            <div className="mb-3 flex gap-2">
              {INPUT_MODES.map((mode) => {
                const isActive = inputMode === mode.key;
                return (
                  <button
                    key={mode.key}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setInputMode(mode.key)}
                    className={`flex-1 rounded-lg py-2.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d08000] ${
                      isActive
                        ? "bg-[#d08000] text-white"
                        : "bg-[#3A3A3A] text-zinc-400"
                    }`}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>

            {inputMode === "fixed" ? (
              <div className="flex flex-wrap gap-2">
                {INSIGHT_INPUT_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    aria-pressed={fixedInput === option.key}
                    onClick={() => setFixedInput(option.key)}
                    className={chipClass(fixedInput === option.key)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : practiceMenus.length === 0 ? (
              <p className="text-[13px] text-zinc-400">
                {NO_PRACTICE_MENU_MESSAGE}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {practiceMenus.map((menu) => (
                  <button
                    key={menu.id}
                    type="button"
                    aria-pressed={menuId === menu.id}
                    onClick={() => setMenuId(menu.id)}
                    className={chipClass(menuId === menu.id)}
                  >
                    {menu.name}
                  </button>
                ))}
              </div>
            )}
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-[13px] font-semibold text-zinc-400">
              {METRIC_LABEL}
            </legend>
            <div className="flex flex-wrap gap-2">
              {INSIGHT_METRIC_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  aria-pressed={metric === option.key}
                  onClick={() => setMetric(option.key)}
                  className={chipClass(metric === option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          {errors.length > 0 ? (
            <ul className="space-y-1" role="alert">
              {errors.map((message) => (
                <li key={message} className="text-xs text-danger">
                  {message}
                </li>
              ))}
            </ul>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={isSaving}>
            キャンセル
          </Button>
          <Button color="primary" onPress={handleSubmit} isDisabled={isSaving}>
            作成する
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
