import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 shadow-sm",
  secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:opacity-50",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 shadow-sm",
  ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-50",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs font-medium rounded-lg",
  md: "px-4 py-2 text-sm font-medium rounded-lg",
  lg: "px-5 py-2.5 text-sm font-semibold rounded-xl",
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
    className={`inline-flex items-center gap-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${variants[variant]} ${sizes[size]} ${className}`}
    {...props}
  >
    {loading ? (
      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    ) : icon ? (
      <span className="flex-shrink-0">{icon}</span>
    ) : null}
    {children}
  </button>
);
