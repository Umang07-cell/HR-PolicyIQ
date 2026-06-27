import { useState } from "react";
import { ChatMessage as ChatMessageType } from "../../types/models";
import { CitationCard } from "./CitationCard";

export const ChatMessageComponent = ({ msg }: { msg: ChatMessageType }) => {
  const isUser = msg.role === "user";
  const [showCitations, setShowCitations] = useState(false);
  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${isUser ? "bg-slate-600" : "bg-blue-600"}`}>
        {isUser ? "U" : "AI"}
      </div>
      <div className={`max-w-2xl flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-card ${isUser ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"}`}>
          <p className="whitespace-pre-wrap">{msg.content}</p>
        </div>
        {!isUser && msg.citations && msg.citations.length > 0 && (
          <button onClick={() => setShowCitations((v) => !v)} className="text-xs text-blue-600 hover:underline px-1">
            {showCitations ? "Hide" : "View"} {msg.citations.length} source{msg.citations.length !== 1 ? "s" : ""}
          </button>
        )}
        {showCitations && msg.citations?.map((c, i) => <CitationCard key={i} citation={c} />)}
      </div>
    </div>
  );
};
