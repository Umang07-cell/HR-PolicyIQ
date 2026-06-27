import { useNotificationStore } from "../../store/notificationStore";

const icons = {
  success: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const styles = {
  success: "bg-slate-900 border-green-500/50 text-green-300",
  error: "bg-slate-900 border-red-500/50 text-red-300",
  info: "bg-slate-900 border-blue-500/50 text-blue-300",
};

const iconBg = {
  success: "bg-green-500/20 text-green-400",
  error: "bg-red-500/20 text-red-400",
  info: "bg-blue-500/20 text-blue-400",
};

export const Toast = () => {
  const { notifications, remove } = useNotificationStore();
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl animate-slide-up ${styles[n.type]}`}
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${iconBg[n.type]}`}>
            {icons[n.type]}
          </div>
          <span className="text-sm font-medium text-slate-200 flex-1 leading-relaxed">{n.message}</span>
          <button
            onClick={() => remove(n.id)}
            className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};
