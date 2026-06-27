interface ChecklistItemProps {
  step: number;
  label: string;
  description: string;
  done: boolean;
}

export const ChecklistItem = ({ step, label, description, done }: ChecklistItemProps) => (
  <div className={`flex items-center gap-4 px-6 py-4 ${done ? "bg-emerald-50/50" : ""}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
      {done ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ) : step}
    </div>
    <div className="flex-1">
      <p className={`text-sm font-medium ${done ? "text-emerald-700 line-through" : "text-slate-800"}`}>{label}</p>
      <p className="text-xs text-slate-400 mt-0.5">{description}</p>
    </div>
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${done ? "text-emerald-600 bg-emerald-100" : "text-slate-500 bg-slate-100"}`}>
      {done ? "Done" : "Pending"}
    </span>
  </div>
);
