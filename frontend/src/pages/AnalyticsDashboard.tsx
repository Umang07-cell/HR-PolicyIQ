import { useState, useEffect, useCallback } from "react";
import { getAnalytics, getChatUsage, getChatFeedback, deleteChatFeedback } from "../api/admin";
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import { TableSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { useNotificationStore } from "../store/notificationStore";

const Icon = ({ path }: { path: string }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
  </svg>
);

export default function AnalyticsDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [chatUsage, setChatUsage] = useState<any>(null);
  const [chatFeedback, setChatFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { add: notify } = useNotificationStore();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ovRes, cuRes, cfRes] = await Promise.allSettled([
        getAnalytics(),
        getChatUsage(),
        getChatFeedback(),
      ]);
      if (ovRes.status === "fulfilled") setOverview(ovRes.value.data);
      else notify("Failed to load overview metrics", "error");
      if (cuRes.status === "fulfilled") setChatUsage(cuRes.value.data);
      else notify("Failed to load chat usage", "error");
      if (cfRes.status === "fulfilled") setChatFeedback(cfRes.value.data);
      else notify("Failed to load chat feedback", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  const handleDeleteFeedback = async (id: number) => {
    try {
      await deleteChatFeedback(id);
      setChatFeedback((prev) => prev.filter((fb) => fb.id !== id));
      notify("Feedback deleted successfully", "success");
    } catch (err) {
      notify("Failed to delete feedback", "error");
    }
  };

  useEffect(() => { load(); }, [load]);

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
                label="Total Queries"
                value={overview.total_queries ?? chatUsage?.total_queries ?? "—"}
                color="blue"
                icon={<Icon path="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />}
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
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

          {/* User Feedback & Suggestions */}
          <div className="bg-white rounded-xl border border-surface-border p-6 shadow-card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-slate-900">User Feedback & Suggestions</h2>
                <p className="text-xs text-slate-400 mt-0.5">Negative feedback from HR Assistant</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
            </div>

            {chatFeedback.length === 0 ? (
              <EmptyState
                size="sm"
                title="No negative feedback"
                description="The HR Assistant is performing well! No negative feedback reported recently."
                icon={<Icon path="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />}
              />
            ) : (
              <div className="space-y-4">
                {chatFeedback.map((fb) => (
                  <div key={fb.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 group relative">
                    <button
                      onClick={() => handleDeleteFeedback(fb.id)}
                      className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete feedback"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <div className="flex justify-between items-start mb-2 pr-8">
                      <div className="text-sm font-medium text-slate-900 line-clamp-2">"{fb.query}"</div>
                      <div className="text-xs text-slate-400 whitespace-nowrap ml-4">
                        {new Date(fb.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    {fb.suggestion && (
                      <div className="mt-2 text-sm text-slate-600 bg-white p-3 rounded border border-slate-200">
                        <span className="font-semibold text-slate-700">Suggestion:</span> {fb.suggestion}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-slate-500">
                      Reported by <span className="font-medium">{fb.user_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
