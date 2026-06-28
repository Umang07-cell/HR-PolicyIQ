import { useState, useEffect, useCallback } from "react";
import { getMyLeaves, getPendingLeaves } from "../api/leave";
import { LeaveForm } from "../components/leave/LeaveForm";
import { ApprovalCard } from "../components/leave/ApprovalCard";
import { Modal } from "../components/common/Modal";
import { Badge } from "../components/common/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { CardSkeleton } from "../components/ui/Skeleton";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { usePermissions } from "../hooks/usePermissions";
import { useNotificationStore } from "../store/notificationStore";
import { LeaveRequest } from "../types/models";
import { formatDate } from "../utils/formatters";

const LeaveTypeColors: Record<string, string> = {
  casual:    "bg-blue-50 text-blue-700 border-blue-100",
  sick:      "bg-red-50 text-red-700 border-red-100",
  earned:    "bg-emerald-50 text-emerald-700 border-emerald-100",
  maternity: "bg-pink-50 text-pink-700 border-pink-100",
  paternity: "bg-purple-50 text-purple-700 border-purple-100",
  unpaid:    "bg-slate-50 text-slate-600 border-slate-200",
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "approved") return (
    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
  if (status === "rejected") return (
    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
  return (
    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
};

const Icon = ({ path }: { path: string }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
  </svg>
);

export default function LeavePage() {
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
  const [pending, setPending] = useState<LeaveRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<"my" | "pending">("my");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { canApproveLeave } = usePermissions();
  const { add: notify } = useNotificationStore();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await getMyLeaves();
      setMyLeaves(r.data);
      if (canApproveLeave) {
        const p = await getPendingLeaves();
        setPending(p.data);
      }
    } catch {
      setError("Failed to load leave data. Please try again.");
      notify("Failed to load leaves", "error");
    } finally {
      setLoading(false);
    }
  }, [canApproveLeave, notify]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6 max-w-5xl mx-auto page-enter">
      <PageHeader
        title="Leave Management"
        subtitle="Apply for leave, track requests, and manage approvals"
        breadcrumb={[{ label: "Workspace" }, { label: "Leave" }]}
        action={
          <Button
            onClick={() => setShowForm(true)}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Request Leave
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-0.5 bg-surface-tertiary border border-surface-border rounded-xl p-1 w-fit mb-6">
        <button
          onClick={() => setTab("my")}
          className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
            tab === "my"
              ? "bg-white text-slate-900 shadow-card"
              : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
          }`}
        >
          My Requests
          {myLeaves.length > 0 && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center ${tab === "my" ? "bg-slate-100 text-slate-600" : "bg-surface-border text-slate-500"}`}>
              {myLeaves.length}
            </span>
          )}
        </button>
        {canApproveLeave && (
          <button
            onClick={() => setTab("pending")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
              tab === "pending"
                ? "bg-white text-slate-900 shadow-card"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
            }`}
          >
            Pending Approvals
            {pending.length > 0 && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center bg-amber-100 text-amber-700">
                {pending.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={load} className="text-sm text-red-600 underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* My Requests */}
      {tab === "my" && (
        <div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : myLeaves.length === 0 ? (
            <div className="bg-white rounded-xl border border-surface-border shadow-card">
              <EmptyState
                icon={<Icon path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
                title="No leave requests"
                description="Your submitted leave requests will appear here."
                action={{ label: "Request Leave", onClick: () => setShowForm(true) }}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {myLeaves.map((l) => (
                <div
                  key={l.id}
                  className="bg-white border border-surface-border rounded-xl p-4 hover:shadow-card-hover transition-all duration-200 shadow-card"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <StatusIcon status={l.status} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-md border capitalize ${
                              LeaveTypeColors[l.leave_type] || "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {l.leave_type}
                          </span>
                          <span className="text-sm font-semibold text-slate-800">
                            {l.days} day{l.days !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatDate(l.start_date)} → {formatDate(l.end_date)}
                        </p>
                        {l.reason && (
                          <p className="text-xs text-slate-400 mt-1 italic">"{l.reason}"</p>
                        )}
                      </div>
                    </div>
                    <Badge label={l.status} />
                  </div>
                  {l.approver_comment && (
                    <div className="mt-3 pt-3 border-t border-surface-border flex items-start gap-2">
                      <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <p className="text-xs text-slate-500 leading-snug">
                        <span className="font-medium">Approver note:</span> {l.approver_comment}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pending Approvals */}
      {tab === "pending" && canApproveLeave && (
        <div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : pending.length === 0 ? (
            <div className="bg-white rounded-xl border border-surface-border shadow-card">
              <EmptyState
                icon={<Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                title="No pending approvals"
                description="All leave requests have been reviewed."
              />
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((l) => <ApprovalCard key={l.id} leave={l} onRefresh={load} />)}
            </div>
          )}
        </div>
      )}

      {showForm && (
        <Modal title="Request Leave" description="Submit a new leave request for approval" onClose={() => setShowForm(false)}>
          <LeaveForm onSuccess={() => { setShowForm(false); load(); }} />
        </Modal>
      )}
    </div>
  );
}
