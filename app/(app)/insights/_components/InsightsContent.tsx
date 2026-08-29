"use client";

import type { FetchResult } from "@app/services/v2/requests";
import type {
  CorrelationInsight,
  InsightCombinationInput,
} from "@app/types/insight";
import type { PracticeMenu } from "@app/types/practice";
import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { useState } from "react";
import { toast } from "sonner";
import { ProSampleSection } from "@app/(app)/stats/_components/analysis/ProSampleSection";
import { INSIGHT_COMBINATION_LIMIT } from "@app/constants/insight";
import { useProUpgradeModal } from "@app/contexts/proUpgradeModalContext";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import {
  createInsightCombination,
  deleteInsightCombination,
  getCorrelationInsights,
} from "@app/services/v2/correlationInsightService";
import {
  isDuplicateInsightCombination,
  splitInsights,
} from "../_utils/insightDisplay";
import InsightCard from "./InsightCard";
import InsightCombinationFormModal from "./InsightCombinationFormModal";
import {
  CREATE_BUTTON_LABEL,
  CREATE_SUCCESS_MESSAGE,
  CUSTOM_EMPTY_MESSAGE,
  CUSTOM_SECTION_TITLE,
  DELETE_MODAL_TITLE,
  DELETE_NOTICE,
  DELETE_SUCCESS_MESSAGE,
  DUPLICATE_ERROR,
  EMPTY_MESSAGE,
  LIMIT_REACHED_MESSAGE,
  LOAD_ERROR_MESSAGE,
  PAGE_DESCRIPTION,
  PRESET_SECTION_TITLE,
  PRO_ONLY_ERROR,
  REFRESH_FAILED_MESSAGE,
} from "./insightCopy";
import { SAMPLE_INSIGHTS } from "./insightSampleData";

const FEATURE = "correlation_insights" as const;

const LOADING_PLACEHOLDER = (
  <div className="flex flex-col gap-4" aria-busy="true">
    <p className="sr-only">読み込み中</p>
    {[0, 1, 2].map((key) => (
      <div key={key} className="h-28 animate-pulse rounded-[10px] bg-sub" />
    ))}
  </div>
);

interface InsightsContentProps {
  result: FetchResult<CorrelationInsight[]>;
  /** 練習メニュー入力の選択肢。取得に失敗した場合は空配列で渡ってくる。 */
  practiceMenus: PracticeMenu[];
}

/**
 * 「練習と成績のつながり」一覧の Container。
 *
 * back は Pro 未加入に 403 を返すため、次の4通りに出し分ける。
 *   判定未確定  … プレースホルダのみ（Pro とも無料とも決めつけない）
 *   無料        … サンプル + Pro 訴求（実データと誤認させないラベル付き）
 *   取得失敗    … エラー文言（0 件と混同させない）
 *   Pro         … 自作 / おすすめのセクション分け
 */
