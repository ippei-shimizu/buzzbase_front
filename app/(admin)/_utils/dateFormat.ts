/**
 * 日付文字列を曜日付きでフォーマットする
 * @param dateString - 日付文字列 (MM/DD または YYYY-MM-DD 形式)
 * @returns フォーマットされた日付文字列 (MM/DD(曜) 形式)
 */
export const formatDateWithWeekday = (dateString: string): string => {
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  // MM/DD形式の場合
  if (dateString.match(/^\d{2}\/\d{2}$/)) {
    const [month, day] = dateString.split("/");
    // 現在の年を使用
    const currentYear = new Date().getFullYear();
    const date = new Date(currentYear, Number(month) - 1, Number(day));
    const weekday = weekdays[date.getDay()];
    return `${month}/${day}(${weekday})`;
  }

  // YYYY-MM-DD形式の場合
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    const weekday = weekdays[date.getDay()];
    return `${month}/${day}(${weekday})`;
  }

  return dateString;
};
