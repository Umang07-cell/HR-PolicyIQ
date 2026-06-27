export const ProgressBar = ({ value, max }: { value: number; max: number }) => {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div className="bg-blue-600 h-full rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-bold text-blue-600 w-10 text-right">{pct}%</span>
    </div>
  );
};
