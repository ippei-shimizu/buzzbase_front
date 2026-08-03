"use client";

import type { ImprovementTheme } from "@app/types/improvementTheme";
import type {
  PracticeMenu,
  PracticeSession,
  PresetMenu,
} from "@app/types/practice";
import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
import { Button } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useProUpgradeModal } from "@app/contexts/proUpgradeModalContext";
import { upsertPracticeSession } from "@app/services/v2/practiceSessionService";
import {
  buildInitialAmounts,
  buildInitialWeights,
  buildItems,
  toInputValue,
} from "../_utils/practiceRecordDraft";
import ImprovementThemeField from "./ImprovementThemeField";
import PracticeMenuChecklist from "./PracticeMenuChecklist";
import {
  ADD_MENU_LABEL,
  MENU_SECTION_TITLE,
  NO_ITEMS_ERROR,
  SAVE_ONLY_LABEL,
  SAVE_SUCCESS_MESSAGE,
  SAVE_UPDATE_LABEL,
  SAVE_WITH_NOTE_LABEL,
  THEME_SECTION_TITLE,
} from "./practiceRecordCopy";

interface PracticeSessionFormProps {
  /** 記録する日（YYYY-MM-DD）。 */
  date: string;
  menus: PracticeMenu[];
  /** その日の既存セッション。まだ記録が無い日は null。 */
  session: PracticeSession | null;
  presetMenus: PresetMenu[];
  themes: ImprovementTheme[];
  onSaved: (session: PracticeSession) => void;
}

/**
 * 野球ノート作成画面へ引き継ぐクエリ。パラメータ名・形式は mobile と揃える。
 * 課題は未選択なら送らない（ノート側で「指定なし」と区別できるようにする）。
 */
function buildNoteQuery(
  date: string,
  practiceSessionId: number,
  improvementThemeIds: number[],
): string {
  const query = new URLSearchParams();
  query.set("date", date);
  query.set("practiceSessionId", String(practiceSessionId));
  if (improvementThemeIds.length > 0) {
    query.set("improvementThemeIds", improvementThemeIds.join(","));
  }
  return query.toString();
}

/**
 * 練習記録の入力フォーム。
 * 日付ごとに状態を作り直すため、呼び出し側は日付を key にしてマウントし直す。
 */
export default function PracticeSessionForm({
  date,
  menus,
  session,
  presetMenus,
  themes,
  onSaved,
}: PracticeSessionFormProps) {
  const router = useRouter();
  const { open: openProUpgradeModal } = useProUpgradeModal();
  const [amounts, setAmounts] = useState<Record<number, string>>(() =>
    buildInitialAmounts(session, presetMenus),
  );
  const [weights, setWeights] = useState<Record<number, string>>(() =>
    buildInitialWeights(session, presetMenus, menus),
  );
  const [themeIds, setThemeIds] = useState<number[]>(
    () => session?.improvement_theme_ids ?? [],
  );
  const [linkedThemeCountAtLoad] = useState(
    () => session?.improvement_theme_ids.length ?? 0,
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleMenu = (menu: PracticeMenu) => {
    const isSelected = menu.id in amounts;
    setAmounts((prev) => {
      const next = { ...prev };
      // 選択時はメニューの初期値を入れて、よく使う量をそのまま保存できるようにする。
      if (isSelected) delete next[menu.id];
      else next[menu.id] = toInputValue(menu.default_value);
      return next;
    });
    setWeights((prev) => {
      const next = { ...prev };
      if (isSelected) delete next[menu.id];
      else if (menu.unit === "weight_reps") next[menu.id] = "";
      return next;
    });
  };

  const handleAmountChange = (menuId: number, value: string) =>
    setAmounts((prev) => ({ ...prev, [menuId]: value }));

  const handleWeightChange = (menuId: number, value: string) =>
    setWeights((prev) => ({ ...prev, [menuId]: value }));

  const handleSave = async (withNote: boolean) => {
    if (isSaving) return;
    // 触っていない項目も含めて選択中の全メニューを送る。
    // back は送らなかったメニューのログを削除するため、間引くと既存の記録が消える。
    const items = buildItems(amounts, weights);
    if (items.length === 0) {
      setErrors([NO_ITEMS_ERROR]);
      return;
    }

    setIsSaving(true);
    setErrors([]);
    const result = await upsertPracticeSession({
      logged_on: date,
      items,
      improvement_theme_ids: themeIds,
    });

    if (!result.ok) {
      setIsSaving(false);
      // 403 は保存全体がロールバックされるため、成功表示も画面遷移もしない。
      // 課題を複数送ったときだけ紐付け上限として Pro 訴求へ倒し、それ以外は back の文言をそのまま出す。
      if (result.reason === "forbidden" && themeIds.length > 1) {
        openProUpgradeModal({ trigger: "multi_improvement_theme_links" });
      }
      setErrors(result.errors);
      return;
    }

    toast.success(SAVE_SUCCESS_MESSAGE);
    onSaved(result.data);
    if (withNote) {
      // 遷移が完了するまで isSaving のままにして二重送信を防ぐ。
      router.push(
        `/note/new?${buildNoteQuery(date, result.data.id, themeIds)}`,
      );
      return;
    }
    setIsSaving(false);
  };

  return (
    <div>
      <div className="mt-8 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-white">{MENU_SECTION_TITLE}</h2>
        <Link
          href="/practice/menus"
          className="flex shrink-0 items-center gap-1 rounded-[10px] border border-[#d08000] px-3 py-1.5 text-xs font-bold text-[#d08000]"
        >
          <PlusIcon className="h-4 w-4" aria-hidden />
          {ADD_MENU_LABEL}
        </Link>
      </div>
      <div className="mt-3">
        <PracticeMenuChecklist
          menus={menus}
          amounts={amounts}
          weights={weights}
          onToggle={handleToggleMenu}
          onAmountChange={handleAmountChange}
          onWeightChange={handleWeightChange}
        />
      </div>

      <h2 className="mt-8 text-sm font-bold text-white">
        {THEME_SECTION_TITLE}
      </h2>
      <div className="mt-3">
        <ImprovementThemeField
          themes={themes}
          selectedThemeIds={themeIds}
          linkedThemeCountAtLoad={linkedThemeCountAtLoad}
          onChange={setThemeIds}
        />
      </div>

      {errors.length > 0 ? (
        <ul role="alert" className="mt-6 space-y-1">
          {errors.map((message) => (
            <li key={message} className="text-sm text-danger">
              {message}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-8 space-y-2.5">
        <Button
          color="primary"
          fullWidth
          radius="sm"
          className="font-bold"
          isDisabled={isSaving}
          onPress={() => handleSave(true)}
        >
          {SAVE_WITH_NOTE_LABEL}
        </Button>
        <Button
          fullWidth
          radius="sm"
          className="bg-sub font-bold text-white"
          isDisabled={isSaving}
          onPress={() => handleSave(false)}
        >
          {session ? SAVE_UPDATE_LABEL : SAVE_ONLY_LABEL}
        </Button>
      </div>
    </div>
  );
}
