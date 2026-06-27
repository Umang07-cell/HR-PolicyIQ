import { User } from "../../types/models";
import { Badge } from "../common/Badge";
import { EmptyState } from "../ui/EmptyState";

const roleColors: Record<string, string> = {
  employee: "bg-slate-100 text-slate-700",
  manager: "bg-violet-100 text-violet-700",
  hr_admin: "bg-blue-100 text-blue-700",
  executive: "bg-amber-100 text-amber-700",
};

export const UserTable = ({ users }: { users: User[] }) => {
  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200">
        <EmptyState title="No users found" description="User accounts will appear here." />
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead>
            <tr className="bg-slate-50">
              {["Name", "Email", "Role", "Department", "Location", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {u.full_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-900">{u.full_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-lg ${roleColors[u.role] || "bg-slate-100 text-slate-700"}`}>
                    {u.role.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">{u.department || "—"}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{u.location || "—"}</td>
                <td className="px-4 py-3">
                  <Badge label={u.is_active ? "active" : "inactive"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
