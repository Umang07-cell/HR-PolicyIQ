import { ReactNode, useEffect } from "react";

export const Modal = ({
  title,
  children,
  onClose,
  size = "md",
  description,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl";
  description?: string;
}) => {
  const widths = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-3xl",
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        className={`relative bg-white w-full ${widths[size]} rounded-t-3xl sm:rounded-2xl shadow-modal animate-slide-up overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-surface-border">
          <div>
            <h3 id="modal-title" className="text-base font-semibold text-slate-900">{title}</h3>
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0 focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Close modal"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto max-h-[70vh] scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  );
};
