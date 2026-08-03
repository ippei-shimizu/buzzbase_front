"use client";

import type { BaseballNoteV2 } from "@app/interface/baseballNoteV2";
import type {
  ImprovementTheme,
  ImprovementThemeInput,
  ImprovementThemeStatus,
} from "@app/types/improvementTheme";
import type { PracticeSession } from "@app/types/practice";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { themeCategoryLabel } from "@app/constants/improvementTheme";
import {
  deleteImprovementTheme,
  updateImprovementTheme,
} from "@app/services/v2/improvementThemeService";
import { formatJaFullDate } from "@app/utils/formatDate";
import {
  DELETE_CONFIRM_NOTICE,
  LINKED_NOTES_LOAD_ERROR,
  LINKED_SESSIONS_LOAD_ERROR,
} from "../../_components/themeCopy";
import ThemeFormModal from "../../_components/ThemeFormModal";
import {
  buildThemeStatusInput,
  themeTransitions,
} from "../../_utils/themeList";

interface ThemeDetailContentProps {
  theme: ImprovementTheme;
  sessions: PracticeSession[];
  /** 練習記録の取得に失敗したか。空配列と区別して「0件」の誤表示を避ける。 */
  sessionsLoadFailed: boolean;
  notes: BaseballNoteV2[];
  /** ノートの取得に失敗したか。空配列と区別して「0件」の誤表示を避ける。 */
  notesLoadFailed: boolean;
  /** 克服日に記録する当日（YYYY-MM-DD）。 */
  today: string;
}

/**
 * 課題詳細の Container。
 * 統計は back が集計した値をそのまま表示し、紐づく記録の件数から数え直さない。
 */
