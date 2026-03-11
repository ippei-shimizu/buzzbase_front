import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface NoticeDetailContentProps {
  title: string;
  body: string;
  publishedAt: string;
}

export default function NoticeDetailContent({
  title,
  body,
  publishedAt,
}: NoticeDetailContentProps) {
  return (
    <div>
      <p className="text-xs text-zinc-400 lg:text-base lg:mb-1">
        {publishedAt}
      </p>
      <h2 className="text-lg font-bold lg:text-xl">{title}</h2>
      <div className="my-4 lg:my-6 border-t border-zinc-500" />
      <div className="prose prose-invert prose-sm lg:prose-base max-w-none prose-headings:text-zinc-200 prose-p:text-zinc-400 prose-a:text-yellow-500 prose-strong:text-zinc-200 prose-li:text-zinc-400">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
      </div>
    </div>
  );
}
