import { useState } from "react";
import { EmptyState } from "../ui/EmptyState";

const actionConfig: Record<string, { bg: string; text: string; label: string }> = {
  LOGIN:             { bg: "bg-emerald-50", text: "text-emerald-700", label: "Login" },
  LOGOUT:            { bg: "bg-slate-50",   text: "text-slate-500",   label: "Logout" },
  CHAT_QUERY:        { bg: "bg-blue-50",    text: "text-blue-700",    label: "Chat Query" },
  DOCUMENT_UPLOAD:   { bg: "bg-violet-50",  text: "text-violet-700",  label: "Doc Upload" },
  DOCUMENT_ARCHIVE:  { bg: "bg-red-50",     text: "text-red-700",     label: "Doc Archive" },
  LEAVE_REQUEST:     { bg: "bg-amber-50",   text: "text-amber-700",   label: "Leave Req." },
  LEAVE_APPROVE:     { bg: "bg-emerald-50", text: "text-emerald-700", label: "Leave ✓" },
  LEAVE_REJECT:      { bg: "bg-red-50",     text: "text-red-700",     label: "Leave ✗" },
  GRIEVANCE_FILED:   { bg: "bg-orange-50",  text: "text-orange-700",  label: "Grievance" },
};

export const AuditLogViewer = ({ logs }: { logs: any[] }) => {
  const [search, setSearch] = useState("");

  const filtered = logs.filter(
    (l) =>
      !search ||
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.resource?.toLowerCase().includes(search.toLowerCase()) ||
      String(l.user_id).includes(search)
  );

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-surface-border">
        <EmptyState
          title="No audit logs"
          description="All system actions will be logged here for compliance."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by action, resource, or user…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-surface-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <span className="text-xs text-slate-400 flex-shrink-0">{filtered.length} entries</span>
      </div>

      <div className="bg-white rounded-xl border border-surface-border overflow-hidden shadow-card">
        <div className="overflow-x-auto max-h-[520px] overflow-y-auto scrollbar-thin">
          <table className="min-w-full divide-y divide-slate-50">
            <thead className="bg-surface-secondary sticky top-0 z-10 shadow-sm">
              <tr>
                {["Timestamp", "User", "Action", "Resource", "Detail"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((l) => {
                const ac = actionConfig[l.action];
                return (
                  <tr key={l.id} className="hover:bg-surface-secondary transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap font-mono">
                      {new Date(l.timestamp).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        #{l.user_id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-md font-mono ${
                          ac ? `${ac.bg} ${ac.text}` : "bg-slate-50 text-slate-600"
                        }`}
                      >
                        {ac?.label ?? l.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {l.resource}
                      {l.resource_id ? (
                        <span className="text-slate-400"> #{l.resource_id}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 max-w-[200px] truncate">
                      {l.detail ? JSON.stringify(l.detail) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && search && (
            <div className="py-10 text-center">
              <p className="text-sm text-slate-500">No logs match "{search}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
