import { LeaveRequest } from "../../types/models";
export const LeaveCalendar = ({ leaves }: { leaves: LeaveRequest[] }) => (
  <div className="border rounded-lg p-4 bg-white">
    <p className="text-sm font-medium text-gray-700 mb-3">Recent Leave Requests</p>
    <div className="space-y-2">
      {leaves.slice(0, 5).map((l) => (
        <div key={l.id} className="flex justify-between text-xs">
          <span className="text-gray-600">{l.leave_type} ({l.days}d)</span>
          <span className={`font-medium ${l.status === "approved" ? "text-green-600" : l.status === "rejected" ? "text-red-500" : "text-yellow-600"}`}>{l.status}</span>
        </div>
      ))}
    </div>
  </div>
);
