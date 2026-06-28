import { useState } from "react";
import { fileGrievance } from "../../api/grievance";
import { useNotificationStore } from "../../store/notificationStore";
import { GRIEVANCE_PRIORITIES, GRIEVANCE_CATEGORIES } from "../../utils/constants";
import { Button } from "../ui/Button";

const inputClass = (hasError: boolean) =>
  `w-full border rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
    hasError
      ? "border-red-400 bg-red-50/40 focus:ring-red-400"
      : "border-surface-border bg-white focus:ring-blue-500"
  }`;
const labelClass = "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide";
const selectClass = "w-full border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none";

export const GrievanceForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "other",
    priority: "medium",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { add: notify } = useNotificationStore();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    else if (form.description.trim().length < 20)
      e.description = "Please provide more detail (at least 20 characters)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await fileGrievance(form);
      notify("Grievance filed successfully. HR will review it shortly.", "success");
      onSuccess();
    } catch {
      notify("Failed to file grievance. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <label className={labelClass}>
          Title <span className="text-red-400 normal-case font-normal">*</span>
        </label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Brief, clear title for your concern"
          className={inputClass(!!errors.title)}
        />
        {errors.title && <p className="mt-1.5 text-xs text-red-500">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>
          Description <span className="text-red-400 normal-case font-normal">*</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Describe the issue in detail — include dates, people involved, and the outcome you are seeking…"
          className={`${inputClass(!!errors.description)} resize-none`}
          rows={5}
        />
        {errors.description ? (
          <p className="mt-1.5 text-xs text-red-500">{errors.description}</p>
        ) : (
          <p className="mt-1 text-xs text-slate-400">
            {form.description.length} / 20 chars minimum
          </p>
        )}
      </div>

      {/* Category + Priority */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Category</label>
          <div className="relative">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={`${selectClass} pr-8`}
            >
              {GRIEVANCE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div>
          <label className={labelClass}>Priority</label>
          <div className="relative">
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className={`${selectClass} pr-8`}
            >
              {GRIEVANCE_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Confidentiality notice */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5">
        <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-xs text-amber-700 leading-relaxed">
          Your grievance will be handled <strong>confidentially</strong> by the HR team. All submissions are securely logged for compliance purposes.
        </p>
      </div>

      <Button
        variant="danger"
        onClick={submit}
        loading={loading}
        className="w-full justify-center"
      >
        Submit Grievance
      </Button>
    </div>
  );
};
