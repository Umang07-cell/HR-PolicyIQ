import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders an assistant answer as Markdown (bullets, bold, small tables) styled to match the
 * chat bubble. Used instead of plain text so the HR bot's structured answers read cleanly.
 * Streaming-safe: react-markdown re-renders gracefully on partial/incomplete markdown.
 */
export const MarkdownMessage = ({ content }: { content: string }) => (
  <div className="text-sm leading-relaxed text-slate-800 space-y-2 break-words">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        h1: ({ children }) => <h3 className="text-base font-semibold text-slate-900 mt-1">{children}</h3>,
        h2: ({ children }) => <h3 className="text-base font-semibold text-slate-900 mt-1">{children}</h3>,
        h3: ({ children }) => <h4 className="text-sm font-semibold text-slate-900 mt-1">{children}</h4>,
        a: ({ children, href }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {children}
          </a>
        ),
        code: ({ children }) => (
          <code className="bg-slate-100 text-slate-800 rounded px-1 py-0.5 text-xs font-mono">{children}</code>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-slate-300 pl-3 text-slate-600 italic">{children}</blockquote>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-1">
            <table className="w-full text-xs border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
        th: ({ children }) => (
          <th className="border border-slate-200 px-2 py-1 text-left font-semibold text-slate-700">{children}</th>
        ),
        td: ({ children }) => <td className="border border-slate-200 px-2 py-1 align-top">{children}</td>,
        hr: () => <hr className="border-slate-200 my-2" />,
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);
