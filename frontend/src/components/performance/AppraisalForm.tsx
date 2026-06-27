import { useState } from "react";
import { createReview } from "../../api/performance";
import { useNotificationStore } from "../../store/notificationStore";
import { Button } from "../ui/Button";

const Stars = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button key={s} type="button" onClick={() => onChange(s)} className="focus:outline-none transition-transform hover:scale-110">
        <svg className={`w-7 h-7 ${s <= value ? "text-amber-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </button>
    ))}
    <span className="text-sm text-slate-500 ml-2">{value}/5</span>
  </div>
);

export const AppraisalForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [form, setForm] = useState({ employee_id: "", review_period: "", rating: 3, goals: "", achievements: "", feedback: "" });
  const [loading, setLoading] = useState(false);
  const { add: notify } = useNotificationStore();

  const submit = async () => {
    if (!form.employee_id || !form.review_period) { notify("Employee ID and review period are required", "error"); return; }
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

  const textField = (label: string, key: keyof typeof form, placeholder: string, rows = 2) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <textarea value={form[key] as string} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder}
        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" rows={rows} />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Employee ID</label>
          <input type="number" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} placeholder="e.g. 42"
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Review Period</label>
          <input value={form.review_period} onChange={(e) => setForm({ ...form, review_period: e.target.value })} placeholder="e.g. 2025-H1"
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Overall Rating</label>
        <Stars value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
      </div>
      {textField("Goals", "goals", "List the goals set for this period...")}
      {textField("Achievements", "achievements", "Key accomplishments during this period...")}
      {textField("Feedback", "feedback", "Constructive feedback and development areas...", 3)}
      <Button onClick={submit} loading={loading} className="w-full">Submit Review</Button>
    </div>
  );
};
