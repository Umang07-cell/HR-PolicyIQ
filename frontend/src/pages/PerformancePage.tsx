import { useState, useEffect, useCallback } from "react";
import { getMyReviews, getTeamReviews } from "../api/performance";
import { AppraisalForm } from "../components/performance/AppraisalForm";
import { Modal } from "../components/common/Modal";
import { Badge } from "../components/common/Badge";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { CardSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { usePermissions } from "../hooks/usePermissions";
import { useNotificationStore } from "../store/notificationStore";
import { PerformanceReview } from "../types/models";

const Stars = ({ value }: { value?: number }) => {
  if (!value) return <span className="text-xs text-slate-400 italic">Not yet rated</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3.5 h-3.5 ${s <= value ? "text-amber-400" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-slate-500 ml-1.5 tabular-nums">{value} / 5</span>
    </div>
  );
};

const RatingBar = ({ value }: { value?: number }) => {
  if (!value) return null;
  const pct = (value / 5) * 100;
  const color = value >= 4 ? "bg-emerald-500" : value >= 3 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
};

const Icon = ({ path }: { path: string }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
  </svg>
);

export default function PerformancePage() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<"my" | "team">("my");
  const [loading, setLoading] = useState(true);
  const { isManager } = usePermissions();
  const { add: notify } = useNotificationStore();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = tab === "team" && isManager ? await getTeamReviews() : await getMyReviews();
      setReviews(r.data);
    } catch {
      notify("Failed to load reviews", "error");
    } finally {
      setLoading(false);
    }
  }, [tab, isManager, notify]);

  useEffect(() => { load(); }, [load]);

  const avgRating = reviews.filter((r) => r.rating).reduce((acc, r, _, arr) =>
    acc + (r.rating ?? 0) / arr.length, 0
  );

  return (
    <div className="p-6 max-w-4xl mx-auto page-enter">
      <PageHeader
        title="Performance"
        subtitle="Appraisal reviews and performance feedback"
        breadcrumb={[{ label: "Workspace" }, { label: "Performance" }]}
        action={
          isManager ? (
            <Button
              onClick={() => setShowForm(true)}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Create Review
            </Button>
          ) : undefined
        }
      />

      {/* Summary strip when reviews exist */}
      {!loading && reviews.length > 0 && avgRating > 0 && (
        <div className="flex items-center gap-6 bg-white border border-surface-border rounded-xl p-4 mb-6 shadow-card">
          <div>
            <p className="text-xs text-slate-400 font-medium">Avg. Rating</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-slate-900 tabular-nums">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-slate-400">/ 5</span>
            </div>
          </div>
          <div className="w-px h-10 bg-surface-border" />
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Reviews</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums mt-0.5">{reviews.length}</p>
          </div>
          <div className="w-px h-10 bg-surface-border" />
          <div>
            <p className="text-xs text-slate-400 font-medium">Completed</p>
            <p className="text-2xl font-bold text-emerald-600 tabular-nums mt-0.5">
              {reviews.filter((r) => r.status === "completed").length}
            </p>
          </div>
        </div>
      )}

      {/* Tab switcher */}
      {isManager && (
        <div className="flex gap-0.5 bg-surface-tertiary border border-surface-border rounded-xl p-1 w-fit mb-6">
          {(["my", "team"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                tab === t
                  ? "bg-white text-slate-900 shadow-card"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
              }`}
            >
              {t === "my" ? "My Reviews" : "Team Reviews"}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-surface-border shadow-card">
          <EmptyState
            icon={<Icon path="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
            title="No reviews yet"
            description={
              tab === "team"
                ? "No team reviews have been created for this cycle."
                : "Your performance reviews will appear here once your manager submits them."
            }
            action={
              isManager
                ? { label: "Create Review", onClick: () => setShowForm(true) }
                : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-surface-border rounded-xl p-5 hover:shadow-card-hover transition-all duration-200 shadow-card"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Cycle badge */}
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">
                      {r.review_period}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">Reviewer #{r.reviewer_id}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Stars value={r.rating} />
                      <RatingBar value={r.rating} />
                    </div>

                  </div>
                </div>
                <Badge label={r.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title="Create Performance Review" onClose={() => setShowForm(false)}>
          <AppraisalForm onSuccess={() => { setShowForm(false); load(); }} />
        </Modal>
      )}
    </div>
  );
}
