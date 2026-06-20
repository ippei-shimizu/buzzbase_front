"use client";
import type { Pitcher } from "@app/interface/pitcher";
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
  ModalHeader,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { THROW_HAND_SHORT_LABELS } from "@app/constants/throwHand";
import {
  getArmAngles,
  getPitcherStyles,
  getVelocityZones,
} from "@app/services/v2/masterService";
import { getPitchers } from "@app/services/v2/pitcherService";
import { PitcherFormModal } from "./PitcherFormModal";

interface PitcherSelectorProps {
  value: number | null;
  onChange: (id: number | null) => void;
  defaultTeamId?: number | null;
}

const summarize = (pitcher: Pitcher): string => {
  const parts = [
    pitcher.throw_hand ? THROW_HAND_SHORT_LABELS[pitcher.throw_hand] : null,
    pitcher.arm_angle?.name,
    pitcher.velocity_zone?.name,
    pitcher.pitcher_style?.name,
  ].filter(Boolean);
  return parts.join(" / ");
};

/** 相手投手の選択。一覧 + 検索 + 新規登録 / 編集に対応する。 */
export function PitcherSelector({
  value,
  onChange,
  defaultTeamId,
}: PitcherSelectorProps) {
  const [pitchers, setPitchers] = useState<Pitcher[]>([]);
  const [armAngles, setArmAngles] = useState<ArmAngleMaster[]>([]);
  const [velocityZones, setVelocityZones] = useState<VelocityZoneMaster[]>([]);
  const [pitcherStyles, setPitcherStyles] = useState<PitcherStyleMaster[]>([]);
  const [query, setQuery] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPitcher, setEditingPitcher] = useState<Pitcher | null>(null);

  useEffect(() => {
    getPitchers({}).then((response) => setPitchers(response.data));
    getArmAngles().then(setArmAngles);
    getVelocityZones().then(setVelocityZones);
    getPitcherStyles().then(setPitcherStyles);
  }, []);

  const selected = pitchers.find((pitcher) => pitcher.id === value) ?? null;
  const filtered = query
    ? pitchers.filter((pitcher) => pitcher.name.includes(query))
    : pitchers;

  const handleSaved = (pitcher: Pitcher) => {
    setPitchers((prev) => {
      const exists = prev.some((item) => item.id === pitcher.id);
      return exists
        ? prev.map((item) => (item.id === pitcher.id ? pitcher : item))
        : [...prev, pitcher];
    });
    onChange(pitcher.id);
    setIsFormOpen(false);
    setEditingPitcher(null);
    setIsPickerOpen(false);
  };

  return (
    <div className="flex flex-col gap-y-2">
      <p className="text-sm font-medium">相手投手</p>
      <Button
        variant="bordered"
        radius="sm"
        className="justify-between"
        onPress={() => setIsPickerOpen(true)}
      >
        {selected ? selected.name : "投手を選択 / 新規登録"}
      </Button>

      <Modal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        placement="center"
        size="md"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>投手を選択</ModalHeader>
          <ModalBody className="pb-6">
            <Input
              variant="bordered"
              size="sm"
              placeholder="投手名で検索"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Button
              color="primary"
              variant="bordered"
              radius="sm"
              className="font-bold"
              onPress={() => {
                setEditingPitcher(null);
                setIsFormOpen(true);
              }}
            >
              + 投手を新規登録
            </Button>
            <div className="flex flex-col gap-y-2">
              {filtered.map((pitcher) => (
                <div
                  key={pitcher.id}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                    value === pitcher.id ? "border-primary" : "border-zinc-700"
                  }`}
                >
                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() => {
                      onChange(pitcher.id);
                      setIsPickerOpen(false);
                    }}
                  >
                    <p className="text-sm font-medium">{pitcher.name}</p>
                    {summarize(pitcher) ? (
                      <p className="text-xs text-zinc-400">
                        {summarize(pitcher)}
                      </p>
                    ) : null}
                  </button>
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() => {
                      setEditingPitcher(pitcher);
                      setIsFormOpen(true);
                    }}
                  >
                    編集
                  </Button>
                </div>
              ))}
              {filtered.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-4">
                  投手がいません。新規登録してください。
                </p>
              ) : null}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      {isFormOpen && (
        <PitcherFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingPitcher(null);
          }}
          onSaved={handleSaved}
          editingPitcher={editingPitcher}
          defaultTeamId={defaultTeamId}
          armAngles={armAngles}
          velocityZones={velocityZones}
          pitcherStyles={pitcherStyles}
        />
      )}
    </div>
  );
}
