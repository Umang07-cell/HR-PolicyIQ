import { useEffect } from "react";
import { useNotificationStore } from "../../store/notificationStore";

const config = {
  success: {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    ),
    wrapper: "bg-slate-900 border-emerald-500/40",
    iconBg: "bg-emerald-500/15 text-emerald-400",
    text: "text-slate-200",
    bar: "bg-emerald-500",
  },
  error: {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    wrapper: "bg-slate-900 border-red-500/40",
    iconBg: "bg-red-500/15 text-red-400",
    text: "text-slate-200",
    bar: "bg-red-500",
  },
  info: {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    wrapper: "bg-slate-900 border-blue-500/40",
    iconBg: "bg-blue-500/15 text-blue-400",
    text: "text-slate-200",
    bar: "bg-blue-500",
  },
};

const ToastItem = ({
  notification,
  onRemove,
}: {
  notification: { id: string; message: string; type: "success" | "error" | "info" };
  onRemove: (id: string) => void;
}) => {
  const c = config[notification.type];

  useEffect(() => {
    const timer = setTimeout(() => onRemove(notification.id), 4000);
    return () => clearTimeout(timer);
  }, [notification.id, onRemove]);

  return (
    <div
      className={`relative flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-elevated overflow-hidden animate-slide-up ${c.wrapper}`}
      role="alert"
    >
      {/* Progress bar */}
      <div className={`absolute bottom-0 left-0 h-0.5 ${c.bar} animate-[shrink_4s_linear_forwards]`} style={{ width: "100%" }} />

      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${c.iconBg}`}>
        {c.icon}
      </div>
      <p className={`text-sm font-medium flex-1 leading-relaxed pt-0.5 ${c.text}`}>{notification.message}</p>
      <button
        onClick={() => onRemove(notification.id)}
        className="text-slate-600 hover:text-slate-300 transition-colors flex-shrink-0 mt-0.5"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export const Toast = () => {
  const { notifications, remove } = useNotificationStore();
  if (notifications.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2.5rem)]"
      aria-live="polite"
      aria-atomic="true"
    >
      {notifications.map((n) => (
        <ToastItem key={n.id} notification={n} onRemove={remove} />
      ))}
    </div>
  );
};
