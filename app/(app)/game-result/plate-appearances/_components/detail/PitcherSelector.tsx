"use client";
import type { Pitcher } from "@app/interface/pitcher";
import type {
  ArmAngleMaster,
  PitcherStyleMaster,
  VelocityZoneMaster,
} from "@app/interface/plateAppearanceMasters";
import { PencilSquareIcon, XCircleIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { THROW_HAND_FULL_LABELS } from "@app/constants/throwHand";
import { getTeams } from "@app/services/teamsService";
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

interface Team {
  id: string;
  name: string;
}

const formatSummary = (pitcher: Pitcher, teamName?: string): string => {
  const parts: string[] = [];
  if (teamName) parts.push(teamName);
  if (pitcher.throw_hand)
    parts.push(THROW_HAND_FULL_LABELS[pitcher.throw_hand]);
  if (pitcher.arm_angle?.name) parts.push(pitcher.arm_angle.name);
  if (pitcher.velocity_zone?.name) parts.push(pitcher.velocity_zone.name);
  if (pitcher.pitcher_style?.name) parts.push(pitcher.pitcher_style.name);
  return parts.length === 0 ? "未設定" : parts.join(" / ");
};

/** 相手投手の選択。一覧 + 検索 + 新規登録 / 編集に対応する。 */
export function PitcherSelector({
  value,
  onChange,
  defaultTeamId,
}: PitcherSelectorProps) {
  const [pitchers, setPitchers] = useState<Pitcher[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [armAngles, setArmAngles] = useState<ArmAngleMaster[]>([]);
  const [velocityZones, setVelocityZones] = useState<VelocityZoneMaster[]>([]);
  const [pitcherStyles, setPitcherStyles] = useState<PitcherStyleMaster[]>([]);
  const [query, setQuery] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPitcher, setEditingPitcher] = useState<Pitcher | null>(null);

  useEffect(() => {
    getPitchers({}).then((response) => setPitchers(response.data));
    getTeams().then(setTeams);
    getArmAngles().then(setArmAngles);
    getVelocityZones().then(setVelocityZones);
    getPitcherStyles().then(setPitcherStyles);
  }, []);

  const teamNameById = new Map(
    teams.map((team) => [String(team.id), team.name]),
  );
  const teamNameFor = (pitcher: Pitcher): string | undefined =>
    pitcher.team_id != null
      ? teamNameById.get(String(pitcher.team_id))
      : undefined;

  const selected = pitchers.find((pitcher) => pitcher.id === value) ?? null;
  const filtered = query
    ? pitchers.filter((pitcher) => pitcher.name.includes(query))
    : pitchers;

  // 閉じる時は検索クエリをリセットして、次回開いた時に全件表示にする。
  const closePicker = () => {
    setQuery("");
    setIsPickerOpen(false);
  };

  const handleSaved = (pitcher: Pitcher) => {
    setPitchers((prev) => {
      const exists = prev.some((item) => item.id === pitcher.id);
      return exists
        ? prev.map((item) => (item.id === pitcher.id ? pitcher : item))
        : [...prev, pitcher];
    });
    // 新規作成時のみ自動選択。編集時は元の選択を維持する。
    if (!editingPitcher) onChange(pitcher.id);
    setIsFormOpen(false);
    setEditingPitcher(null);
    closePicker();
  };

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center gap-x-2">
        <div className="flex-1 rounded-lg border border-zinc-600 bg-bg_sub px-3 py-2 text-sm">
          {selected ? (
            <div>
              <p className="font-medium">{selected.name}</p>
              <p className="text-xs text-zinc-400">{formatSummary(selected)}</p>
            </div>
          ) : (
            <span className="text-zinc-500">投手未選択</span>
          )}
        </div>
        <Button
          variant="bordered"
          radius="sm"
          className="font-bold border-2 border-[#d08000] bg-transparent text-[#d08000]"
          onPress={() => setIsPickerOpen(true)}
        >
          選択
        </Button>
        {value !== null && (
          <button
            type="button"
            aria-label="投手の選択を解除"
            className="text-zinc-400"
            onClick={() => onChange(null)}
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        )}
      </div>
      <p className="text-xs text-zinc-500">
        自分が追加した投手だけ表示されます
      </p>

      <Modal
        isOpen={isPickerOpen}
        onClose={closePicker}
        placement="center"
        size="md"
        scrollBehavior="inside"
        classNames={{ base: "buzz-dark" }}
      >
        <ModalContent>
          <ModalHeader>相手投手を選択</ModalHeader>
          <ModalBody>
            <Input
              variant="bordered"
              size="sm"
              placeholder="投手名で検索"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="flex flex-col gap-y-2">
              {filtered.map((pitcher) => (
                <div
                  key={pitcher.id}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                    value === pitcher.id
                      ? "border-[#d08000]"
                      : "border-zinc-700"
                  }`}
                >
                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() => {
                      onChange(pitcher.id);
                      closePicker();
                    }}
                  >
                    <p className="text-sm font-medium">{pitcher.name}</p>
                    <p className="text-xs text-zinc-400">
                      {formatSummary(pitcher, teamNameFor(pitcher))}
                    </p>
                  </button>
                  <button
                    type="button"
                    aria-label={`投手 ${pitcher.name} を編集`}
                    className="text-[#d08000] px-1"
                    onClick={() => {
                      setEditingPitcher(pitcher);
                      setIsFormOpen(true);
                    }}
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
              {filtered.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-4">
                  {query
                    ? "該当する投手が見つかりません"
                    : "投手がまだ登録されていません"}
                </p>
              ) : null}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={closePicker}>
              閉じる
            </Button>
            <Button
              radius="sm"
              className="font-bold bg-[#d08000] text-white"
              onPress={() => {
                setEditingPitcher(null);
                setIsFormOpen(true);
              }}
            >
              + 新規追加
            </Button>
          </ModalFooter>
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
          teams={teams}
          armAngles={armAngles}
          velocityZones={velocityZones}
          pitcherStyles={pitcherStyles}
        />
      )}
    </div>
  );
}
