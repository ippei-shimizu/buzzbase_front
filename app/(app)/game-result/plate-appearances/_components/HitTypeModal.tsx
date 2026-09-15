"use client";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import {
  HIT_TYPE_OPTIONS,
  type HitTypeOption,
} from "@app/constants/plateResults";

interface HitTypeModalProps {
  isOpen: boolean;
  onSelect: (option: HitTypeOption) => void;
  onClose: () => void;
}

// 本塁打系は「走本塁打」がラベル4文字で他より長いため、単打〜三塁打とは別の行に分けて
// 1 行あたりの列数を減らす。
const BASE_HIT_OPTIONS = HIT_TYPE_OPTIONS.filter(
  (option) => option.hit_type !== "home_run",
);
const HOME_RUN_OPTIONS = HIT_TYPE_OPTIONS.filter(
  (option) => option.hit_type === "home_run",
);

const OPTION_CLASS =
  "font-bold min-w-0 px-0 h-11 border-2 border-[#d08000] bg-transparent text-[#d08000]";

/** 「ヒット」押下時のサブ選択モーダル。plate_result_id と hit_type（本塁打は home_run_type も）を親へ返す。 */
export function HitTypeModal({ isOpen, onSelect, onClose }: HitTypeModalProps) {
  const renderOption = (option: HitTypeOption) => (
    <Button
      key={option.label}
      variant="bordered"
      radius="sm"
      size="sm"
      className={OPTION_CLASS}
      onPress={() => onSelect(option)}
    >
      {option.label}
    </Button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      size="sm"
      classNames={{ base: "buzz-dark" }}
    >
      <ModalContent>
        <ModalHeader className="justify-center">ヒット種別</ModalHeader>
        <ModalBody className="pb-6">
          <div className="grid grid-cols-3 gap-2">
            {BASE_HIT_OPTIONS.map(renderOption)}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {HOME_RUN_OPTIONS.map(renderOption)}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
