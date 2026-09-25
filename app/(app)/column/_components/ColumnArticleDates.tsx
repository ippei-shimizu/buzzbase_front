type Props = {
  /** 公開日（YYYY-MM-DD） */
  publishedAt: string;
  /** 最終更新日（YYYY-MM-DD） */
  updatedAt: string;
};

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function formatDate(isoDate: string) {
  // 日付は記事ごとの meta.ts に手書きで散るため、形式ずれは静的ビルドで落とす
  if (!ISO_DATE_PATTERN.test(isoDate)) {
    throw new Error(
      `公開日・更新日は YYYY-MM-DD で指定してください: ${isoDate}`,
    );
  }

  const [year, month, day] = isoDate.split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
}

/**
 * コラム記事の公開日・更新日。JSON-LD の datePublished / dateModified と同じ値を表示する。
 */
export default function ColumnArticleDates({ publishedAt, updatedAt }: Props) {
  return (
    <p className="text-xs text-zinc-500 mt-2">
      <time dateTime={publishedAt}>公開日 {formatDate(publishedAt)}</time>
      <span className="mx-1.5">/</span>
      <time dateTime={updatedAt}>更新日 {formatDate(updatedAt)}</time>
    </p>
  );
}
