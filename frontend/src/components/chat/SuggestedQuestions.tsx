const SUGGESTIONS = [
  { q: "How many casual leaves am I entitled to?", icon: "📅" },
  { q: "What is the grievance redressal process?", icon: "🚨" },
  { q: "How is my HRA calculated?", icon: "💰" },
  { q: "What is the work from home policy?", icon: "🏠" },
  { q: "Explain the performance appraisal process", icon: "⭐" },
  { q: "What documents are needed for reimbursement?", icon: "📄" },
];

export const SuggestedQuestions = ({ onSelect }: { onSelect: (q: string) => void }) => (
  <div className="grid grid-cols-2 gap-2">
    {SUGGESTIONS.map((s) => (
      <button
        key={s.q}
        onClick={() => onSelect(s.q)}
        className="text-left px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all"
      >
        <span className="mr-2">{s.icon}</span>{s.q}
      </button>
    ))}
  </div>
);
