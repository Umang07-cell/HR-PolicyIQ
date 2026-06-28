const variants: Record<string, string> = {
  // Leave / request status
  pending:     "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  approved:    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  rejected:    "bg-red-50 text-red-600 ring-1 ring-red-200",
  cancelled:   "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
  submitted:   "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  active:      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  inactive:    "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
  closed:      "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
  resolved:    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  in_progress: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  completed:   "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  // Priority
  low:         "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
  medium:      "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  high:        "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  critical:    "bg-red-50 text-red-700 ring-1 ring-red-200",
  // Document
  published:   "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  draft:       "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
  archived:    "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
  // Jobs
  open:        "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  filled:      "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
  on_hold:     "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
};

const sizeClasses = {
  xs: "text-xs px-1.5 py-0 leading-5",
  sm: "text-xs px-2.5 py-0.5",
};

export const Badge = ({
  label,
  size = "sm",
}: {
  label: string;
  size?: "xs" | "sm";
}) => (
  <span
    className={`inline-flex items-center rounded-full font-medium whitespace-nowrap ${sizeClasses[size]} ${
      variants[label] ?? "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
    }`}
  >
    {label.replace(/_/g, " ")}
  </span>
);
