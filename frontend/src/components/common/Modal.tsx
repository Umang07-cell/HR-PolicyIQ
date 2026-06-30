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
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop (fixed so it always covers the viewport, even while the overlay scrolls) */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />

      {/* Centering wrapper: min-h-full inside the scroll container keeps both the header and
          the footer reachable for tall modals, while still centering short ones. */}
      <div className="relative flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Panel: bounded height with a pinned header and a scrollable body. */}
        <div
          className={`relative bg-white w-full ${widths[size]} rounded-t-3xl sm:rounded-2xl shadow-modal animate-slide-up overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[88vh]`}
        >
        {/* Header (pinned) */}
        <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-surface-border shrink-0">
          <div className="min-w-0">
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

          {/* Body: sizes to content; scrolls only if it would exceed the panel's max height.
              No flex-1 — that would stretch a short form and leave empty white space below. */}
          <div className="px-6 py-5 overflow-y-auto scrollbar-thin min-h-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
