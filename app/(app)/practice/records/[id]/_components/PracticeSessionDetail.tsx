"use client";

import type { BaseballNoteV2 } from "@app/interface/baseballNoteV2";
import type { PracticeMenu, PracticeSession } from "@app/types/practice";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { SAMPLE_CONDITION } from "@app/(app)/practice/record/_components/conditionSample";
import HeaderDetailActions from "@app/components/header/HeaderDetailActions";
import NoteListItem from "@app/components/note/NoteListItem";
import ConditionCard from "@app/components/practice/ConditionCard";
import { ProUpsellOverlay } from "@app/components/pro/ProUpsellOverlay";
import { SampleDataLabel } from "@app/components/pro/SampleDataLabel";
import {
  formatPracticeValue,
  practiceIconForLog,
} from "@app/constants/practice";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import { deletePracticeSession } from "@app/services/v2/practiceSessionService";
import {
  DELETE_CANCEL_LABEL,
  DELETE_CONFIRM_DESCRIPTION,
  DELETE_CONFIRM_LABEL,
  DELETE_LABEL,
  DELETE_MODAL_TITLE,
  DELETE_SUCCESS_MESSAGE,
  DETAIL_MEMO_SECTION_TITLE,
  DETAIL_MENU_SECTION_TITLE,
  DETAIL_NOTES_EMPTY_MESSAGE,
  DETAIL_NOTES_LOAD_ERROR,
  DETAIL_NOTES_SECTION_TITLE,
  EDIT_LABEL,
  MENUS_EMPTY_LOG_MESSAGE,
  deleteConfirmQuestion,
} from "../../_components/practiceRecordsCopy";
import { formatPracticeDate } from "../../_utils/practiceRecordDate";

interface PracticeSessionDetailProps {
  session: PracticeSession;
  /** アイコンのカテゴリ判定用。取得に失敗した場合は空配列で既定アイコンに倒す。 */
  menus: PracticeMenu[];
  /** 紐づく野球ノート。取得に失敗した場合は null（0件と区別する）。 */
  notes: BaseballNoteV2[] | null;
}

const CONDITION_SECTION_TITLE = "コンディション";

const CONDITION_EMPTY_MESSAGE = "この日のコンディションは記録されていません。";

/** 練習記録詳細の Container。表示・削除・編集導線をまとめて受け持つ。 */
export default function PracticeSessionDetail({
  session,
  menus,
  notes,
}: PracticeSessionDetailProps) {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { hasEntitlement, isLoading: isEntitlementLoading } = useEntitlement();

  const categoryById = new Map(menus.map((menu) => [menu.id, menu.category]));
  const practiceDate = formatPracticeDate(session.logged_on);
  const canSeeCondition = hasEntitlement("detailed_condition_log");

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deletePracticeSession(session.id);
    if (!result.ok) {
      setIsDeleting(false);
      toast.error(result.errors[0]);
      return;
    }
    toast.success(DELETE_SUCCESS_MESSAGE);
    router.push("/practice/records");
  };

  return (
    <div>
      <HeaderDetailActions
        backHref="/practice/records"
        editHref={`/practice/record?date=${session.logged_on}`}
        editLabel={EDIT_LABEL}
        deleteLabel={DELETE_LABEL}
        onDeleteClick={() => setIsConfirmOpen(true)}
        isDeleting={isDeleting}
      />

      <h2 className="text-2xl font-bold text-white">{practiceDate}</h2>

      <h3 className="mt-8 text-sm font-bold text-white">
        {DETAIL_MENU_SECTION_TITLE}
      </h3>
      {session.practice_logs.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {session.practice_logs.map((log) => {
            const MenuIcon = practiceIconForLog(
              log.source,
              log.practice_menu_id === null
                ? undefined
                : categoryById.get(log.practice_menu_id),
            );
            const value = formatPracticeValue(log);
            return (
              <li key={log.id} className="rounded-xl bg-sub p-3">
                <div className="flex items-center gap-2">
                  <MenuIcon
                    className="h-4 w-4 shrink-0 text-[#d08000]"
                    aria-hidden
                  />
                  <p className="flex-1 text-sm font-bold text-white">
                    {log.menu_name}
                  </p>
                  {value ? (
                    <p className="text-sm font-extrabold text-[#d08000]">
                      {value}
                    </p>
                  ) : null}
                </div>
                {log.memo ? (
                  <p className="mt-1.5 text-[13px] leading-5 text-zinc-300">
                    {log.memo}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-zinc-400">{MENUS_EMPTY_LOG_MESSAGE}</p>
      )}

      {session.memo ? (
        <>
          <h3 className="mt-8 text-sm font-bold text-white">
            {DETAIL_MEMO_SECTION_TITLE}
          </h3>
          <p className="mt-3 whitespace-pre-wrap rounded-xl bg-sub p-3 text-[13px] leading-5 text-zinc-200">
            {session.memo}
          </p>
        </>
      ) : null}

      <h3 className="mt-8 text-sm font-bold text-white">
        {CONDITION_SECTION_TITLE}
      </h3>
      <div className="mt-3">
        {canSeeCondition ? (
          session.condition ? (
            <ConditionCard
              condition={session.condition}
              showTitle={false}
              className="rounded-xl bg-sub p-3"
            />
          ) : (
            <p className="text-sm text-zinc-400">{CONDITION_EMPTY_MESSAGE}</p>
          )
        ) : (
          <div className="flex flex-col gap-y-2">
            {/* 記録済みのコンディションがあるときは、それを暗幕越しのプレビューにする。 */}
            {isEntitlementLoading || session.condition ? null : (
              <SampleDataLabel />
            )}
            <ProUpsellOverlay feature="detailed_condition_log">
              <ConditionCard
                condition={session.condition ?? SAMPLE_CONDITION}
                showTitle={false}
                className="p-1"
              />
            </ProUpsellOverlay>
          </div>
        )}
      </div>

      <h3 className="mt-8 text-sm font-bold text-white">
        {DETAIL_NOTES_SECTION_TITLE}
      </h3>
      <div className="mt-1">
        {notes === null ? (
          <p className="mt-2 text-sm text-zinc-400">
            {DETAIL_NOTES_LOAD_ERROR}
          </p>
        ) : notes.length > 0 ? (
          notes.map((note) => <NoteListItem key={note.id} note={note} />)
        ) : (
          <p className="mt-2 text-sm text-zinc-400">
            {DETAIL_NOTES_EMPTY_MESSAGE}
          </p>
        )}
      </div>

      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        placement="center"
        className="buzz-dark"
      >
        <ModalContent>
          <ModalHeader className="text-white">{DELETE_MODAL_TITLE}</ModalHeader>
          <ModalBody>
            <p className="text-sm text-white">
              {deleteConfirmQuestion(practiceDate)}
            </p>
            <p className="text-xs text-zinc-400">
              {DELETE_CONFIRM_DESCRIPTION}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => setIsConfirmOpen(false)}
              isDisabled={isDeleting}
            >
              {DELETE_CANCEL_LABEL}
            </Button>
            <Button
              color="danger"
              onPress={handleDelete}
              isDisabled={isDeleting}
              isLoading={isDeleting}
            >
              {DELETE_CONFIRM_LABEL}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
