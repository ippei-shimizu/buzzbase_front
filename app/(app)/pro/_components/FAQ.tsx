"use client";

import { Accordion, AccordionItem } from "@heroui/react";

const ITEMS = [
  {
    q: "Web 版とアプリ版のどちらでも使えますか？",
    a: "Pro は Web 版とアプリ版で共通の 1 つの契約です。ただし機能の提供状況は媒体によって異なり、Web 版で現在ご利用いただけるのは方向別・カウント別・球種別・対戦投手別の打率と、シーズンを跨いだ成績推移グラフです。練習記録・目標・自主練スケジュール・野球ノートの拡張・素振りカウンター・週次/月次レポートなどはアプリ版からご利用ください。比較表で「アプリ版」と付いている機能がこれにあたります。",
  },
  {
    q: "無料プランのままだと何ができますか？",
    a: "試合結果と打撃成績の記録、打率・防御率などの基本成績、グループ内ランキング、計算ツール、野球ノート、練習記録、素振りカウンター、自主練スケジュール（作成数の上限なし）は無料でお使いいただけます。個人の期間目標は 2 件まで、練習メニューは 3 件まで、動画・画像のアップロードは月 3 件まで、グループへの所属は 1 件までなど、一部の機能に上限があります。",
  },
  {
    q: "無料トライアル期間中に解約すれば料金はかかりませんか？",
    a: "はい。7 日間の無料トライアル期間中に解約手続きを完了すれば一切料金は発生しません。トライアル終了の前日までに「設定」から解約できます。",
  },
  {
    q: "解約はいつでもできますか？",
    a: "いつでも解約できます。解約手続き後も次回課金日までは Pro 機能を利用できます。",
  },
  {
    q: "月額プランから年額プランに変更できますか？",
    a: "はい、「設定」のサブスクリプション画面からいつでも変更できます。変更後は次回課金から新しいプラン料金が適用されます。",
  },
  {
    q: "支払い方法は何が使えますか？",
    a: "クレジットカード（Visa / MasterCard / JCB / American Express）が利用できます。iOS アプリ内で加入した場合は App Store の決済方法が適用されます。",
  },
  {
    q: "解約したら Pro 期間に記録したデータはどうなりますか？",
    a: "記録したデータそのものが削除されることはありません。解約後は Pro 限定機能（方向別・カウント別・球種別・対戦投手別の打率、シーズン跨ぎ成績推移グラフなど）の表示が制限され、件数に上限のある機能は無料プランの上限を超えた分の新規作成ができなくなります。再加入時に再び閲覧できるようになります。",
  },
  {
    q: "学生でも加入できますか？",
    a: "はい、年齢に関わらずどなたでもご加入いただけます。保護者の同意のうえお申し込みください。",
  },
] as const;

export default function FAQ() {
  return (
    <section className="bg-[#2E2E2E] px-6 py-16 md:py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-10 text-center text-2xl font-bold text-white md:text-3xl">
          よくある質問
        </h2>
        {/* 公開 LP なので、回答も畳んだまま HTML に含めてクローラに読ませる。 */}
        <Accordion variant="splitted" className="px-0" keepContentMounted>
          {ITEMS.map((item, index) => (
            <AccordionItem
              key={item.q}
              aria-label={item.q}
              title={
                <span className="text-sm font-semibold text-white">
                  {item.q}
                </span>
              }
              className="bg-[#424242]"
              data-testid={`faq-item-${index}`}
            >
              <p className="text-sm leading-relaxed text-gray-200">{item.a}</p>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
