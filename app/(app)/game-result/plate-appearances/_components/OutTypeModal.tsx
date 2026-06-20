"use client";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import {
  OUT_TYPE_OPTIONS,
  type OutTypeOption,
} from "@app/constants/plateResults";

interface OutTypeModalProps {
  isOpen: boolean;
  onSelect: (option: OutTypeOption) => void;
  onClose: () => void;
}

/** 「アウト」押下時のサブ選択モーダル。plate_result_id と out_type を親へ返す。 */
export function OutTypeModal({ isOpen, onSelect, onClose }: OutTypeModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      size="sm"
      classNames={{ base: "buzz-dark" }}
    >
      <ModalContent>
        <ModalHeader className="justify-center">アウト種別</ModalHeader>
        <ModalBody className="pb-6">
          <div className="flex flex-col gap-y-2">
            {OUT_TYPE_OPTIONS.map((option) => (
              <Button
                key={option.out_type}
                variant="bordered"
                radius="sm"
                className="font-bold border-2 border-[#d08000] bg-transparent text-[#d08000]"
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
