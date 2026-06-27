interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: "blue" | "green" | "amber" | "red" | "purple";
}

const colors = {
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  green: "bg-emerald-50 text-emerald-600 border-emerald-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  red: "bg-red-50 text-red-600 border-red-100",
  purple: "bg-purple-50 text-purple-600 border-purple-100",
};

export const StatCard = ({ label, value, icon, trend, color = "blue" }: StatCardProps) => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-card-hover transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        {trend && (
          <p className={`text-xs mt-1 ${trend.value >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colors[color]}`}>
        {icon}
      </div>
    </div>
  </div>
);
