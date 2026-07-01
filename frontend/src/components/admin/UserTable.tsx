import { useState } from "react";
import { User } from "../../types/models";
import { Badge } from "../common/Badge";
import { Modal } from "../common/Modal";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { createUser, deactivateUser } from "../../api/admin";
import { useNotificationStore } from "../../store/notificationStore";

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

export const UserTable = ({ users, onRefresh }: { users: User[], onRefresh?: () => void }) => {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { add: notify } = useNotificationStore();

  const [formData, setFormData] = useState({
    email: "", password: "", full_name: "", role: "employee", department: "", location: "", employee_id: ""
  });

  const filtered = users.filter(
    (u) =>
      !search ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createUser(formData);
      notify("User created successfully", "success");
      setShowAdd(false);
      setFormData({ email: "", password: "", full_name: "", role: "employee", department: "", location: "", employee_id: "" });
      if (onRefresh) onRefresh();
    } catch (err: any) {
      notify(err.response?.data?.detail || "Failed to create user", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;
    try {
      await deactivateUser(id);
      notify("User deactivated", "success");
      if (onRefresh) onRefresh();
    } catch {
      notify("Failed to deactivate user", "error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-xs">
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
        <Button onClick={() => setShowAdd(true)} size="sm">
          Add User
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-surface-border overflow-hidden shadow-card">
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border bg-surface-tertiary">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {filtered.length} user{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {users.length === 0 ? (
           <EmptyState title="No users found" description="User accounts will appear here once created." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-50">
              <thead>
                <tr className="bg-surface-secondary">
                  {["Name", "Email", "Role", "Department", "Location", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
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
                      <td className="px-4 py-3.5 text-right">
                        {u.is_active && (
                           <button onClick={() => handleDeactivate(u.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Deactivate</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && search && (
              <div className="py-10 text-center">
                <p className="text-sm text-slate-500">No users match "{search}"</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showAdd && (
        <Modal title="Create New User" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input required value={formData.full_name} onChange={e=>setFormData({...formData, full_name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input required type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input required type="password" minLength={8} value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr_admin">HR Admin</option>
                <option value="executive">Executive</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department (Optional)</label>
                <input value={formData.department} onChange={e=>setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location (Optional)</label>
                <input value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" loading={loading}>Create User</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
