"use client";
import type { PlateAppearanceV2 } from "@app/interface/plateAppearanceV2";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HeaderResult from "@app/components/header/HeaderResult";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import useRequireAuth from "@app/hooks/auth/useRequireAuth";
import { checkExistingMatchResults } from "@app/services/matchResultsService";
import { getCurrentUserId } from "@app/services/userService";
import {
  deletePlateAppearanceV2,
  getPlateAppearancesByGame,
} from "@app/services/v2/plateAppearanceService";
import { PlateAppearanceWizard } from "../../_components/PlateAppearanceWizard";

const LIST_PATH = "/game-result/plate-appearances";

export default function EditPlateAppearancePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  useRequireAuth();
  const plateAppearanceId = Number(params.id);
  const [gameResultId, setGameResultId] = useState<number | null>(null);
  const [editing, setEditing] = useState<PlateAppearanceV2 | null>(null);
  const [opponentTeamId, setOpponentTeamId] = useState<number | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    const result = await deletePlateAppearanceV2(plateAppearanceId);
    if (result.ok) {
      router.push(LIST_PATH);
    } else {
      setIsDeleting(false);
      setDeleteError(
        result.errors[0] ??
          "削除に失敗しました。時間をおいて再度お試しください。",
      );
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("gameResultId");
    if (!saved) {
      router.push("/game-result/record");
      return;
    }
    const id = JSON.parse(saved) as number;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGameResultId(id);
    getPlateAppearancesByGame(id).then((list) => {
      const target = list.find((item) => item.id === plateAppearanceId);
      if (target) setEditing(target);
      else setNotFound(true);
    });
    getCurrentUserId().then((userId) => {
      checkExistingMatchResults(id, userId).then((matchResult) => {
        if (matchResult?.opponent_team_id) {
          setOpponentTeamId(matchResult.opponent_team_id);
        }
      });
    });
  }, [router, plateAppearanceId]);

  useEffect(() => {
    if (notFound) router.push(LIST_PATH);
  }, [notFound, router]);

  return (
    <>
      <HeaderResult />
      <main className="buzz-dark min-h-full">
        <div className="pb-52 relative w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
          <div className="pt-12 px-4 lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:px-6 lg:pb-6">
            {gameResultId !== null && editing !== null ? (
              <>
                <PlateAppearanceWizard
                  gameResultId={gameResultId}
                  batterBoxNumber={editing.batter_box_number}
                  editingPlateAppearance={editing}
                  onCompleted={() => router.push(LIST_PATH)}
                  onCancel={() => router.push(LIST_PATH)}
                  defaultTeamId={opponentTeamId}
                />
                <Button
                  variant="light"
                  radius="sm"
                  className="mt-6 w-full text-danger"
                  onPress={() => setIsConfirmOpen(true)}
                >
                  この打席を削除
                </Button>
              </>
            ) : (
              <LoadingSpinner />
            )}
          </div>
        </div>
      </main>

      <Modal
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setDeleteError(null);
        }}
        placement="center"
        size="sm"
        classNames={{ base: "buzz-dark" }}
      >
        <ModalContent>
          <ModalHeader>打席を削除しますか？</ModalHeader>
          <ModalBody>
            <p className="text-sm text-zinc-300">この操作は取り消せません。</p>
            {deleteError !== null ? (
              <p className="text-sm text-danger">{deleteError}</p>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => setIsConfirmOpen(false)}
              isDisabled={isDeleting}
            >
              キャンセル
            </Button>
            <Button
              color="danger"
              className="font-bold"
              onPress={handleDelete}
              isDisabled={isDeleting}
            >
              削除する
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
