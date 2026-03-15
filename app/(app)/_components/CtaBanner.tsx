import Link from "next/link";

type Props = {
  heading?: string;
  body: string;
  buttonText?: string;
  className?: string;
};

export default function CtaBanner({
  heading,
  body,
  buttonText = "BUZZ BASEで無料で使ってみる",
  className = "mt-10",
}: Props) {
  return (
    <section
      className={`${className} rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6`}
    >
      {heading ? <h2 className="text-lg font-bold mb-2">{heading}</h2> : null}
      <p className="text-sm text-zinc-300 leading-6 mb-4">{body}</p>
      <Link
        href="/signup"
        className="inline-block rounded-lg bg-yellow-600 hover:bg-yellow-500 transition-colors px-6 py-2.5 text-sm font-bold text-white"
      >
        {buttonText}
      </Link>
    </section>
  );
}
