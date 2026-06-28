import { useState, useEffect, useCallback } from "react";
import { getMyGrievances, getAllGrievances } from "../api/grievance";
import { GrievanceForm } from "../components/grievance/GrievanceForm";
import { Modal } from "../components/common/Modal";
import { Badge } from "../components/common/Badge";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { CardSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { usePermissions } from "../hooks/usePermissions";
import { useNotificationStore } from "../store/notificationStore";
import { Grievance } from "../types/models";

const priorityConfig: Record<string, { dot: string; bg: string; text: string }> = {
  low:      { dot: "bg-slate-400",             bg: "bg-slate-50",   text: "text-slate-500" },
  medium:   { dot: "bg-amber-400",             bg: "bg-amber-50",   text: "text-amber-700" },
  high:     { dot: "bg-orange-500",            bg: "bg-orange-50",  text: "text-orange-700" },
  critical: { dot: "bg-red-500 animate-pulse", bg: "bg-red-50",     text: "text-red-700" },
};

const Icon = ({ path, className = "w-5 h-5" }: { path: string; className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
  </svg>
);

export default function GrievancePage() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");
  const { canViewAllGrievances } = usePermissions();
  const { add: notify } = useNotificationStore();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = canViewAllGrievances
        ? await getAllGrievances()
        : await getMyGrievances();
      setGrievances(r.data);
    } catch {
      notify("Failed to load grievances", "error");
    } finally {
      setLoading(false);
    }
  }, [canViewAllGrievances, notify]);

  useEffect(() => { load(); }, [load]);

  const filtered = grievances.filter((g) => {
    if (filter === "open") return g.status === "submitted" || g.status === "in_progress";
    if (filter === "resolved") return g.status === "resolved" || g.status === "closed";
    return true;
  });

  const openCount = grievances.filter((g) => g.status === "submitted" || g.status === "in_progress").length;

  return (
    <div className="p-6 max-w-4xl mx-auto page-enter">
      <PageHeader
        title="Grievances"
        subtitle={
          canViewAllGrievances
            ? "All submitted grievances across the platform"
            : "Track and manage your grievance submissions"
        }
        breadcrumb={[{ label: "Workspace" }, { label: "Grievance" }]}
        action={
          <Button
            variant="danger"
            onClick={() => setShowForm(true)}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            File Grievance
          </Button>
        }
      />

      {/* Summary + filter row */}
      {!loading && grievances.length > 0 && (
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="font-medium text-slate-700">{grievances.length} total</span>
            {openCount > 0 && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-red-600 font-medium">{openCount} open</span>
              </>
            )}
          </div>
          {/* Filter pills */}
          <div className="flex gap-1 bg-surface-tertiary border border-surface-border rounded-xl p-1">
            {(["all", "open", "resolved"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${
                  filter === f
                    ? "bg-white text-slate-900 shadow-card"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-surface-border shadow-card">
          <EmptyState
            icon={<Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
            title={filter !== "all" ? `No ${filter} grievances` : "No grievances"}
            description={
              filter !== "all"
                ? `There are no ${filter} grievances at the moment.`
                : canViewAllGrievances
                ? "No grievances have been submitted yet."
                : "You haven't filed any grievances. Use the button above if you need to raise a concern."
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((g) => {
            const pc = priorityConfig[g.priority] || priorityConfig.low;
            return (
              <div
                key={g.id}
                className="bg-white border border-surface-border rounded-xl p-5 hover:shadow-card-hover transition-all duration-200 shadow-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Priority dot */}
                    <div className="mt-1.5 flex-shrink-0">
                      <div className={`w-2.5 h-2.5 rounded-full ${pc.dot}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{g.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {g.category && (
                          <span className="text-xs text-slate-400 capitalize">
                            {g.category.replace(/_/g, " ")}
                          </span>
                        )}
                        <span className="text-slate-200 text-xs">·</span>
                        <span className="text-xs text-slate-400">#{g.id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md capitalize ${pc.bg} ${pc.text}`}>
                      {g.priority}
                    </span>
                    <Badge label={g.status} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <Modal
          title="File a Grievance"
          description="Your submission is confidential and will be reviewed by HR."
          onClose={() => setShowForm(false)}
        >
          <GrievanceForm onSuccess={() => { setShowForm(false); load(); }} />
        </Modal>
      )}
    </div>
  );
}
