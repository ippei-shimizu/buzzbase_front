import { type Metadata } from "next";
import Link from "next/link";
import Header from "@app/components/header/Header";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記",
  description:
    "「BUZZ BASE」の有料プラン（Proプラン）に関する特定商取引法に基づく表記です。",
};

const ITEMS: { term: string; description: React.ReactNode }[] = [
  { term: "販売事業者", description: "清水一平" },
  { term: "運営統括責任者", description: "清水一平" },
  {
    term: "所在地",
    description: "ご請求をいただいた場合、遅滞なく開示いたします。",
  },
  {
    term: "電話番号",
    description: "ご請求をいただいた場合、遅滞なく開示いたします。",
  },
  {
    term: "メールアドレス",
    description: (
      <Link
        href="mailto:buzzbase.app@gmail.com"
        className="text-blue-400 underline"
      >
        buzzbase.app@gmail.com
      </Link>
    ),
  },
  {
    term: "販売価格",
    description: (
      <>
        月額プラン ¥980（税込）／月、年額プラン
        ¥9,800（税込）／年（月あたり¥817相当）。7日間の無料トライアルがあります。詳細は
        <Link href="/pro" className="text-blue-400 underline">
          Proプランのご案内
        </Link>
        ページをご確認ください。
      </>
    ),
  },
  {
    term: "商品代金以外の必要料金",
    description: "本サービスのご利用にかかる通信費はお客様のご負担となります。",
  },
  {
    term: "支払方法",
    description:
      "クレジットカード決済（Stripe、Web版）、Apple ID決済（iOSアプリ内課金、RevenueCat経由）。",
  },
  {
    term: "支払時期",
    description:
      "クレジットカード決済は申込手続完了時に即時課金されます。Apple ID決済はApple社の定める時期に準じます。",
  },
  {
    term: "引渡時期",
    description: "申込手続完了後、直ちにご利用いただけます。",
  },
  {
    term: "返品・キャンセル・返金",
    description: (
      <>
        商品の性質上、原則として返金には応じられません。ただし無料トライアル期間中に解約手続を行った場合は課金が発生しないため、料金は一切かかりません。Apple
        ID（App
        Store）決済分の返金については、Appleの定める規約及び手続に従うものとし、当社は返金可否を判断する権限を有しません。
      </>
    ),
  },
  {
    term: "解約方法",
    description:
      "Web版は「設定」のサブスクリプション画面からいつでも解約できます。iOS版はApple ID（App Store）のサブスクリプション設定画面から解約してください（当社側で直接操作することはできません）。",
  },
];

export default function Tokushoho() {
  return (
    <>
      <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
        <div className="h-full bg-main">
          <Header />
          <main className="h-full pb-16 w-full  max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
            <div className="px-4 pt-24 lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:px-6 lg:pb-6">
              <h2 className="text-2xl font-bold">特定商取引法に基づく表記</h2>
              <p className="text-sm mt-6">
                「BUZZ
                BASE」の有料プラン（Proプラン）は、特定商取引法第11条（通信販売についての広告）に基づき、以下のとおり表示します。
              </p>
              <dl className="mt-8 divide-y divide-zinc-600">
                {ITEMS.map((item) => (
                  <div key={item.term} className="py-4">
                    <dt className="text-sm font-bold">{item.term}</dt>
                    <dd className="text-sm mt-2">{item.description}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-sm mt-4 text-right">以上</p>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
