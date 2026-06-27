import { useState } from "react";
import { ChatMessage as ChatMessageType } from "../../types/models";
import { CitationCard } from "./CitationCard";

const renderAnswerWithCitations = (content: string, citations: ChatMessageType["citations"]) => {
  const parts = content.split(/(\[SOURCE \d+\])/g);
  return parts.map((part, i) => {
    const match = part.match(/\[SOURCE (\d+)\]/);
    if (match) {
      const sourceNum = parseInt(match[1], 10);
      const citation = citations?.[sourceNum - 1];
      return (
        <span
          key={i}
          className="inline-flex items-center gap-0.5 text-blue-600 font-medium text-xs bg-blue-50 rounded px-1 py-0.5 mx-0.5 cursor-default"
          title={citation ? `${citation.document_title}${citation.page ? `, p.${citation.page}` : ""}` : `Source ${sourceNum}`}
        >
          [{sourceNum}]
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

export const ChatMessageComponent = ({ msg }: { msg: ChatMessageType }) => {
  const isUser = msg.role === "user";
  const [showCitations, setShowCitations] = useState(false);
  const hasCitations = !isUser && msg.citations && msg.citations.length > 0;

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${isUser ? "bg-slate-600" : "bg-blue-600"}`}>
        {isUser ? "You" : "AI"}
      </div>
      <div className={`max-w-2xl flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-card ${isUser ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"}`}>
          {isUser
            ? <p className="whitespace-pre-wrap">{msg.content}</p>
            : <p className="whitespace-pre-wrap">{renderAnswerWithCitations(msg.content, msg.citations)}</p>
          }
        </div>
        {hasCitations && (
          <div className="flex items-center gap-3 px-1">
            {msg.confidence !== undefined && (
              <span className={`text-xs font-medium ${msg.confidence > 0.75 ? "text-emerald-600" : msg.confidence > 0.45 ? "text-amber-600" : "text-red-500"}`}>
                {(msg.confidence * 100).toFixed(0)}% confidence
              </span>
            )}
            <button
              onClick={() => setShowCitations((v) => !v)}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              {showCitations ? "Hide" : "Show"} {msg.citations!.length} source{msg.citations!.length !== 1 ? "s" : ""}
            </button>
          </div>
        )}
        {showCitations && msg.citations?.map((c, i) => <CitationCard key={i} citation={c} />)}
      </div>
    </div>
  );
};