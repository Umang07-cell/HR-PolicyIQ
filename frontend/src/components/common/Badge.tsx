const variants: Record<string, string> = {
  // Status
  pending: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  approved: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
  rejected: "bg-red-100 text-red-800 ring-1 ring-red-200",
  cancelled: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  submitted: "bg-blue-100 text-blue-800 ring-1 ring-blue-200",
  active: "bg-blue-100 text-blue-800 ring-1 ring-blue-200",
  closed: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  resolved: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
  // Priority
  low: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  medium: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  high: "bg-orange-100 text-orange-800 ring-1 ring-orange-200",
  critical: "bg-red-100 text-red-800 ring-1 ring-red-200",
  // Document
  published: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
  draft: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  archived: "bg-purple-100 text-purple-800 ring-1 ring-purple-200",
  // Job status
  open: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
  filled: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  // Review
  in_progress: "bg-blue-100 text-blue-800 ring-1 ring-blue-200",
};

export const Badge = ({ label, size = "sm" }: { label: string; size?: "xs" | "sm" }) => {
  const cls = size === "xs" ? "text-xs px-1.5 py-0" : "text-xs px-2.5 py-0.5";
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${cls} ${
        variants[label] || "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
      }`}
    >
      {label.replace(/_/g, " ")}
    </span>
  );
};
