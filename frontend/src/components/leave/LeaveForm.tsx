import { useState } from "react";
import { submitLeave } from "../../api/leave";
import { useNotificationStore } from "../../store/notificationStore";
import { LEAVE_TYPES } from "../../utils/constants";
import { Button } from "../ui/Button";

export const LeaveForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [form, setForm] = useState({ leave_type: "casual", start_date: "", end_date: "", reason: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { add: notify } = useNotificationStore();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.start_date) e.start_date = "Start date is required";
    if (!form.end_date) e.end_date = "End date is required";
    // BUG-22 fix: client-side date validation
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      e.end_date = "End date must be on or after start date";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await submitLeave(form);
      notify("Leave request submitted successfully", "success");
      onSuccess();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Failed to submit leave request";
      notify(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Leave type</label>
        <select
          value={form.leave_type}
          onChange={(e) => setForm({ ...form, leave_type: e.target.value })}
          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          {LEAVE_TYPES.map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)} Leave</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Start date</label>
          <input
            type="date"
            value={form.start_date}
            min={today}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.start_date ? "border-red-400 bg-red-50" : "border-slate-200"}`}
          />
          {errors.start_date && <p className="mt-1 text-xs text-red-500">{errors.start_date}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">End date</label>
          <input
            type="date"
            value={form.end_date}
            min={form.start_date || today}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.end_date ? "border-red-400 bg-red-50" : "border-slate-200"}`}
          />
          {errors.end_date && <p className="mt-1 text-xs text-red-500">{errors.end_date}</p>}
        </div>
      </div>

      {form.start_date && form.end_date && form.end_date >= form.start_date && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700 font-medium">
          {Math.max(1, Math.floor((new Date(form.end_date).getTime() - new Date(form.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1)} day{Math.floor((new Date(form.end_date).getTime() - new Date(form.start_date).getTime()) / (1000 * 60 * 60 * 24)) > 0 ? "s" : ""} of leave
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason <span className="text-slate-400 font-normal">(optional)</span></label>
        <textarea
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
          placeholder="Brief reason for your leave request..."
          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="primary" onClick={submit} loading={loading} className="flex-1">
          Submit Request
        </Button>
      </div>
    </div>
  );
};
