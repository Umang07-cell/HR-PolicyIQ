interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: "blue" | "green" | "amber" | "red" | "purple" | "slate";
  description?: string;
}

const colorConfig = {
  blue: {
    icon: "bg-blue-50 text-blue-600 border-blue-100",
    accent: "text-blue-600",
    ring: "group-hover:ring-blue-100",
  },
  green: {
    icon: "bg-emerald-50 text-emerald-600 border-emerald-100",
    accent: "text-emerald-600",
    ring: "group-hover:ring-emerald-100",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600 border-amber-100",
    accent: "text-amber-600",
    ring: "group-hover:ring-amber-100",
  },
  red: {
    icon: "bg-red-50 text-red-600 border-red-100",
    accent: "text-red-600",
    ring: "group-hover:ring-red-100",
  },
  purple: {
    icon: "bg-purple-50 text-purple-600 border-purple-100",
    accent: "text-purple-600",
    ring: "group-hover:ring-purple-100",
  },
  slate: {
    icon: "bg-slate-100 text-slate-600 border-slate-200",
    accent: "text-slate-600",
    ring: "group-hover:ring-slate-100",
  },
};

export const StatCard = ({ label, value, icon, trend, color = "blue", description }: StatCardProps) => {
  const c = colorConfig[color];
  return (
    <div className="group bg-white rounded-xl border border-surface-border p-5 hover:shadow-card-hover hover:ring-2 ring-transparent transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1.5 leading-none tabular-nums">{value}</p>
          {description && <p className="text-xs text-slate-400 mt-1.5 leading-snug">{description}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-1.5">
              {trend.value >= 0 ? (
                <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              <p className={`text-xs font-medium ${trend.value >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {Math.abs(trend.value)}% {trend.label}
              </p>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${c.icon}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
