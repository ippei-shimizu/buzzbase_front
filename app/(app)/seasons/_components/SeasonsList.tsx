"use client";

import type { SeasonData } from "@app/interface";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
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
  const [deleteTarget, setDeleteTarget] = useState<SeasonData | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleCreate = async () => {
    if (!newSeasonName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const newSeason = await createSeason(newSeasonName.trim());
      setSeasons([newSeason, ...seasons]);
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

  const confirmDelete = (season: SeasonData) => {
    setDeleteTarget(season);
    onOpen();
  };

  const handleDelete = async () => {
    if (!deleteTarget || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await deleteSeason(deleteTarget.id);
      setSeasons(seasons.filter((s) => s.id !== deleteTarget.id));
      onClose();
      setDeleteTarget(null);
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
      <Card className="bg-bg_sub shadow-none">
        <CardBody>
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
        </CardBody>
      </Card>
      {seasons.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-8">
          シーズンはまだありません。
        </p>
      ) : (
        <Card className="bg-bg_sub shadow-none">
          <CardBody className="p-0">
            {seasons.map((season, index) => (
              <div key={season.id}>
                {index > 0 && <Divider />}
                <div className="flex items-center justify-between px-4 py-3">
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
                      <div className="flex items-center gap-x-3">
                        <span
                          className="text-sm cursor-pointer hover:text-primary transition-colors"
                          onClick={() => startEditing(season)}
                        >
                          {season.name}
                        </span>
                        {(season.game_results_count ?? 0) > 0 && (
                          <Chip size="sm" variant="flat" color="default">
                            {season.game_results_count}試合
                          </Chip>
                        )}
                      </div>
                      <Button
                        isIconOnly
                        color="default"
                        variant="light"
                        size="sm"
                        onPress={() => confirmDelete(season)}
                        isDisabled={isSubmitting}
                      >
                        <DeleteIcon fill="currentColor" width="20" height="20" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
      <Modal isOpen={isOpen} onClose={onClose} placement="center">
        <ModalContent>
          <ModalHeader>シーズンの削除</ModalHeader>
          <ModalBody>
            {deleteTarget && (deleteTarget.game_results_count ?? 0) > 0 ? (
              <p className="text-sm">
                「{deleteTarget.name}」には
                <span className="font-bold text-danger">
                  {deleteTarget.game_results_count}件の試合
                </span>
                が紐づいています。削除するとシーズンとの紐付けが解除されます。本当に削除しますか？
              </p>
            ) : (
              <p className="text-sm">
                「{deleteTarget?.name}」を削除しますか？
              </p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              キャンセル
            </Button>
            <Button
              color="danger"
              onPress={handleDelete}
              isDisabled={isSubmitting}
            >
              削除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
