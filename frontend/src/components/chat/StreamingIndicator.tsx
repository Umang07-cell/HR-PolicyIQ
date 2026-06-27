export const StreamingIndicator = () => (
  <div className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-card w-fit">
    {[0, 1, 2].map((i) => (
      <div key={i} className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
    ))}
    <span className="text-xs text-slate-400 ml-1">Thinking...</span>
  </div>
);
