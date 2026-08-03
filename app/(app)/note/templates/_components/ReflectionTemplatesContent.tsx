"use client";

import type {
  ReflectionTemplate,
  ReflectionTemplateInput,
} from "@app/interface/reflectionTemplate";
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
import { ProUpsellCard } from "@app/components/pro/ProUpsellCard";
import { REFLECTION_TEMPLATE_FREE_LIMIT } from "@app/constants/reflectionTemplate";
import { useProUpgradeModal } from "@app/contexts/proUpgradeModalContext";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import {
  createReflectionTemplate,
  deleteReflectionTemplate,
  updateReflectionTemplate,
} from "@app/services/v2/reflectionTemplateService";
import {
  DELETE_NOTICE,
  FREE_LIMIT_DESCRIPTION,
  FREE_LIMIT_SERVER_ERROR,
  FREE_LIMIT_TITLE,
} from "./reflectionTemplateCopy";
import ReflectionTemplateFormModal from "./ReflectionTemplateFormModal";
import ReflectionTemplateList from "./ReflectionTemplateList";

interface ReflectionTemplatesContentProps {
  initialTemplates: ReflectionTemplate[];
}

/** フォームを開くたびに増やし、key の付け替えで入力状態を初期化するための識別子。 */
interface FormTarget {
  template: ReflectionTemplate | null;
  token: number;
}

const PAYWALL_TRIGGER = "unlimited_reflection_templates";

/**
 * 振り返りテンプレ画面の Container。
 * 一覧の状態保持・Server Action 呼び出し・無料枠の判定を担い、表示は子コンポーネントへ委ねる。
 */
export default function ReflectionTemplatesContent({
  initialTemplates,
}: ReflectionTemplatesContentProps) {
  const [templates, setTemplates] =
    useState<ReflectionTemplate[]>(initialTemplates);
  const [form, setForm] = useState<FormTarget | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ReflectionTemplate | null>(
    null,
  );
  const [deleteErrors, setDeleteErrors] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const { hasEntitlement, isLoading: isEntitlementLoading } = useEntitlement();
  const { open: openProUpgradeModal } = useProUpgradeModal();

  const hasUnlimited = hasEntitlement(PAYWALL_TRIGGER);
  // 無料枠に数えるのは自作だけ（プリセットは何件見えていても上限に関係しない）。
  const customCount = templates.filter(
    (template) => !template.is_preset,
  ).length;
  // 判定が確定するまでは上限扱いにしない。未確定のまま塞ぐと Pro 加入者に上限を誤って告知してしまう。
  const isAtFreeLimit =
    !isEntitlementLoading &&
    !hasUnlimited &&
    customCount >= REFLECTION_TEMPLATE_FREE_LIMIT;

  const openForm = (template: ReflectionTemplate | null) => {
    setFormErrors([]);
    setForm({ template, token: Date.now() + templates.length });
  };

  const handleAdd = () => {
    if (isAtFreeLimit) {
      openProUpgradeModal({ trigger: PAYWALL_TRIGGER });
      return;
    }
    openForm(null);
  };

  // 自作テンプレの編集は旧版アーカイブ＋新版作成で件数が増えないため、上限を超えて
  // 保有しているユーザー（Pro 解約後など）でも常に編集できる。
  // プリセットの編集だけは自作テンプレの新規作成に等しく、back も 403 を返す。
  const handleEdit = (template: ReflectionTemplate) => {
    if (template.is_preset && isAtFreeLimit) {
      openProUpgradeModal({ trigger: PAYWALL_TRIGGER });
      return;
    }
    openForm(template);
  };

  const handleSubmit = async (input: ReflectionTemplateInput) => {
    const editing = form?.template ?? null;
    setIsSaving(true);
    setFormErrors([]);

    const result = editing
      ? await updateReflectionTemplate(editing.id, input)
      : await createReflectionTemplate(input);
    setIsSaving(false);

    if (result.ok) {
      // back の更新は原本を書き換えず新しいバージョンを作るため、返却された
      // テンプレ（id が変わっている）で置き換える。元の id を残すと以降の
      // 編集・削除が既にアーカイブされたレコードを指してしまう。
      setTemplates((prev) =>
        editing
          ? prev.map((item) => (item.id === editing.id ? result.data : item))
          : [...prev, result.data],
      );
      setForm(null);
      toast.success(
        editing
          ? "振り返りテンプレを更新しました"
          : "振り返りテンプレを作成しました",
      );
      return;
    }

    // 403 は Pro 限定機能ではなく無料枠の超過を意味する。
    // 別端末での追加などでクライアント側の件数判定とずれた場合にここへ入る。
    if (result.reason === "forbidden") {
      setFormErrors([FREE_LIMIT_SERVER_ERROR]);
      openProUpgradeModal({ trigger: PAYWALL_TRIGGER });
      return;
    }
    setFormErrors(result.errors);
  };

  const openDeleteConfirm = (template: ReflectionTemplate) => {
    setDeleteErrors([]);
    setDeleteTarget(template);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteErrors([]);
    const result = await deleteReflectionTemplate(deleteTarget.id);
    setIsDeleting(false);

    if (!result.ok) {
      // ノートで使用中のテンプレは back が 422 で理由を返す。黙って閉じずにそれを見せる。
      setDeleteErrors(result.errors);
      return;
    }
    setTemplates((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast.success("振り返りテンプレを削除しました");
  };

  return (
    <>
      <h2 className="text-2xl font-bold">振り返りテンプレ</h2>
      <p className="mt-2 text-sm text-zinc-300">
        野球ノートに使う問いかけのセットです。空欄のメモより「何を書くか」が決まっている方が、振り返りが続きます。
      </p>

      <div className="my-6">
        <ReflectionTemplateList
          templates={templates}
          onEdit={handleEdit}
          onDelete={openDeleteConfirm}
        />
      </div>

      {isAtFreeLimit ? (
        <ProUpsellCard
          feature={PAYWALL_TRIGGER}
          title={FREE_LIMIT_TITLE}
          description={FREE_LIMIT_DESCRIPTION}
          ctaLabel="Pro プランを見る"
          className="mb-4"
        />
      ) : null}

      <Button
        color="primary"
        fullWidth
        radius="sm"
        className="font-bold"
        startContent={<PlusIcon className="h-5 w-5" aria-hidden />}
        isDisabled={isEntitlementLoading}
        onPress={handleAdd}
      >
        テンプレを作る
      </Button>

      {form ? (
        <ReflectionTemplateFormModal
          key={form.token}
          template={form.template}
          isSaving={isSaving}
          serverErrors={formErrors}
          onClose={() => setForm(null)}
          onSubmit={handleSubmit}
        />
      ) : null}

      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        placement="center"
        className="buzz-dark"
      >
        <ModalContent>
          <ModalHeader className="text-white">テンプレの削除</ModalHeader>
          <ModalBody>
            <p className="text-sm text-white">
              「{deleteTarget?.title}」を削除しますか？
            </p>
            <p className="text-xs text-zinc-400">{DELETE_NOTICE}</p>
            {deleteErrors.length > 0 ? (
              <ul role="alert" className="space-y-1 text-sm text-danger">
                {deleteErrors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            ) : null}
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
