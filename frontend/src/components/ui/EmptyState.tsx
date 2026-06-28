interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  size?: "sm" | "md";
}

export const EmptyState = ({ icon, title, description, action, size = "md" }: EmptyStateProps) => (
  <div className={`flex flex-col items-center justify-center text-center ${size === "sm" ? "py-10 px-4" : "py-16 px-6"}`}>
    {icon && (
      <div className={`rounded-2xl bg-slate-50 border border-surface-border flex items-center justify-center mb-4 text-slate-400 ${size === "sm" ? "w-10 h-10" : "w-14 h-14"}`}>
        {icon}
      </div>
    )}
    <h3 className={`font-semibold text-slate-700 ${size === "sm" ? "text-xs" : "text-sm"}`}>{title}</h3>
    {description && (
      <p className={`text-slate-400 mt-1 max-w-xs leading-relaxed ${size === "sm" ? "text-xs" : "text-xs"}`}>
        {description}
      </p>
    )}
    {action && (
      <button
        onClick={action.onClick}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        {action.label}
      </button>
    )}
  </div>
);
