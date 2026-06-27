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

const priorityDot: Record<string, string> = {
  low: "bg-slate-400",
  medium: "bg-amber-400",
  high: "bg-orange-500",
  critical: "bg-red-500 animate-pulse-slow",
};

const Icon = ({ path }: { path: string }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
  </svg>
);

export default function GrievancePage() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { canViewAllGrievances } = usePermissions();
  const { add: notify } = useNotificationStore();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = canViewAllGrievances ? await getAllGrievances() : await getMyGrievances();
      setGrievances(r.data);
    } catch {
      notify("Failed to load grievances", "error");
    } finally {
      setLoading(false);
    }
  }, [canViewAllGrievances, notify]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6 max-w-4xl">
      <PageHeader
        title="Grievances"
        subtitle={canViewAllGrievances ? "All submitted grievances" : "Track your grievance submissions"}
        action={
          <Button
            variant="danger"
            onClick={() => setShowForm(true)}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
          >
            File Grievance
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : grievances.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200">
          <EmptyState
            icon={<Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
            title="No grievances"
            description={canViewAllGrievances ? "No grievances have been submitted yet." : "You haven't filed any grievances. Use the button above if you need to raise a concern."}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {grievances.map((g) => (
            <div key={g.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${priorityDot[g.priority] || "bg-slate-400"}`} />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{g.title}</p>
                    {g.category && (
                      <p className="text-xs text-slate-400 mt-0.5 capitalize">{g.category.replace(/_/g, " ")}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">Grievance #{g.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge label={g.priority} />
                  <Badge label={g.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title="File a Grievance" onClose={() => setShowForm(false)}>
          <GrievanceForm onSuccess={() => { setShowForm(false); load(); }} />
        </Modal>
      )}
    </div>
  );
}
