const leaveColors: Record<string, string> = {
  casual:    "bg-blue-500",
  sick:      "bg-red-500",
  earned:    "bg-emerald-500",
  maternity: "bg-pink-500",
  paternity: "bg-purple-500",
  unpaid:    "bg-slate-400",
};

export const LeaveBalance = ({
  balance,
}: {
  balance: Record<string, { total: number; used: number; remaining: number }>;
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
    {Object.entries(balance).map(([type, b]) => {
      const pct = b.total > 0 ? (b.remaining / b.total) * 100 : 0;
      const barColor = leaveColors[type] || "bg-slate-400";
      return (
        <div key={type} className="bg-white border border-surface-border rounded-xl p-4 shadow-card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider capitalize mb-2">
            {type}
          </p>
          <div className="flex items-end gap-1.5 mb-3">
            <span className="text-2xl font-bold text-slate-900 tabular-nums leading-none">{b.remaining}</span>
            <span className="text-xs text-slate-400 pb-0.5">/ {b.total} days</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-2xs text-slate-400 mt-1.5">{b.used} used</p>
        </div>
      );
    })}
  </div>
);
