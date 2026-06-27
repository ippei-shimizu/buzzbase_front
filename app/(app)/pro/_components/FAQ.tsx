"use client";

import { Accordion, AccordionItem } from "@heroui/react";

const ITEMS = [
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
    a: "解約後は Pro 限定機能（無制限のメディア保管・シーズン跨ぎグラフなど）の表示が制限されます。再加入時に再び閲覧できるようになります。",
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
        <Accordion variant="splitted" className="px-0">
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