export default function InsightsContent({
  result,
  practiceMenus,
}: InsightsContentProps) {
  // 作成・削除のたびにページ全体を再描画させず、この一覧だけを更新する。
  const [insights, setInsights] = useState<CorrelationInsight[] | null>(
    result.status === "ok" ? result.data : null,
  );
  const [formToken, setFormToken] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CorrelationInsight | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const { hasEntitlement, isLoading: isEntitlementLoading } = useEntitlement();
  const { open: openProUpgradeModal } = useProUpgradeModal();

  if (isEntitlementLoading) return LOADING_PLACEHOLDER;

  // entitlement が無い場合に加え、サーバーが 403 を返した場合もサンプル表示に倒す
  // （契約状態の判断はサーバーが最終的な正）。
  if (!hasEntitlement(FEATURE) || result.status === "forbidden") {
    return (
      <ProSampleSection feature={FEATURE}>
        <div className="flex flex-col gap-3">
          {SAMPLE_INSIGHTS.map((insight) => (
            <InsightCard key={insight.key} insight={insight} />
          ))}
        </div>
      </ProSampleSection>
    );
  }

  if (insights === null) {
    return (
      <p className="py-8 text-center text-sm text-zinc-400">
        {LOAD_ERROR_MESSAGE}
      </p>
    );
  }

  const { customs, presets } = splitInsights(insights);
  const isAtLimit = customs.length >= INSIGHT_COMBINATION_LIMIT;

  const handleAdd = () => {
    setFormErrors([]);
    setFormToken(Date.now());
  };

  const handleSubmit = async (input: InsightCombinationInput) => {
    if (isDuplicateInsightCombination(customs, input)) {
      setFormErrors([DUPLICATE_ERROR]);
      return;
    }

    setIsSaving(true);
    setFormErrors([]);
    const created = await createInsightCombination(input);

    if (!created.ok) {
      setIsSaving(false);
      // 403 は「機能そのものが Pro 限定」。20件上限や重複は 422 で返るので、ここには来ない。
      if (created.reason === "forbidden") {
        setFormErrors([PRO_ONLY_ERROR]);
        openProUpgradeModal({ trigger: FEATURE });
        return;
      }
      setFormErrors(created.errors);
      return;
    }

    // 作成 API はカードを返さないため、傾向を算出した結果を取り直す。
    const refreshed = await getCorrelationInsights();
    setIsSaving(false);
    setFormToken(null);
    if (refreshed.status === "ok") {
      setInsights(refreshed.data);
      toast.success(CREATE_SUCCESS_MESSAGE);
      return;
    }
    toast.error(REFRESH_FAILED_MESSAGE);
  };

  const handleDelete = async () => {
    if (deleteTarget === null || deleteTarget.id === null) return;
    const targetId = deleteTarget.id;

    setIsDeleting(true);
    const deleted = await deleteInsightCombination(targetId);
    setIsDeleting(false);

    if (!deleted.ok) {
      toast.error(deleted.errors[0]);
      return;
    }
    setInsights((prev) =>
      prev === null ? prev : prev.filter((insight) => insight.id !== targetId),
    );
    setDeleteTarget(null);
    toast.success(DELETE_SUCCESS_MESSAGE);
  };

  return (
    <>
      <p className="text-sm leading-6 text-zinc-300">{PAGE_DESCRIPTION}</p>

      <Button
        color="primary"
        fullWidth
        radius="sm"
        className="my-5 font-bold"
        startContent={<PlusIcon className="h-5 w-5" aria-hidden />}
        isDisabled={isAtLimit}
        onPress={handleAdd}
      >
        {CREATE_BUTTON_LABEL}
      </Button>

      {isAtLimit ? (
        <p className="mb-5 text-xs leading-5 text-zinc-400">
          {LIMIT_REACHED_MESSAGE}
        </p>
      ) : null}

      {insights.length === 0 ? (
        <p className="py-8 text-center text-sm leading-6 text-zinc-400">
          {EMPTY_MESSAGE}
        </p>
      ) : (
        <>
          <section className="mb-6">
            <h3 className="mb-2 text-xs font-bold text-zinc-400">
              {CUSTOM_SECTION_TITLE}
            </h3>
            {customs.length === 0 ? (
              <p className="text-sm leading-6 text-zinc-400">
                {CUSTOM_EMPTY_MESSAGE}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {customs.map((insight) => (
                  <InsightCard
                    key={insight.key}
                    insight={insight}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            )}
          </section>

          {presets.length === 0 ? null : (
            <section className="mb-6">
              <h3 className="mb-2 text-xs font-bold text-zinc-400">
                {PRESET_SECTION_TITLE}
              </h3>
              <div className="flex flex-col gap-3">
                {presets.map((insight) => (
                  <InsightCard key={insight.key} insight={insight} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {formToken === null ? null : (
        <InsightCombinationFormModal
          key={formToken}
          practiceMenus={practiceMenus}
          isSaving={isSaving}
          serverErrors={formErrors}
          onClose={() => setFormToken(null)}
          onSubmit={handleSubmit}
        />
      )}

      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        placement="center"
        className="buzz-dark"
      >
        <ModalContent>
          <ModalHeader className="text-white">{DELETE_MODAL_TITLE}</ModalHeader>
          <ModalBody>
            <p className="text-sm text-white">
              「{deleteTarget?.title}」を削除しますか？
            </p>
            <p className="text-xs text-zinc-400">{DELETE_NOTICE}</p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => setDeleteTarget(null)}
              isDisabled={isDeleting}
            >
              キャンセル
            </Button>
            <Button
              color="danger"
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
