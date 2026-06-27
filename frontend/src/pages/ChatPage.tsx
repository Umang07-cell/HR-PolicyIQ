import { useNavigate } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { useChat } from "../hooks/useChat";
import { useChatStore } from "../store/chatStore";
import { CitationCard } from "../components/chat/CitationCard";

const SUGGESTIONS = [
  { q: "How many casual leaves am I entitled to?", icon: "📅" },
  { q: "What is the grievance redressal process?", icon: "🚨" },
  { q: "How is my HRA calculated?", icon: "💰" },
  { q: "What is the work from home policy?", icon: "🏠" },
  { q: "Explain the performance appraisal process", icon: "⭐" },
  { q: "What documents are needed for reimbursement?", icon: "📄" },
];

const TypingIndicator = () => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </div>
    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-card">
      <div className="flex gap-1.5 items-center h-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
        <span className="text-xs text-slate-400 ml-1">HR Assistant is thinking...</span>
      </div>
    </div>
  </div>
);

const Message = ({ msg }: { msg: any }) => {
  const isUser = msg.role === "user";
  const [showCitations, setShowCitations] = useState(false);

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${isUser ? "bg-slate-600" : "bg-blue-600"}`}>
        {isUser ? "You" : "AI"}
      </div>

      <div className={`max-w-2xl ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-card ${isUser ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"}`}>
          <p className="whitespace-pre-wrap">{msg.content}</p>
        </div>

        {/* Confidence + citations toggle */}
        {!isUser && msg.citations && msg.citations.length > 0 && (
          <div className="flex items-center gap-2 px-1">
            {msg.confidence !== undefined && (
              <span className={`text-xs font-medium ${msg.confidence > 0.7 ? "text-emerald-600" : msg.confidence > 0.4 ? "text-amber-600" : "text-red-500"}`}>
                {(msg.confidence * 100).toFixed(0)}% confidence
              </span>
            )}
            <button
              onClick={() => setShowCitations((v) => !v)}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {showCitations ? "Hide" : "View"} {msg.citations.length} source{msg.citations.length !== 1 ? "s" : ""}
            </button>
          </div>
        )}

        {showCitations && msg.citations && (
          <div className="space-y-2 mt-1 w-full">
            {msg.citations.map((c: any, i: number) => <CitationCard key={i} citation={c} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default function ChatPage() {
  const navigate = useNavigate();
  const { send } = useChat();
  const { messages, isLoading, clear } = useChatStore();
  const [input, setInput] = useState("");
  const [module, setModule] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    send(input.trim(), module || undefined);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { clear(); navigate("/"); }} 
            className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Switch Role
          </button>
          <div className="h-6 w-px bg-slate-200"></div>
          <div>
            <h1 className="font-semibold text-slate-900 text-sm">HR Assistant</h1>
            <p className="text-xs text-slate-400">Answers sourced from your HR documents · ABAC filtered</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={module}
            onChange={(e) => setModule(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All modules</option>
            {["policy", "leave", "payroll", "recruitment", "performance", "grievance"].map((m) => (
              <option key={m} value={m} className="capitalize">{m.charAt(0).toUpperCase() + m.slice(1)}</option>
            ))}
          </select>
          {messages.length > 0 && (
            <button onClick={clear} className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
        {messages.length === 0 && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8 mt-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/25">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-900">Ask your HR question</h2>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">Get instant, source-cited answers from your company's HR policies. Your query is filtered to your role and location.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.q}
                  onClick={() => { send(s.q, module || undefined); }}
                  className="text-left px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all group"
                >
                  <span className="mr-2">{s.icon}</span>
                  {s.q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => <Message key={i} msg={m} />)}
        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 bg-white px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask an HR question..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
            aria-label="Send message"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-slate-400 text-center mt-1.5">Answers are ABAC-filtered to your role · PII redacted</p>
      </div>
    </div>
  );
}
