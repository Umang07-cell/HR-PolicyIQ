import { useState } from "react";
import { LeaveRequest } from "../../types/models";
import { Badge } from "../common/Badge";
import { actionLeave } from "../../api/leave";
import { useNotificationStore } from "../../store/notificationStore";
import { formatDate } from "../../utils/formatters";
import { Button } from "../ui/Button";

const leaveTypeColors: Record<string, string> = {
  casual:    "bg-blue-50 text-blue-700 border-blue-100",
  sick:      "bg-red-50 text-red-700 border-red-100",
  earned:    "bg-emerald-50 text-emerald-700 border-emerald-100",
  maternity: "bg-pink-50 text-pink-700 border-pink-100",
  paternity: "bg-purple-50 text-purple-700 border-purple-100",
  unpaid:    "bg-slate-50 text-slate-600 border-slate-200",
};

export const ApprovalCard = ({
  leave,
  onRefresh,
}: {
  leave: LeaveRequest;
  onRefresh: () => void;
}) => {
  const { add: notify } = useNotificationStore();
  const [actioning, setActioning] = useState<"approve" | "reject" | null>(null);
  const [comment, setComment] = useState("");

  const action = async (act: "approve" | "reject") => {
    setActioning(act);
    try {
      await actionLeave(leave.id, act, comment || undefined);
      notify(`Leave ${act === "approve" ? "approved" : "rejected"} successfully`, "success");
      onRefresh();
    } catch {
      notify("Action failed. Please try again.", "error");
    } finally {
      setActioning(null);
    }
  };

  return (
    <div className="bg-white border border-surface-border rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {String(leave.employee_id).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">Employee #{leave.employee_id}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md border capitalize ${leaveTypeColors[leave.leave_type] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                {leave.leave_type}
              </span>
              <span className="text-xs text-slate-500">
                {leave.days} day{leave.days !== 1 ? "s" : ""}
              </span>
              <span className="text-xs text-slate-400">
                {formatDate(leave.start_date)} → {formatDate(leave.end_date)}
              </span>
            </div>
            {leave.reason && (
              <p className="text-xs text-slate-400 mt-1.5 italic leading-snug">"{leave.reason}"</p>
            )}
          </div>
        </div>
        <Badge label={leave.status} />
      </div>

      {leave.status === "pending" && (
        <div className="space-y-3 pt-3 border-t border-surface-border">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment (optional)"
            className="w-full border border-surface-border rounded-xl px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 bg-surface-secondary"
          />
          <div className="flex gap-2">
            <button
              onClick={() => action("approve")}
              disabled={!!actioning}
              className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {actioning === "approve" ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
              Approve
            </button>
            <button
              onClick={() => action("reject")}
              disabled={!!actioning}
              className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-semibold py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {actioning === "reject" ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
