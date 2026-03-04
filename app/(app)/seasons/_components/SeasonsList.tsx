"use client";

import type { SeasonData } from "@app/interface";
import { Button, Input } from "@heroui/react";
import { useState } from "react";
import { DeleteIcon } from "@app/components/icon/DeleteIcon";
import {
  createSeason,
  deleteSeason,
  updateSeason,
} from "@app/services/seasonsService";

type SeasonsListProps = {
  initialSeasons: SeasonData[];
};

export default function SeasonsList({ initialSeasons }: SeasonsListProps) {
  const [seasons, setSeasons] = useState<SeasonData[]>(initialSeasons);
  const [newSeasonName, setNewSeasonName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!newSeasonName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const newSeason = await createSeason(newSeasonName.trim());
      setSeasons([...seasons, newSeason]);
      setNewSeasonName("");
    } catch (error) {
      console.error("Failed to create season:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updated = await updateSeason(id, editingName.trim());
      setSeasons(seasons.map((s) => (s.id === id ? updated : s)));
      setEditingId(null);
      setEditingName("");
    } catch (error) {
      console.error("Failed to update season:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await deleteSeason(id);
      setSeasons(seasons.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Failed to delete season:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (season: SeasonData) => {
    setEditingId(season.id);
    setEditingName(season.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-x-3 items-end">
        <Input
          type="text"
          variant="bordered"
          label="新しいシーズン名"
          labelPlacement="outside"
          placeholder="例: 2024年春季"
          size="md"
          value={newSeasonName}
          onChange={(e) => setNewSeasonName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
        />
        <Button
          color="primary"
          size="md"
          radius="sm"
          isDisabled={!newSeasonName.trim() || isSubmitting}
          onPress={handleCreate}
        >
          追加
        </Button>
      </div>
      <div className="space-y-3">
        {seasons.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-4">
            シーズンはまだありません。
          </p>
        ) : (
          seasons.map((season) => (
            <div
              key={season.id}
              className="flex items-center justify-between bg-bg_sub p-3 rounded-lg"
            >
              {editingId === season.id ? (
                <div className="flex gap-x-2 items-center flex-1">
                  <Input
                    type="text"
                    variant="bordered"
                    size="sm"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdate(season.id);
                      if (e.key === "Escape") cancelEditing();
                    }}
                    className="flex-1"
                  />
                  <Button
                    color="primary"
                    size="sm"
                    radius="sm"
                    isDisabled={!editingName.trim() || isSubmitting}
                    onPress={() => handleUpdate(season.id)}
                  >
                    保存
                  </Button>
                  <Button
                    color="default"
                    size="sm"
                    radius="sm"
                    variant="flat"
                    onPress={cancelEditing}
                  >
                    取消
                  </Button>
                </div>
              ) : (
                <>
                  <span
                    className="text-sm cursor-pointer hover:text-primary"
                    onClick={() => startEditing(season)}
                  >
                    {season.name}
                  </span>
                  <Button
                    isIconOnly
                    color="danger"
                    variant="light"
                    size="sm"
                    onPress={() => handleDelete(season.id)}
                    isDisabled={isSubmitting}
                  >
                    <DeleteIcon />
                  </Button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
