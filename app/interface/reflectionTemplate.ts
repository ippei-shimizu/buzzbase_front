// v2 振り返りテンプレ API（/api/v2/reflection_templates）の型。
// キー名は back のシリアライザ（V2::ReflectionTemplateSerializer）に合わせて snake_case のまま扱う。

/**
 * 振り返りテンプレ（問いかけ）。
 * `is_preset` が true のものは運営提供のプリセットで、全ユーザーに共通で見える。
 * プリセットを編集すると back 側でユーザー専用のコピー（`is_preset: false`）が作られ、
 * 元のプリセットは本人の一覧から消える。
 */
export interface ReflectionTemplate {
  id: number;
  title: string;
  questions: string[];
  is_preset: boolean;
  is_default: boolean;
  sort_order: number;
}

/** テンプレの作成・更新パラメータ。 */
export interface ReflectionTemplateInput {
  title: string;
  questions: string[];
}
