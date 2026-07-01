import { useState, useEffect, useCallback } from "react";
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

const TAB_CONFIG: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" },
  { id: "users", label: "Users", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { id: "audit", label: "Audit Log", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { id: "policies", label: "Policies", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const { add: notify } = useNotificationStore();

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
    <div className="p-6 max-w-7xl mx-auto page-enter">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Platform health, user management, and audit trail"
        breadcrumb={[{ label: "Administration" }, { label: "Admin Dashboard" }]}
      />

      {/* Tabs */}
      <div className="flex gap-0.5 bg-surface-tertiary border border-surface-border rounded-xl p-1 w-fit mb-6">
        {TAB_CONFIG.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
              tab === t.id
                ? "bg-white text-slate-900 shadow-card"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={t.icon} />
            </svg>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <div className="animate-fade-in">
          {tab === "overview" && stats && <MetricsPanel stats={stats} />}
          {tab === "users" && <UserTable users={users} onRefresh={loadData} />}
          {tab === "audit" && <AuditLogViewer logs={logs} />}
          {tab === "policies" && <PolicyManager />}
        </div>
      )}
    </div>
  );
}
