import type { ReflectionTemplate } from "@app/interface/reflectionTemplate";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import { CUSTOM_EMPTY_MESSAGE } from "./reflectionTemplateCopy";

interface ReflectionTemplateListProps {
  templates: ReflectionTemplate[];
  onEdit: (template: ReflectionTemplate) => void;
  onDelete: (template: ReflectionTemplate) => void;
}

interface TemplateRowProps {
  template: ReflectionTemplate;
  onEdit: (template: ReflectionTemplate) => void;
  /** プリセットは back が削除を許さないため、自作テンプレでのみ渡す。 */
  onDelete?: (template: ReflectionTemplate) => void;
}

function TemplateRow({ template, onEdit, onDelete }: TemplateRowProps) {
  return (
    <li className="flex items-center gap-3 rounded-[10px] bg-sub px-3.5 py-3">
      <button
        type="button"
        onClick={() => onEdit(template)}
        aria-label={`${template.title}を編集`}
        className="flex-1 text-left"
      >
        <span className="block text-sm font-bold text-white">
          {template.title}
        </span>
        <span className="mt-0.5 block text-xs text-zinc-400">
          {template.questions.join(" ・ ")}
        </span>
      </button>
      {onDelete ? (
        <button
          type="button"
          onClick={() => onDelete(template)}
          aria-label={`${template.title}を削除`}
          className="shrink-0 rounded-full p-1 text-zinc-400 transition-colors hover:text-danger"
        >
          <TrashIcon className="h-5 w-5" aria-hidden />
        </button>
      ) : null}
    </li>
  );
}

/**
 * 振り返りテンプレをプリセットと自作に分けて並べる表示コンポーネント。
 * プリセットは back が削除を許さない（自分のレコードではない）ため削除導線を出さない。
 * 編集は可能で、その場合は自分専用のコピーが作られる。
 */
export default function ReflectionTemplateList({
  templates,
  onEdit,
  onDelete,
}: ReflectionTemplateListProps) {
  const presets = templates.filter((template) => template.is_preset);
  const customs = templates.filter((template) => !template.is_preset);

  return (
    <div className="space-y-6">
      <section aria-labelledby="reflection-template-preset">
        <h3
          id="reflection-template-preset"
          className="text-sm font-bold text-zinc-400"
        >
          プリセット
        </h3>
        {presets.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-400">
            利用できるプリセットはありません
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {presets.map((template) => (
              <TemplateRow
                key={template.id}
                template={template}
                onEdit={onEdit}
              />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="reflection-template-custom">
        <h3
          id="reflection-template-custom"
          className="text-sm font-bold text-zinc-400"
        >
          自作テンプレ
        </h3>
        {customs.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-400">{CUSTOM_EMPTY_MESSAGE}</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {customs.map((template) => (
              <TemplateRow
                key={template.id}
                template={template}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
