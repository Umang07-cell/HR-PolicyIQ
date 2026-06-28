interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
}

export const PageHeader = ({ title, subtitle, action, breadcrumb }: PageHeaderProps) => (
  <div className="flex items-start justify-between mb-6 gap-4">
    <div>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1.5 mb-2" aria-label="Breadcrumb">
          {breadcrumb.map((crumb, idx) => (
            <span key={idx} className="flex items-center gap-1.5">
              {idx > 0 && (
                <svg className="w-3 h-3 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              <span className={`text-xs font-medium ${idx === breadcrumb.length - 1 ? "text-slate-500" : "text-slate-400 hover:text-slate-600"}`}>
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
      )}
      <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">{title}</h1>
      {subtitle && (
        <p className="text-sm text-slate-500 mt-0.5 leading-snug">{subtitle}</p>
      )}
    </div>
    {action && (
      <div className="flex items-center gap-2 flex-shrink-0">{action}</div>
    )}
  </div>
);
