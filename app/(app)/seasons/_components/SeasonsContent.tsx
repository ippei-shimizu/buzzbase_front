import type { SeasonData } from "@app/interface";
import SeasonsList from "./SeasonsList";

type SeasonsContentProps = {
  initialSeasons: SeasonData[];
};

export default function SeasonsContent({
  initialSeasons,
}: SeasonsContentProps) {
  return (
    <>
      <h2 className="text-2xl font-bold">シーズン管理</h2>
      <section className="mt-4 rounded-xl bg-bg_sub p-4">
        <h3 className="text-base font-bold">シーズン管理とは</h3>
        <p className="mt-1.5 text-sm text-zinc-300">
          試合記録を期間（シーズン）ごとにまとめる機能です。学年・年度・大会単位でシーズンを分けておくと、成績をその期間ごとに集計・比較でき、成長の振り返りに役立ちます。
        </p>
        <h4 className="mt-3 text-sm font-bold">活用例</h4>
        <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-zinc-300">
          <li>「2024年春季」「2024年秋季」など期間で分ける</li>
          <li>「〇〇高校」「〇〇大学」などチーム移籍時に分ける</li>
          <li>「新チーム」「旧チーム」で世代ごとに分ける</li>
        </ul>
        <h4 className="mt-3 text-sm font-bold">使い方</h4>
        <p className="mt-1.5 text-sm text-zinc-300">
          試合結果の登録時にシーズンを選択すると、成績や試合一覧をシーズンごとに絞り込めます。
        </p>
      </section>
      <div className="my-6">
        <SeasonsList initialSeasons={initialSeasons} />
      </div>
    </>
  );
}
