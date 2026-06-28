import { useState } from "react";
import { submitLeave } from "../../api/leave";
import { useNotificationStore } from "../../store/notificationStore";
import { LEAVE_TYPES } from "../../utils/constants";
import { Button } from "../ui/Button";

const inputClass = (hasError: boolean) =>
  `w-full border rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
    hasError
      ? "border-red-400 bg-red-50/40 focus:ring-red-400"
      : "border-surface-border bg-white focus:ring-blue-500"
  }`;
const labelClass = "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide";

export const LeaveForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [form, setForm] = useState({
    leave_type: "casual",
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { add: notify } = useNotificationStore();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.start_date) e.start_date = "Start date is required";
    if (!form.end_date) e.end_date = "End date is required";
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
      notify(err?.response?.data?.detail || "Failed to submit leave request", "error");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const dayCount =
    form.start_date && form.end_date && form.end_date >= form.start_date
      ? Math.floor(
          (new Date(form.end_date).getTime() - new Date(form.start_date).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1
      : null;

  return (
    <div className="space-y-5">
      {/* Leave type */}
      <div>
        <label className={labelClass}>Leave type</label>
        <div className="relative">
          <select
            value={form.leave_type}
            onChange={(e) => setForm({ ...form, leave_type: e.target.value })}
            className="w-full border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer pr-8"
          >
            {LEAVE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)} Leave
              </option>
            ))}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>
            Start date <span className="text-red-400 normal-case font-normal">*</span>
          </label>
          <input
            type="date"
            value={form.start_date}
            min={today}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            className={inputClass(!!errors.start_date)}
          />
          {errors.start_date && (
            <p className="mt-1.5 text-xs text-red-500">{errors.start_date}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>
            End date <span className="text-red-400 normal-case font-normal">*</span>
          </label>
          <input
            type="date"
            value={form.end_date}
            min={form.start_date || today}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            className={inputClass(!!errors.end_date)}
          />
          {errors.end_date && (
            <p className="mt-1.5 text-xs text-red-500">{errors.end_date}</p>
          )}
        </div>
      </div>

      {/* Day count preview */}
      {dayCount !== null && (
        <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 animate-fade-in">
          <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-blue-800 font-medium">
            {dayCount} day{dayCount !== 1 ? "s" : ""} of{" "}
            <span className="capitalize">{form.leave_type}</span> leave
          </p>
        </div>
      )}

      {/* Reason */}
      <div>
        <label className={labelClass}>
          Reason{" "}
          <span className="text-slate-400 normal-case font-normal">(optional)</span>
        </label>
        <textarea
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
          placeholder="Brief reason for your leave request…"
          className="w-full border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white transition-all"
          rows={3}
        />
      </div>

      <Button
        variant="primary"
        onClick={submit}
        loading={loading}
        className="w-full justify-center"
      >
        Submit Leave Request
      </Button>
    </div>
  );
};
