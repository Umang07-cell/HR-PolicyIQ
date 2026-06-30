import { useRef, useEffect, useState } from "react";
import { useChat } from "../hooks/useChat";
import { useChatStore } from "../store/chatStore";
import { CitationCard } from "../components/chat/CitationCard";
import { MarkdownMessage } from "../components/chat/MarkdownMessage";
import { sendChatFeedback } from "../api/chat";
import { useNotificationStore } from "../store/notificationStore";

const SUGGESTIONS = [
  { q: "How many casual leaves am I entitled to?", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { q: "What is the grievance redressal process?", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
  { q: "How is my HRA calculated?", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { q: "What is the work from home policy?", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { q: "Explain the performance appraisal process", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { q: "What documents are needed for reimbursement?", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
];

const MODULES = ["policy"];

const TypingIndicator = ({ label }: { label?: string | null }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm">
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </div>
    <div className="bg-white border border-surface-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-card">
      <div className="flex gap-1.5 items-center h-5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
        <span className="text-xs text-slate-500 ml-1.5 transition-all duration-300">
          {label || "HR Assistant is thinking"}…
        </span>
      </div>
    </div>
  </div>
);

const Message = ({ msg, prevMsg }: { msg: any, prevMsg?: any }) => {
  const isUser = msg.role === "user";
  const [showCitations, setShowCitations] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [suggestion, setSuggestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggestionSubmitted, setIsSuggestionSubmitted] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const { add: notify } = useNotificationStore();

  const handleFeedback = async (type: "up" | "down") => {
    if (!prevMsg) return; 
    
    if (feedback === type) {
      setFeedback(null);
      return;
    }
    
    setFeedback(type);
    if (type === "down") {
      setIsSuggestionSubmitted(false);
      setShowThankYou(false);
    }
    if (type === "up") {
      try {
        await sendChatFeedback(prevMsg.content, true);
        notify("Thanks for your feedback!", "success");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSuggestionSubmit = async () => {
    if (!suggestion.trim() || !prevMsg) return;
    setIsSubmitting(true);
    try {
      await sendChatFeedback(prevMsg.content, false, suggestion);
      setShowThankYou(true);
      setTimeout(() => {
        setShowThankYou(false);
        setIsSuggestionSubmitted(true);
        setSuggestion("");
      }, 2500);
    } catch (err) {
      notify("Failed to submit feedback", "error");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow-sm ${
          isUser
            ? "bg-slate-600"
            : "bg-gradient-to-br from-blue-500 to-blue-700"
        }`}
      >
        {isUser ? "You" : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </div>

      <div className={`max-w-2xl ${isUser ? "items-end" : "items-start"} flex flex-col gap-1.5`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-card ${
            isUser
              ? "bg-blue-600 text-white rounded-tr-sm"
              : "bg-white border border-surface-border text-slate-800 rounded-tl-sm"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <MarkdownMessage content={msg.content} />
          )}
        </div>

        {/* Confidence + citation toggle */}
        {!isUser && msg.citations && msg.citations.length > 0 && (
          <div className="flex items-center gap-3 px-1">
            {msg.confidence !== undefined && (
              <span
                className={`text-xs font-medium ${
                  msg.confidence > 0.7
                    ? "text-emerald-600"
                    : msg.confidence > 0.4
                    ? "text-amber-600"
                    : "text-red-500"
                }`}
              >
                {(msg.confidence * 100).toFixed(0)}% confidence
              </span>
            )}
            
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => handleFeedback("up")}
                className={`p-1.5 rounded-lg transition-colors ${
                  feedback === "up" ? "text-emerald-600 bg-emerald-50" : "text-slate-400 hover:text-emerald-600 hover:bg-slate-50"
                }`}
                title="Good response"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </button>
              <button
                onClick={() => handleFeedback("down")}
                className={`p-1.5 rounded-lg transition-colors ${
                  feedback === "down" ? "text-red-500 bg-red-50" : "text-slate-400 hover:text-red-500 hover:bg-slate-50"
                }`}
                title="Poor response"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                </svg>
              </button>
              <button
                onClick={() => setShowCitations((v) => !v)}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors ml-2"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {showCitations ? "Hide" : "View"} {msg.citations.length} source{msg.citations.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        )}

        {feedback === "down" && !isSuggestionSubmitted && (
          <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-xl w-full animate-fade-in text-sm flex gap-2">
            {showThankYou ? (
              <div className="flex-1 flex items-center justify-center text-emerald-600 font-medium py-1.5 animate-fade-in">
                Thank you for your feedback! We'll definitely work on it.
              </div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="What could be improved?"
                  className="flex-1 bg-white border border-red-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                  value={suggestion}
                  onChange={e => setSuggestion(e.target.value)}
                  disabled={isSubmitting}
                />
                <button 
                  onClick={handleSuggestionSubmit}
                  disabled={!suggestion.trim() || isSubmitting}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
                >
                  Submit
                </button>
              </>
            )}
          </div>
        )}

        {showCitations && msg.citations && (
          <div className="space-y-2 mt-1 w-full animate-fade-in">
            {msg.citations.map((c: any, i: number) => (
              <CitationCard key={i} citation={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function ChatPage() {
  const { send } = useChat();
  const { messages, isLoading, stage, clear } = useChatStore();
  const [input, setInput] = useState("");
  const [module, setModule] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    send(input.trim(), module || undefined);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full bg-surface-secondary">
      {/* Chat header */}
      <div className="px-5 py-3 bg-white border-b border-surface-border flex items-center justify-between flex-shrink-0 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h1 className="font-semibold text-slate-900 text-sm">HR Assistant</h1>
            <p className="text-xs text-slate-400">Answers sourced from your HR documents · ABAC filtered</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Module filter */}
          <div className="relative">
            <select
              value={module}
              onChange={(e) => setModule(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-xs border border-surface-border rounded-lg text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All modules</option>
              {MODULES.map((m) => (
                <option key={m} value={m} className="capitalize">
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </option>
              ))}
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {messages.length > 0 && (
            <button
              onClick={clear}
              className="text-xs text-slate-400 hover:text-slate-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Clear chat
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
        {isEmpty && (
          <div className="max-w-xl mx-auto pt-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-900">Ask your HR question</h2>
              <p className="text-sm text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                Get instant, source-cited answers from your company's HR policies, filtered to your role.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.q}
                  onClick={() => send(s.q, module || undefined)}
                  className="flex items-center gap-3 text-left px-4 py-3 bg-white border border-surface-border rounded-xl text-sm text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 transition-all group shadow-card"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center flex-shrink-0 transition-colors">
                    <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={s.icon} />
                    </svg>
                  </div>
                  <span className="leading-snug">{s.q}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <Message key={i} msg={m} prevMsg={i > 0 ? messages[i-1] : undefined} />
        ))}
        {isLoading && <TypingIndicator label={stage} />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-surface-border bg-white px-4 py-3 flex-shrink-0">
        <div className="flex items-end gap-2 bg-surface-secondary border border-surface-border rounded-xl px-4 py-2.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask an HR question… (Enter to send, Shift+Enter for newline)"
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-50 resize-none leading-relaxed min-h-[1.5rem] max-h-32 scrollbar-thin"
            style={{ overflowY: "auto" }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 active:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 mb-0.5"
            aria-label="Send message"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-2xs text-slate-400 text-center mt-1.5">Answers are ABAC-filtered to your role · PII redacted</p>
      </div>
    </div>
  );
}
