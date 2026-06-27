import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard, getAuditLogs, getUsers } from "../api/admin";
import { MetricsPanel } from "../components/admin/MetricsPanel";
import { AuditLogViewer } from "../components/admin/AuditLogViewer";
import { UserTable } from "../components/admin/UserTable";
import { PolicyManager } from "../components/admin/PolicyManager";
import { PageHeader } from "../components/ui/PageHeader";
import { TableSkeleton } from "../components/ui/Skeleton";
import { useNotificationStore } from "../store/notificationStore";
import { DashboardStats, User } from "../types/models";

type Tab = "overview" | "users" | "audit" | "policies";

const TAB_LABELS: Record<Tab, string> = {
  overview: "Overview",
  users: "Users",
  audit: "Audit Log",
  policies: "Policies",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const { add: notify } = useNotificationStore();

  // BUG-13 fixed: error handling on all fetch calls
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, logsRes, usersRes] = await Promise.allSettled([
        getDashboard(),
        getAuditLogs(),
        getUsers(),
      ]);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
      else notify("Failed to load dashboard stats", "error");

      if (logsRes.status === "fulfilled") setLogs(logsRes.value.data);
      else notify("Failed to load audit logs", "error");

      if (usersRes.status === "fulfilled") setUsers(usersRes.value.data);
      else notify("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="p-6 max-w-7xl">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Platform health, user management, and audit trail"
        action={
          <button 
            onClick={() => navigate("/")} 
            className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium border border-slate-200 bg-white px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Switch Role
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <>
          {tab === "overview" && stats && <MetricsPanel stats={stats} />}
          {tab === "users" && <UserTable users={users} />}
          {tab === "audit" && <AuditLogViewer logs={logs} />}
          {tab === "policies" && <PolicyManager />}
        </>
      )}
    </div>
  );
}
