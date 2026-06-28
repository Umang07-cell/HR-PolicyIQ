import { useState, useEffect, useCallback } from "react";
import { client } from "../api/client";
import { Badge } from "../components/common/Badge";
import { PageHeader } from "../components/ui/PageHeader";
import { CardSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { useNotificationStore } from "../store/notificationStore";

const Icon = ({ path, className = "w-4 h-4" }: { path: string; className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={path} />
  </svg>
);

const deptColors: Record<string, string> = {
  Engineering: "bg-blue-50 text-blue-700",
  Design:      "bg-violet-50 text-violet-700",
  Marketing:   "bg-pink-50 text-pink-700",
  Finance:     "bg-amber-50 text-amber-700",
  HR:          "bg-emerald-50 text-emerald-700",
  Operations:  "bg-orange-50 text-orange-700",
};

export default function RecruitmentPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { add: notify } = useNotificationStore();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await client.get("/recruitment/jobs");
      setJobs(r.data);
    } catch {
      notify("Failed to load job postings", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const openJobs = jobs.filter((j) => (j.status || "open") === "open");

  return (
    <div className="p-6 max-w-4xl mx-auto page-enter">
      <PageHeader
        title="Recruitment"
        subtitle="Open positions and hiring pipeline"
        breadcrumb={[{ label: "Workspace" }, { label: "Recruitment" }]}
      />

      {/* Summary strip */}
      {!loading && jobs.length > 0 && (
        <div className="flex items-center gap-4 mb-6 p-4 bg-white border border-surface-border rounded-xl shadow-card">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{jobs.length}</p>
            <p className="text-xs text-slate-400">Total positions</p>
          </div>
          <div className="w-px h-10 bg-surface-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600 tabular-nums">{openJobs.length}</p>
            <p className="text-xs text-slate-400">Open</p>
          </div>
          <div className="w-px h-10 bg-surface-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-400 tabular-nums">{jobs.length - openJobs.length}</p>
            <p className="text-xs text-slate-400">Filled / closed</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-surface-border shadow-card">
          <EmptyState
            icon={<Icon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" className="w-5 h-5" />}
            title="No open positions"
            description="There are no active job postings at the moment. Check back later."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => {
            const dc = deptColors[j.department] || "bg-slate-100 text-slate-600";
            return (
              <div
                key={j.id}
                className="bg-white border border-surface-border rounded-xl p-5 hover:shadow-card-hover transition-all duration-200 shadow-card group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                      {/* Position icon */}
                      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-surface-border flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon path="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm">{j.title}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {j.department && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${dc}`}>
                              {j.department}
                            </span>
                          )}
                          {j.location && (
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <Icon path="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" className="w-3 h-3" />
                              {j.location}
                            </span>
                          )}
                          {j.openings && (
                            <span className="text-xs text-slate-400">
                              {j.openings} opening{j.openings !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        {j.description && (
                          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                            {j.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge label={j.status || "open"} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
