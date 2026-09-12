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

/** 「ヒット」押下時のサブ選択モーダル。plate_result_id と hit_type を親へ返す。 */
export function HitTypeModal({ isOpen, onSelect, onClose }: HitTypeModalProps) {
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
          <div className="grid grid-cols-4 gap-2">
            {HIT_TYPE_OPTIONS.map((option) => (
              <Button
                key={option.hit_type}
                variant="bordered"
                radius="sm"
                size="sm"
                className="font-bold min-w-0 px-0 h-11 border-2 border-[#d08000] bg-transparent text-[#d08000]"
                onPress={() => onSelect(option)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
