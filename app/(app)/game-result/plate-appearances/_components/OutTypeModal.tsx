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
    <Modal isOpen={isOpen} onClose={onClose} placement="center" size="sm">
      <ModalContent>
        <ModalHeader className="justify-center">アウト種別</ModalHeader>
        <ModalBody className="pb-6">
          <div className="flex flex-col gap-y-2">
            {OUT_TYPE_OPTIONS.map((option) => (
              <Button
                key={option.out_type}
                variant="bordered"
                color="danger"
                radius="sm"
                className="font-bold"
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
