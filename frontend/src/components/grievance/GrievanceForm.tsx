import { useState } from "react";
import { fileGrievance } from "../../api/grievance";
import { useNotificationStore } from "../../store/notificationStore";
import { GRIEVANCE_PRIORITIES, GRIEVANCE_CATEGORIES } from "../../utils/constants";
import { Button } from "../ui/Button";

export const GrievanceForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [form, setForm] = useState({ title: "", description: "", category: "other", priority: "medium" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { add: notify } = useNotificationStore();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (form.description.trim().length < 20) e.description = "Please provide more detail (at least 20 characters)";
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

  const field = (label: string, key: keyof typeof form, el: React.ReactNode) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {el}
      {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="space-y-4">
      {field("Title", "title",
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Brief title for your grievance" className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? "border-red-400" : "border-slate-200"}`} />
      )}
      {field("Description", "description",
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue in detail — include dates, people involved, and what outcome you are seeking..." className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.description ? "border-red-400" : "border-slate-200"}`} rows={5} />
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {GRIEVANCE_CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {GRIEVANCE_PRIORITIES.map((p) => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
        Your grievance will be handled confidentially by the HR team. All submissions are logged for compliance.
      </div>
      <Button variant="danger" onClick={submit} loading={loading} className="w-full">
        Submit Grievance
      </Button>
    </div>
  );
};
