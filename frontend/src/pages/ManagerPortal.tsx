import { useState, useEffect, useCallback } from "react";
import { getPendingLeaves } from "../api/leave";
import { getAllGrievances } from "../api/grievance";
import { getTeamReviews } from "../api/performance";
import { ApprovalCard } from "../components/leave/ApprovalCard";
import { Badge } from "../components/common/Badge";
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import { CardSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { useNotificationStore } from "../store/notificationStore";

const Icon = ({ path }: { path: string }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
  </svg>
);

export default function ManagerPortal() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [grievances, setGrievances] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { add: notify } = useNotificationStore();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [l, g, r] = await Promise.allSettled([
        getPendingLeaves(),
        getAllGrievances(),
        getTeamReviews(),
      ]);
      if (l.status === "fulfilled") setLeaves(l.value.data);
      else notify("Failed to load leave requests", "error");
      if (g.status === "fulfilled") setGrievances(g.value.data);
      if (r.status === "fulfilled") setReviews(r.value.data);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const openGrievances = grievances.filter(
    (g) => g.status === "submitted" || g.status === "in_progress"
  );

  return (
    <div className="p-6 max-w-7xl mx-auto page-enter">
      <PageHeader
        title="Team Overview"
        subtitle="Manage your team's leave requests, grievances, and performance"
        breadcrumb={[{ label: "Management" }, { label: "Team Overview" }]}
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Pending Approvals"
          value={leaves.length}
          color={leaves.length > 0 ? "amber" : "green"}
          description={leaves.length === 0 ? "All requests reviewed" : "Leave requests awaiting action"}
          icon={<Icon path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
        />
        <StatCard
          label="Open Grievances"
          value={openGrievances.length}
          color={openGrievances.length > 0 ? "red" : "green"}
          description={openGrievances.length === 0 ? "No open issues" : "Require attention"}
          icon={<Icon path="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />}
        />
        <StatCard
          label="Team Reviews"
          value={reviews.length}
          color="purple"
          description="Performance cycle"
          icon={<Icon path="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Approvals */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-slate-700">Pending Leave Approvals</h2>
            {leaves.length > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {leaves.length}
              </span>
            )}
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : leaves.length === 0 ? (
            <div className="bg-white rounded-xl border border-surface-border shadow-card">
              <EmptyState
                icon={<Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                title="All caught up"
                description="No leave requests awaiting your approval."
                size="sm"
              />
            </div>
          ) : (
            <div className="space-y-3">
              {leaves.map((l) => (
                <ApprovalCard key={l.id} leave={l} onRefresh={load} />
              ))}
            </div>
          )}
        </div>

        {/* Open Grievances */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-slate-700">Open Grievances</h2>
            {openGrievances.length > 0 && (
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {openGrievances.length}
              </span>
            )}
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : openGrievances.length === 0 ? (
            <div className="bg-white rounded-xl border border-surface-border shadow-card">
              <EmptyState
                icon={<Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                title="No open grievances"
                description="Your team has no unresolved grievances."
                size="sm"
              />
            </div>
          ) : (
            <div className="space-y-3">
              {openGrievances.slice(0, 5).map((g) => (
                <div
                  key={g.id}
                  className="bg-white border border-surface-border rounded-xl p-4 hover:shadow-card-hover transition-all duration-200 shadow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 line-clamp-1">{g.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 capitalize">
                        {g.category?.replace(/_/g, " ") || "General"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Badge label={g.priority} size="xs" />
                      <Badge label={g.status} size="xs" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
