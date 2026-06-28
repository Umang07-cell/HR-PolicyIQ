import { useState } from "react";
import { User } from "../../types/models";
import { Badge } from "../common/Badge";
import { EmptyState } from "../ui/EmptyState";

const roleConfig: Record<string, { bg: string; text: string; dot: string }> = {
  employee: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" },
  manager: { bg: "bg-violet-100", text: "text-violet-700", dot: "bg-violet-500" },
  hr_admin: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  executive: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
};

const avatarColors = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-amber-500", "bg-rose-500", "bg-cyan-500",
];

export const UserTable = ({ users }: { users: User[] }) => {
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      !search ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department ?? "").toLowerCase().includes(search.toLowerCase())
  );

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-surface-border">
        <EmptyState title="No users found" description="User accounts will appear here once created." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-xs">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users…"
          className="w-full pl-9 pr-4 py-2 text-sm border border-surface-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-xl border border-surface-border overflow-hidden shadow-card">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border bg-surface-tertiary">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {filtered.length} user{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-50">
            <thead>
              <tr className="bg-surface-secondary">
                {["Name", "Email", "Role", "Department", "Location", "Status"].map((h) => (
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
              {filtered.map((u, i) => {
                const rc = roleConfig[u.role] || roleConfig.employee;
                const avatarColor = avatarColors[i % avatarColors.length];
                return (
                  <tr key={u.id} className="hover:bg-surface-secondary transition-colors group">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {u.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-900">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-500">{u.email}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${rc.bg} ${rc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />
                        {u.role.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-500">{u.department || "—"}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-500">{u.location || "—"}</td>
                    <td className="px-4 py-3.5">
                      <Badge label={u.is_active ? "active" : "inactive"} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && search && (
          <div className="py-10 text-center">
            <p className="text-sm text-slate-500">No users match "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
};
