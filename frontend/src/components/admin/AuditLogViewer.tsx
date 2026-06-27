import { EmptyState } from "../ui/EmptyState";

const actionColors: Record<string, string> = {
  LOGIN: "text-green-600 bg-green-50",
  LOGOUT: "text-slate-500 bg-slate-50",
  CHAT_QUERY: "text-blue-600 bg-blue-50",
  DOCUMENT_UPLOAD: "text-purple-600 bg-purple-50",
  DOCUMENT_ARCHIVE: "text-red-600 bg-red-50",
  LEAVE_REQUEST: "text-amber-600 bg-amber-50",
  LEAVE_APPROVE: "text-green-600 bg-green-50",
  LEAVE_REJECT: "text-red-600 bg-red-50",
  GRIEVANCE_FILED: "text-orange-600 bg-orange-50",
};

export const AuditLogViewer = ({ logs }: { logs: any[] }) => {
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200">
        <EmptyState title="No audit logs" description="Actions will be logged here for compliance." />
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              {["Timestamp", "User", "Action", "Resource", "Detail"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2.5 text-xs text-slate-400 whitespace-nowrap font-mono">
                  {new Date(l.timestamp).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-600">#{l.user_id}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg font-mono ${actionColors[l.action] || "text-slate-600 bg-slate-50"}`}>
                    {l.action}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{l.resource}{l.resource_id ? ` #${l.resource_id}` : ""}</td>
                <td className="px-4 py-2.5 text-xs text-slate-400 max-w-xs truncate">
                  {l.detail ? JSON.stringify(l.detail) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
