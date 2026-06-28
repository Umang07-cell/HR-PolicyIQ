import { useState } from "react";
import { createReview } from "../../api/performance";
import { useNotificationStore } from "../../store/notificationStore";
import { Button } from "../ui/Button";

const inputClass =
  "w-full border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
const labelClass = "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide";

const ratingLabels: Record<number, string> = {
  1: "Needs improvement",
  2: "Below expectations",
  3: "Meets expectations",
  4: "Exceeds expectations",
  5: "Outstanding",
};

const StarRating = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => (
  <div>
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
          aria-label={`Rate ${s}`}
        >
          <svg
            className={`w-8 h-8 transition-colors ${s <= value ? "text-amber-400" : "text-slate-200 hover:text-amber-200"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
      <span className="text-sm text-slate-500 ml-1">{value}/5</span>
    </div>
    {value > 0 && (
      <p className="text-xs text-amber-600 font-medium mt-1.5">{ratingLabels[value]}</p>
    )}
  </div>
);

export const AppraisalForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [form, setForm] = useState({
    employee_id: "",
    review_period: "",
    rating: 3,
    goals: "",
    achievements: "",
    feedback: "",
  });
  const [loading, setLoading] = useState(false);
  const { add: notify } = useNotificationStore();

  const submit = async () => {
    if (!form.employee_id || !form.review_period) {
      notify("Employee ID and review period are required", "error");
      return;
    }
    setLoading(true);
    try {
      await createReview({ ...form, employee_id: parseInt(form.employee_id) });
      notify("Performance review created successfully", "success");
      onSuccess();
    } catch (err: any) {
      notify(err?.response?.data?.detail || "Failed to create review", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Employee ID <span className="text-red-400 normal-case font-normal">*</span></label>
          <input
            type="number"
            value={form.employee_id}
            onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
            placeholder="e.g. 42"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Review period <span className="text-red-400 normal-case font-normal">*</span></label>
          <input
            value={form.review_period}
            onChange={(e) => setForm({ ...form, review_period: e.target.value })}
            placeholder="e.g. 2025-H1"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Overall rating</label>
        <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
      </div>

      {(["goals", "achievements", "feedback"] as const).map((key) => (
        <div key={key}>
          <label className={labelClass}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
          <textarea
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            placeholder={
              key === "goals"
                ? "List the goals set for this period…"
                : key === "achievements"
                ? "Key accomplishments during this review period…"
                : "Constructive feedback and areas for development…"
            }
            className={`${inputClass} resize-none`}
            rows={key === "feedback" ? 4 : 3}
          />
        </div>
      ))}

      <Button onClick={submit} loading={loading} className="w-full justify-center">
        Submit Review
      </Button>
    </div>
  );
};