export default function ThemeDetailContent({
  theme: initialTheme,
  sessions,
  sessionsLoadFailed,
  notes,
  notesLoadFailed,
  today,
}: ThemeDetailContentProps) {
  const router = useRouter();
  const [theme, setTheme] = useState(initialTheme);
  const [formToken, setFormToken] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const transitions = themeTransitions(theme.status);

  const applyUpdate = async (input: ImprovementThemeInput) => {
    setIsSaving(true);
    const result = await updateImprovementTheme(theme.id, input);
    setIsSaving(false);
    if (!result.ok) {
      setFormErrors(result.errors);
      toast.error(result.errors[0]);
      return false;
    }
    setTheme(result.data);
    return true;
  };

  const handleTransition = async (status: ImprovementThemeStatus) => {
    const succeeded = await applyUpdate(buildThemeStatusInput(status, today));
    if (succeeded) {
      toast.success(
        status === "achieved"
          ? "課題を克服にしました"
          : status === "open"
            ? "課題を取組中に戻しました"
            : "課題をアーカイブしました",
      );
    }
  };

  const handleEditSubmit = async (input: ImprovementThemeInput) => {
    setFormErrors([]);
    const succeeded = await applyUpdate(input);
    if (succeeded) {
      setFormToken(null);
      toast.success("課題を更新しました");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteImprovementTheme(theme.id);
    setIsDeleting(false);
    if (!result.ok) {
      toast.error(result.errors[0]);
      return;
    }
    setDeleteOpen(false);
    toast.success("課題を削除しました");
    router.push("/themes");
  };

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-white">{theme.title}</h2>
          <p className="mt-2 text-sm text-zinc-400">
            {themeCategoryLabel(theme.category)}・
            {formatJaFullDate(theme.started_on)} 開始
            {theme.achieved_on
              ? `・${formatJaFullDate(theme.achieved_on)} 克服`
              : ""}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            size="sm"
            variant="flat"
            onPress={() => {
              setFormErrors([]);
              setFormToken(Date.now());
            }}
          >
            編集
          </Button>
          <Button
            size="sm"
            variant="flat"
            color="danger"
            onPress={() => setDeleteOpen(true)}
          >
            削除
          </Button>
        </div>
      </div>

      {theme.purpose ? (
        <p className="mt-4 whitespace-pre-wrap text-sm text-white">
          {theme.purpose}
        </p>
      ) : null}

      <dl className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="取組日数" value={`${theme.active_days}日`} />
        <Stat label="練習" value={`${theme.practice_logs_count}`} />
        <Stat label="ノート" value={`${theme.notes_count}`} />
      </dl>

      <h3 className="mt-8 text-sm font-bold text-white">紐づく練習記録</h3>
      {sessionsLoadFailed ? (
        <p className="mt-2 text-xs text-zinc-400">
          {LINKED_SESSIONS_LOAD_ERROR}
        </p>
      ) : sessions.length === 0 ? (
        <p className="mt-2 text-xs text-zinc-500">まだありません</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="rounded-lg bg-sub px-3 py-3 text-sm text-white"
            >
              <span className="font-bold">
                {formatJaFullDate(session.logged_on)}
              </span>
              {session.practice_logs.length > 0 ? (
                <span className="ml-2 text-xs text-zinc-400">
                  {session.practice_logs.map((log) => log.menu_name).join("、")}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <h3 className="mt-8 text-sm font-bold text-white">紐づく野球ノート</h3>
      {notesLoadFailed ? (
        <p className="mt-2 text-xs text-zinc-400">{LINKED_NOTES_LOAD_ERROR}</p>
      ) : notes.length === 0 ? (
        <p className="mt-2 text-xs text-zinc-500">まだありません</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2">
          {notes.map((note) => (
            <li key={note.id}>
              <Link
                href={`/note/${note.id}`}
                className="block rounded-lg bg-sub px-3 py-3 text-sm text-white transition-colors hover:bg-zinc-700"
              >
                <span className="font-bold">{formatJaFullDate(note.date)}</span>
                <span className="ml-2 text-xs text-zinc-400">
                  {note.title || "無題のノート"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 flex flex-col gap-3">
        <Button
          as={Link}
          href={`/note/new?improvement_theme_id=${theme.id}`}
          color="primary"
          fullWidth
          radius="sm"
          className="font-bold"
        >
          この課題でノートを書く
        </Button>
        {transitions.canAchieve ? (
          <Button
            fullWidth
            radius="sm"
            variant="bordered"
            className="border-[#d08000] font-bold text-[#d08000]"
            isDisabled={isSaving}
            onPress={() => handleTransition("achieved")}
          >
            克服した（達成）
          </Button>
        ) : null}
        {transitions.canReopen ? (
          <Button
            fullWidth
            radius="sm"
            variant="flat"
            isDisabled={isSaving}
            onPress={() => handleTransition("open")}
          >
            取組中に戻す
          </Button>
        ) : null}
        {transitions.canArchive ? (
          <Button
            fullWidth
            radius="sm"
            variant="flat"
            isDisabled={isSaving}
            onPress={() => handleTransition("archived")}
          >
            アーカイブ
          </Button>
        ) : null}
      </div>

      {formToken === null ? null : (
        <ThemeFormModal
          key={formToken}
          theme={theme}
          isSaving={isSaving}
          serverErrors={formErrors}
          onClose={() => setFormToken(null)}
          onSubmit={handleEditSubmit}
        />
      )}

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setDeleteOpen(false)}
        placement="center"
        className="buzz-dark"
      >
        <ModalContent>
          <ModalHeader className="text-white">課題の削除</ModalHeader>
          <ModalBody>
            <p className="text-sm text-white">
              「{theme.title}」を削除しますか？
            </p>
            <p className="text-xs text-zinc-400">{DELETE_CONFIRM_NOTICE}</p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => setDeleteOpen(false)}
              isDisabled={isDeleting}
            >
              キャンセル
            </Button>
            <Button
              color="danger"
              onPress={handleDelete}
              isDisabled={isDeleting}
              isLoading={isDeleting}
            >
              削除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-sub py-4 text-center">
      <dd className="text-xl font-bold text-[#d08000]">{value}</dd>
      <dt className="mt-1 text-xs text-zinc-400">{label}</dt>
    </div>
  );
}
