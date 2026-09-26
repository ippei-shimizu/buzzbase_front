import type { Team } from "@app/interface";
import type { ThrowHand } from "@app/interface/pitcher";
import type { SharedSelection } from "@heroui/system";
import type { Key } from "react";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  BATTING_SIDES,
  BATTING_SIDE_LABELS,
  THROW_HANDS,
  type BattingSide,
} from "@app/constants/handedness";
import { THROW_HAND_FULL_LABELS } from "@app/constants/throwHand";

export interface PositionOption {
  id: number;
  name: string;
}

interface Props {
  teamName: string;
  selectedTeamId: number | null;
  teamSuggestions: Team[];
  positions: PositionOption[];
  selectedPositionIds: number[];
  throwHand: ThrowHand | null;
  battingSide: BattingSide | null;
  isSubmitting: boolean;
  onTeamNameChange: (value: string) => void;
  onTeamSelectionChange: (key: Key | null) => void;
  onPositionsChange: (positionIds: number[]) => void;
  onThrowHandChange: (value: ThrowHand | null) => void;
  onBattingSideChange: (value: BattingSide | null) => void;
  onSubmit: () => void;
}

const selectedButtonClassName =
  "border-2 border-[#d08000] bg-[#d08000] text-white";
const unselectedButtonClassName =
  "border-2 border-[#d08000] bg-transparent text-[#d08000]";

export default function ProfileSetupFields({
  teamName,
  selectedTeamId,
  teamSuggestions,
  positions,
  selectedPositionIds,
  throwHand,
  battingSide,
  isSubmitting,
  onTeamNameChange,
  onTeamSelectionChange,
  onPositionsChange,
  onThrowHandChange,
  onBattingSideChange,
  onSubmit,
}: Props) {
  const handlePositionSelectionChange = (keys: SharedSelection) => {
    if (keys === "all") return;
    onPositionsChange(Array.from(keys).map(Number));
  };

  return (
    <form
      className="flex flex-col gap-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Autocomplete
        allowsCustomValue
        label="所属チーム"
        labelPlacement="outside"
        placeholder="チーム名を入力"
        variant="bordered"
        items={teamSuggestions}
        inputValue={teamName}
        selectedKey={selectedTeamId === null ? null : String(selectedTeamId)}
        onInputChange={onTeamNameChange}
        onSelectionChange={onTeamSelectionChange}
      >
        {(team) => (
          <AutocompleteItem key={String(team.id)} textValue={team.name}>
            {team.name}
          </AutocompleteItem>
        )}
      </Autocomplete>
      <Select
        label="ポジション（複数選択可）"
        labelPlacement="outside"
        placeholder="ポジションを選択"
        variant="bordered"
        selectionMode="multiple"
        selectedKeys={selectedPositionIds.map(String)}
        onSelectionChange={handlePositionSelectionChange}
      >
        {positions.map((position) => (
          <SelectItem key={String(position.id)} textValue={position.name}>
            {position.name}
          </SelectItem>
        ))}
      </Select>
      <div className="flex flex-col gap-y-2">
        <p className="text-sm font-medium">利き腕（投）</p>
        <div className="flex gap-x-2">
          {THROW_HANDS.map((hand) => {
            const isSelected = throwHand === hand;
            return (
              <Button
                key={hand}
                size="sm"
                radius="sm"
                variant={isSelected ? "solid" : "bordered"}
                aria-pressed={isSelected}
                className={
                  isSelected
                    ? selectedButtonClassName
                    : unselectedButtonClassName
                }
                onPress={() => onThrowHandChange(isSelected ? null : hand)}
              >
                {THROW_HAND_FULL_LABELS[hand]}
              </Button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-y-2">
        <p className="text-sm font-medium">打席</p>
        <div className="flex gap-x-2">
          {BATTING_SIDES.map((side) => {
            const isSelected = battingSide === side;
            return (
              <Button
                key={side}
                size="sm"
                radius="sm"
                variant={isSelected ? "solid" : "bordered"}
                aria-pressed={isSelected}
                className={
                  isSelected
                    ? selectedButtonClassName
                    : unselectedButtonClassName
                }
                onPress={() => onBattingSideChange(isSelected ? null : side)}
              >
                {BATTING_SIDE_LABELS[side]}
              </Button>
            );
          })}
        </div>
      </div>
      <Button
        type="submit"
        radius="full"
        className="mt-6 mx-auto px-14 bg-yellow-500 text-white text-base font-semibold"
        isLoading={isSubmitting}
      >
        保存してはじめる
      </Button>
    </form>
  );
}
