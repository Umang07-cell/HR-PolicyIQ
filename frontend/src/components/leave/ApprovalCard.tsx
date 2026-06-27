import { useState } from "react";
import { LeaveRequest } from "../../types/models";
import { Badge } from "../common/Badge";
import { actionLeave } from "../../api/leave";
import { useNotificationStore } from "../../store/notificationStore";
import { formatDate } from "../../utils/formatters";
import { Button } from "../ui/Button";

export const ApprovalCard = ({ leave, onRefresh }: { leave: LeaveRequest; onRefresh: () => void }) => {
  const { add: notify } = useNotificationStore();
  const [actioning, setActioning] = useState<"approve" | "reject" | null>(null);
  const [comment, setComment] = useState("");

  const action = async (act: "approve" | "reject") => {
    setActioning(act);
    try {
      await actionLeave(leave.id, act, comment || undefined);
      notify(`Leave ${act}d successfully`, "success");
      onRefresh();
    } catch {
      notify("Action failed. Please try again.", "error");
    } finally {
      setActioning(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-slate-900">Employee #{leave.employee_id}</span>
            <Badge label={leave.leave_type} />
          </div>
          <p className="text-sm text-slate-600">{leave.days} day{leave.days !== 1 ? "s" : ""} · {formatDate(leave.start_date)} → {formatDate(leave.end_date)}</p>
          {leave.reason && (
            <p className="text-xs text-slate-400 mt-1 italic">"{leave.reason}"</p>
          )}
        </div>
        <Badge label={leave.status} />
      </div>

      {leave.status === "pending" && (
        <>
          <div className="mb-3">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment (optional)"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              className="flex-1 !bg-emerald-600 hover:!bg-emerald-700"
              onClick={() => action("approve")}
              loading={actioning === "approve"}
              disabled={!!actioning}
            >
              Approve
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="flex-1"
              onClick={() => action("reject")}
              loading={actioning === "reject"}
              disabled={!!actioning}
            >
              Reject
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
