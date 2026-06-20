"use client";
import type { Pitcher, ThrowHand } from "@app/interface/pitcher";
import type {
  ArmAngleMaster,
  PitcherStyleMaster,
  VelocityZoneMaster,
} from "@app/interface/plateAppearanceMasters";
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
import { THROW_HAND_FULL_LABELS } from "@app/constants/throwHand";
import { createPitcher, updatePitcher } from "@app/services/v2/pitcherService";
import { MasterChipSelector } from "./MasterChipSelector";

interface PitcherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (pitcher: Pitcher) => void;
  editingPitcher?: Pitcher | null;
  defaultTeamId?: number | null;
  armAngles: ArmAngleMaster[];
  velocityZones: VelocityZoneMaster[];
  pitcherStyles: PitcherStyleMaster[];
}

const THROW_HANDS: ThrowHand[] = ["right", "left"];

/** 相手投手の新規登録 / 編集モーダル。保存後に作成/更新された投手を親へ返す。 */
export function PitcherFormModal({
  isOpen,
  onClose,
  onSaved,
  editingPitcher,
  defaultTeamId,
  armAngles,
  velocityZones,
  pitcherStyles,
}: PitcherFormModalProps) {
  const isEdit = !!editingPitcher;
  const [name, setName] = useState(editingPitcher?.name ?? "");
  const [throwHand, setThrowHand] = useState<ThrowHand | null>(
    editingPitcher?.throw_hand ?? null,
  );
  const [armAngleId, setArmAngleId] = useState<number | null>(
    editingPitcher?.arm_angle?.id ?? null,
  );
  const [velocityZoneId, setVelocityZoneId] = useState<number | null>(
    editingPitcher?.velocity_zone?.id ?? null,
  );
  const [pitcherStyleId, setPitcherStyleId] = useState<number | null>(
    editingPitcher?.pitcher_style?.id ?? null,
  );
  const [memo, setMemo] = useState(editingPitcher?.memo ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSave = async () => {
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setErrors([]);
    const input = {
      name: name.trim(),
      throw_hand: throwHand,
      arm_angle_id: armAngleId,
      velocity_zone_id: velocityZoneId,
      pitcher_style_id: pitcherStyleId,
      memo: memo.trim() || null,
      // 編集時は既存 team_id を尊重し、新規時のみ相手チームを自動セットする。
      team_id: isEdit ? editingPitcher?.team_id : defaultTeamId,
    };
    const result =
      isEdit && editingPitcher
        ? await updatePitcher(editingPitcher.id, input)
        : await createPitcher(input);
    if (result.ok) {
      onSaved(result.data);
    } else {
      setErrors(result.errors);
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      size="md"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader>{isEdit ? "投手を編集" : "投手を新規登録"}</ModalHeader>
        <ModalBody>
          {errors.length > 0 && (
            <ul className="text-red-500 text-sm list-disc pl-5">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
          <Input
            isRequired
            label="名前"
            labelPlacement="outside"
            variant="bordered"
            placeholder="投手名を入力"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <div className="flex flex-col gap-y-2">
            <p className="text-sm font-medium">利き手</p>
            <div className="flex gap-x-2">
              {THROW_HANDS.map((hand) => {
                const isSelected = throwHand === hand;
                return (
                  <Button
                    key={hand}
                    size="sm"
                    radius="sm"
                    color="primary"
                    variant={isSelected ? "solid" : "bordered"}
                    onPress={() => setThrowHand(isSelected ? null : hand)}
                  >
                    {THROW_HAND_FULL_LABELS[hand]}
                  </Button>
                );
              })}
            </div>
          </div>
          <MasterChipSelector
            label="腕の角度"
            options={armAngles}
            value={armAngleId}
            onChange={setArmAngleId}
          />
          <MasterChipSelector
            label="球速帯"
            options={velocityZones}
            value={velocityZoneId}
            onChange={setVelocityZoneId}
          />
          <MasterChipSelector
            label="投手タイプ"
            options={pitcherStyles}
            value={pitcherStyleId}
            onChange={setPitcherStyleId}
          />
          <Textarea
            label="メモ"
            labelPlacement="outside"
            variant="bordered"
            placeholder="配球の傾向や特徴など"
            maxLength={1000}
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={isSubmitting}>
            キャンセル
          </Button>
          <Button
            color="primary"
            className="font-bold"
            onPress={handleSave}
            isDisabled={isSubmitting || !name.trim()}
          >
            保存
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
