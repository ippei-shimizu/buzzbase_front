import { Metadata } from "next";
import Link from "next/link";
import Header from "@app/components/header/Header";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "「BUZZ BASE」のプライバシーポリシーになります。",
};

export default function PrivacyPolicy() {
  return (
    <>
      <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
        <div className="h-full bg-main">
          <Header />
          <main className="h-full pb-16 w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
            <div className="px-4 pt-24 lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:px-6 lg:pb-6">
              <h2 className="text-2xl font-bold">プライバシーポリシー</h2>
              <p className="text-xs text-zinc-400 mt-2">
                最終更新日: 2026年3月15日
              </p>
              <h3 className="text-xl font-bold mt-8">はじめに</h3>
              <p className="text-sm mt-4">
                BUZZ
                BASE（以下、「当サービス」とします）は、当サービスが運営するWebサービスおよびアプリケーション（以下、「本サービス」とします）において、お客様のプライバシーを尊重し、お客様から提供される個人情報の保護に努めています。本プライバシーポリシーは、本サービスを利用される際に、当サービスがどのような情報を収集し、その情報をどのように扱うかについて説明しています。
              </p>
              <h3 className="text-xl font-bold mt-8">収集する情報</h3>
              <p className="text-sm mt-4">
                当サービスは、本サービスの提供、改善、お客様のサポートのために、以下の情報を収集することがあります。
                <br />
                <br />
                ・氏名（ニックネームも含む）
                <br />
                ・メールアドレス
                <br />
                ・写真
                <br />
                ・Cookieを用いて生成された識別情報
                <br />
                ・OSが生成するID、端末の種類、端末識別子等のお客様が利用するOSや端末に関する情報
                <br />
                ・当サービスウェブサイトの滞在時間、入力履歴等の当サービスウェブサイトにおけるお客様の行動履歴
                <br />
                ・当サービスアプリの起動時間、入力履歴等の当サービスアプリの利用履歴
                <br />
              </p>
              <h3 className="text-xl font-bold mt-8">利用目的</h3>
              <p className="text-sm mt-4">
                収集した情報は、以下の目的で利用されます。
                <br />
                <br />
                ・本サービスの提供と運営
                <br />
                ・お客様からのお問い合わせへの対応
                <br />
                ・本サービスの改善と開発
                <br />
                ・新サービスの案内や更新情報の提供
                <br />
                ・不正アクセスや不正利用の防止
                <br />
                ・広告の配信および広告効果の測定
              </p>
              <h3 className="text-xl font-bold mt-8">広告について</h3>
              <p className="text-sm mt-4">
                本サービスでは、第三者配信の広告サービス「Google
                AdSense」を利用しています。Google
                AdSenseでは、お客様の興味に応じた広告を表示するために、Cookie（クッキー）を使用することがあります。
                <br />
                <br />
                Cookieを使用することで、お客様のコンピュータやデバイスを識別できるようになりますが、お客様個人を特定できるものではありません。
                <br />
                <br />
                お客様はGoogleの広告設定ページ（
                <Link
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  https://adssettings.google.com
                </Link>
                ）から、パーソナライズド広告を無効にすることができます。また、
                <Link
                  href="https://optout.aboutads.info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  aboutads.info
                </Link>
                のページにアクセスすることで、パーソナライズド広告に使われる第三者配信事業者のCookieを無効にすることができます。
                <br />
                <br />
                Googleによるデータの収集・処理については、Googleのポリシーと規約（
                <Link
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  https://policies.google.com/technologies/ads
                </Link>
                ）をご確認ください。
              </p>
              <h3 className="text-xl font-bold mt-8">
                アクセス解析ツールについて
              </h3>
              <p className="text-sm mt-4">
                本サービスでは、Googleによるアクセス解析ツール「Google
                Analytics」を利用しています。Google
                Analyticsはトラフィックデータの収集のためにCookieを使用しています。このトラフィックデータは匿名で収集されており、個人を特定するものではありません。
                <br />
                <br />
                お客様はブラウザの設定でCookieを無効にすることで、これらの情報の収集を拒否することができます。Google
                Analyticsの利用規約については、
                <Link
                  href="https://marketingplatform.google.com/about/analytics/terms/jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  Google Analyticsサービス利用規約
                </Link>
                をご確認ください。
              </p>
              <h3 className="text-xl font-bold mt-8">第三者への提供</h3>
              <p className="text-sm mt-4">
                当サービスは、以下の場合を除き、お客様の個人情報を第三者に提供することはありません。
                <br />
                <br />
                ・お客様の同意がある場合
                <br />
                ・法令に基づく場合
                <br />
                ・人の生命、身体または財産の保護のために必要がある場合であって、お客様の同意を得ることが困難であるとき
                <br />
                ・本サービスの運営に必要な範囲で業務委託先に提供する場合（広告配信、アクセス解析等）
              </p>
              <h3 className="text-xl font-bold mt-8">個人情報の安全管理</h3>
              <p className="text-sm mt-4">
                当サービスは、お客様の個人情報の漏洩、滅失またはき損の防止のために、適切なセキュリティ対策を実施し、個人情報の安全管理に努めます。
              </p>
              <h3 className="text-xl font-bold mt-8">
                個人情報の開示・訂正・削除
              </h3>
              <p className="text-sm mt-4">
                お客様は、当サービスが保有するご自身の個人情報について、開示・訂正・削除を求めることができます。ご希望の場合は、下記のお問い合わせ先までご連絡ください。ご本人確認のうえ、合理的な期間内に対応いたします。
              </p>
              <h3 className="text-xl font-bold mt-8">お問い合わせ</h3>
              <p className="text-sm mt-4">
                本プライバシーポリシーに関するお問い合わせは、以下のメールアドレスまでお願いいたします。
                <br />
                <br />
                Email:{" "}
                <Link
                  href="mailto:buzzbase.app@gmail.com"
                  className="text-blue-400 underline"
                >
                  buzzbase.app@gmail.com
                </Link>
              </p>
              <h3 className="text-xl font-bold mt-8">改訂</h3>
              <p className="text-sm mt-4">
                本プライバシーポリシーは、法令の変更や本サービスの変更に応じて、必要に応じて改訂されることがあります。改訂された場合は、本ページ上で更新日を変更してお知らせします。
              </p>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
