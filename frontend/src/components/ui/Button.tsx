import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "xs" | "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variants = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 disabled:bg-blue-400 shadow-sm",
  secondary:
    "bg-white text-slate-700 border border-surface-border hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 shadow-sm",
  danger:
    "bg-red-600 text-white hover:bg-red-500 active:bg-red-700 disabled:bg-red-400 shadow-sm",
  ghost:
    "text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-50",
  outline:
    "text-blue-600 border border-blue-200 hover:bg-blue-50 active:bg-blue-100 disabled:opacity-50",
};

const sizes = {
  xs: "px-2.5 py-1 text-xs font-medium rounded-md gap-1.5",
  sm: "px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5",
  md: "px-4 py-2 text-sm font-medium rounded-lg gap-2",
  lg: "px-5 py-2.5 text-sm font-semibold rounded-xl gap-2",
};

const spinnerSize = {
  xs: "w-3 h-3",
  sm: "w-3 h-3",
  md: "w-3.5 h-3.5",
  lg: "w-4 h-4",
};

export const Button = ({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) => (
  <button
    disabled={disabled || loading}
    className={`inline-flex items-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed select-none ${variants[variant]} ${sizes[size]} ${className}`}
    {...props}
  >
    {loading ? (
      <svg className={`${spinnerSize[size]} animate-spin flex-shrink-0`} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    ) : icon ? (
      <span className="flex-shrink-0">{icon}</span>
    ) : null}
    <span>{children}</span>
  </button>
);
