"use client";

import type {
  PracticeCategory,
  PracticeMenu,
  PracticeMenuInput,
  PracticeUnit,
} from "@app/types/practice";
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
  PRACTICE_CATEGORIES,
  PRACTICE_UNITS,
  parseDecimal,
} from "@app/constants/practice";
import { NAME_REQUIRED_ERROR } from "./practiceMenuCopy";

interface PracticeMenuFormModalProps {
  /** 編集対象。null なら新規作成。 */
  menu: PracticeMenu | null;
  isSaving: boolean;
  /** 保存に失敗したときにフォーム内へ出すサーバー由来のメッセージ。 */
  serverErrors: string[];
  onClose: () => void;
  onSubmit: (input: PracticeMenuInput) => void;
}

/** 未知の unit が来ても落とさないよう、既定（回数）へフォールバックする。 */
function unitMetaFor(unit: PracticeUnit) {
  return PRACTICE_UNITS.find((item) => item.key === unit) ?? PRACTICE_UNITS[0];
}

/**
 * 練習メニューの作成・編集フォーム。
 *
 * このコンポーネントは入力値の保持と必須チェックだけを担い、
 * API 呼び出し・上限判定は呼び出し元（Container）に委ねる。
 * 開くたびに呼び出し元が key を変えて再マウントするため、
 * 初期値の同期に useEffect を使わずに済ませている。
 */
export default function PracticeMenuFormModal({
  menu,
  isSaving,
  serverErrors,
  onClose,
  onSubmit,
}: PracticeMenuFormModalProps) {
  const [name, setName] = useState(menu?.name ?? "");
  const [category, setCategory] = useState<PracticeCategory>(
    menu?.category ?? "batting",
  );
  const [unit, setUnit] = useState<PracticeUnit>(menu?.unit ?? "count");
  const [defaultValue, setDefaultValue] = useState(() => {
    const parsed = parseDecimal(menu?.default_value);
    return parsed === null ? "" : String(parsed);
  });
  const [nameError, setNameError] = useState<string | null>(null);

  const unitMeta = unitMetaFor(unit);

  const handleCategoryChange = (next: PracticeCategory) => {
    setCategory(next);
    // 筋トレは重さ×回数を既定にする。逆に筋トレ以外へ移したときは重さ×回数を引きずらせない。
    if (next === "strength") {
      setUnit("weight_reps");
    } else if (unit === "weight_reps") {
      setUnit("count");
    }
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError(NAME_REQUIRED_ERROR);
      return;
    }
    setNameError(null);

    onSubmit({
      name: trimmedName,
      category,
      unit,
      // 表示ラベルは計測タイプから自動で決める（回数=本、時間=分 など）。ユーザーには入力させない。
      unit_label: unitMeta.defaultLabel,
      default_value: defaultValue === "" ? null : Number(defaultValue),
    });
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
          {menu ? "メニューを編集" : "メニューを作る"}
        </ModalHeader>
        <ModalBody className="gap-4">
          <Input
            type="text"
            variant="bordered"
            classNames={{
              label: "text-zinc-300",
              input: "text-white",
              inputWrapper: "border-zinc-600 hover:border-zinc-400",
            }}
            label="名前"
            labelPlacement="outside"
            isRequired
            placeholder="例: 素振り、ティー、ランニング"
            value={name}
            onChange={(event) => setName(event.target.value)}
            isInvalid={nameError !== null}
            errorMessage={nameError}
          />

          <div>
            <p className="mb-1.5 text-sm text-white">
              カテゴリ<span className="ml-1 text-danger">*</span>
            </p>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="カテゴリ"
            >
              {PRACTICE_CATEGORIES.map((item) => {
                const isActive = item.key === category;
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => handleCategoryChange(item.key)}
                    className={`rounded-full border px-3.5 py-2 text-xs font-bold transition-colors ${
                      isActive
                        ? "border-[#d08000] bg-[#d08000] text-white"
                        : "border-zinc-600 bg-sub text-zinc-400 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-sm text-white">
              計測<span className="ml-1 text-danger">*</span>
            </p>
            <div
              className="flex overflow-hidden rounded-lg border-1 border-zinc-600"
              role="group"
              aria-label="計測"
            >
              {PRACTICE_UNITS.map((item) => {
                const isActive = item.key === unit;
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setUnit(item.key)}
                    className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
                      isActive
                        ? "bg-[#d08000] text-white"
                        : "bg-sub text-zinc-400"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            type="number"
            variant="bordered"
            classNames={{
              label: "text-zinc-300",
              input: "text-white",
              inputWrapper: "border-zinc-600 hover:border-zinc-400",
            }}
            label="初期値（任意）"
            labelPlacement="outside"
            placeholder={`例: ${unitMeta.placeholderValue}`}
            value={defaultValue}
            onChange={(event) => setDefaultValue(event.target.value)}
            endContent={
              <span className="text-sm text-zinc-400">
                {unitMeta.defaultLabel}
              </span>
            }
            description="記録するときに初期表示される量です。毎回変更できます。"
          />

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
