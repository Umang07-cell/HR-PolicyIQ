import { useState, useEffect, useCallback } from "react";
import { getAnalytics, getLeaveTrends, getChatUsage } from "../api/admin";
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import { TableSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { useNotificationStore } from "../store/notificationStore";

const LEAVE_COLORS: Record<string, string> = {
  casual:    "bg-blue-500",
  sick:      "bg-red-500",
  earned:    "bg-emerald-500",
  maternity: "bg-pink-500",
  paternity: "bg-purple-500",
  unpaid:    "bg-slate-400",
};

const LEAVE_TEXT: Record<string, string> = {
  casual:    "text-blue-600",
  sick:      "text-red-600",
  earned:    "text-emerald-600",
  maternity: "text-pink-600",
  paternity: "text-purple-600",
  unpaid:    "text-slate-500",
};

const Icon = ({ path }: { path: string }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
  </svg>
);

export default function AnalyticsDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [leaveTrends, setLeaveTrends] = useState<any[]>([]);
  const [chatUsage, setChatUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { add: notify } = useNotificationStore();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ovRes, ltRes, cuRes] = await Promise.allSettled([
        getAnalytics(),
        getLeaveTrends(),
        getChatUsage(),
      ]);
      if (ovRes.status === "fulfilled") setOverview(ovRes.value.data);
      else notify("Failed to load overview metrics", "error");
      if (ltRes.status === "fulfilled") setLeaveTrends(ltRes.value.data);
      else notify("Failed to load leave trends", "error");
      if (cuRes.status === "fulfilled") setChatUsage(cuRes.value.data);
      else notify("Failed to load chat usage", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const maxLeaveCount =
    leaveTrends.length > 0 ? Math.max(...leaveTrends.map((t) => t.count)) : 1;

  return (
    <div className="p-6 max-w-7xl mx-auto page-enter">
      <PageHeader
        title="Analytics"
        subtitle="Platform usage metrics and HR insights"
        breadcrumb={[{ label: "Administration" }, { label: "Analytics" }]}
      />

      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Overview KPI cards */}
          {overview && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Users"
                value={overview.total_users ?? "—"}
                color="blue"
                icon={<Icon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />}
              />
              <StatCard
                label="Documents"
                value={overview.total_documents ?? "—"}
                color="purple"
                icon={<Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
              />
              <StatCard
                label="Indexed Docs"
                value={overview.indexed_documents ?? "—"}
                color="green"
                icon={<Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
              />
              <StatCard
                label="Pending Leaves"
                value={overview.pending_leaves ?? "—"}
                color={overview.pending_leaves > 0 ? "amber" : "green"}
                icon={<Icon path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
              />
              <StatCard
                label="Open Grievances"
                value={overview.open_grievances ?? "—"}
                color={overview.open_grievances > 0 ? "red" : "green"}
                icon={<Icon path="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />}
              />
              <StatCard
                label="Total Queries"
                value={overview.total_queries ?? chatUsage?.total_queries ?? "—"}
                color="blue"
                icon={<Icon path="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leave Trends chart */}
            <div className="bg-white rounded-xl border border-surface-border p-6 shadow-card">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-semibold text-slate-900">Leave by Type</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Distribution of requests</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Icon path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </div>
              </div>

              {leaveTrends.length === 0 ? (
                <EmptyState
                  size="sm"
                  title="No leave data yet"
                  description="Leave trends will appear once requests are submitted."
                  icon={<Icon path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
                />
              ) : (
                <div className="space-y-4">
                  {leaveTrends.map((t) => {
                    const pct = (t.count / maxLeaveCount) * 100;
                    const barColor = LEAVE_COLORS[t.leave_type] || "bg-slate-400";
                    const textColor = LEAVE_TEXT[t.leave_type] || "text-slate-600";
                    return (
                      <div key={t.leave_type}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-sm font-medium capitalize ${textColor}`}>
                            {t.leave_type}
                          </span>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="tabular-nums">{t.count} req.</span>
                            <span className="text-slate-200">·</span>
                            <span className="tabular-nums">{t.total_days}d total</span>
                          </div>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Chat Usage */}
            <div className="bg-white rounded-xl border border-surface-border p-6 shadow-card">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-semibold text-slate-900">HR Assistant Usage</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Query volume and top users</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Icon path="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </div>
              </div>

              {!chatUsage ? (
                <EmptyState
                  size="sm"
                  title="No query data yet"
                  description="Usage stats appear once employees use the HR Assistant."
                  icon={<Icon path="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />}
                />
              ) : (
                <>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-5xl font-bold text-slate-900 tabular-nums">
                      {chatUsage.total_queries}
                    </span>
                    <span className="text-slate-400 text-sm">total queries</span>
                  </div>

                  {chatUsage.top_users && chatUsage.top_users.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        Top Users
                      </p>
                      <div className="space-y-3">
                        {chatUsage.top_users.slice(0, 5).map((u: any, i: number) => {
                          const pct = (u.queries / chatUsage.top_users[0].queries) * 100;
                          return (
                            <div key={u.user_id} className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-300 w-5 text-right tabular-nums">
                                {i + 1}
                              </span>
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full transition-all duration-700"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-500 w-20 text-right tabular-nums">
                                {u.queries} queries
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
